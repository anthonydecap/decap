import "server-only";
import type { z } from "zod";
import type { Customer, Prisma, SoftwareActivationStatus } from "@/generated/shop-prisma/client";
import { activationNumber, licenseNumber, normaliseRegistrationCode, OPEN_ACTIVATION_STATUSES } from "../domain/software-status";
import { shopDb, type ShopTx } from "../db";
import { ShopError, notFound } from "../errors";
import type { activationRespondSchema, activationStaffSchema, activationSubmitSchema, adminLicenseSchema } from "../schemas";
import { decryptActivationKey, encryptActivationKey } from "./activation-key";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { ensurePlayerForInstallation, moveLibraryForReplacement, syncPlayerStatusFromInstallation } from "./player-sync";
import { appUrl, notify } from "./email";

/**
 * Software licensing and manual activation.
 *
 *   SoftwareLicense            the commercial right (created by the webhook, or by staff)
 *   SoftwareActivationRequest  a customer's registration code waiting for the proprietary EXE
 *   SoftwareInstallation       an approved, activated installation with its encrypted key
 *
 * The EXE is run by staff outside this system; nothing here generates or derives a key.
 * Activation keys are encrypted at rest, never logged, never put in audit / timeline
 * metadata, and decrypted only through an explicit reveal by the owning customer or by
 * staff holding `software:activation-key`.
 */

type Staff = { staffId: string };
const staffActor = (s: Staff) => ({ type: "STAFF" as const, staffId: s.staffId });
const OPEN = [...OPEN_ACTIVATION_STATUSES] as SoftwareActivationStatus[];

const customerName = (c: { firstName: string | null; lastName: string | null; companyName?: string | null; email: string }) =>
  [c.firstName, c.lastName].filter(Boolean).join(" ") || c.companyName || c.email;

const softwareLink = (c: { preferredLanguage: string | null }, slug: string) => appUrl(`/${c.preferredLanguage ?? "en"}/shop/account/software/${slug}`);

// ─── License creation ────────────────────────────────────────────────────────

/** Called inside the webhook fulfillment transaction. Idempotent per order line. */
export async function createLicensesForOrder(tx: ShopTx, order: { id: string; customerId: string }) {
  const lines = await tx.orderItem.findMany({
    where: { orderId: order.id, itemType: "SOFTWARE_LICENSE" },
    include: { softwareProduct: true, softwareLicense: true },
  });
  const created: { id: string; number: number; productName: string; slug: string }[] = [];
  for (const line of lines) {
    if (line.softwareLicense || !line.softwareProduct) continue;
    const lic = await tx.softwareLicense.create({
      data: {
        customerId: order.customerId,
        softwareProductId: line.softwareProduct.id,
        orderId: order.id,
        orderItemId: line.id,
        status: "PENDING_ACTIVATION",
        licenseType: line.softwareProduct.licenseType,
        maxActivations: line.softwareProduct.defaultMaxActivations,
        licenseSource: "PURCHASE",
      },
    });
    await recordActivity({
      tx, customerId: order.customerId, type: "software.license_purchased",
      summary: `Bought a ${line.softwareProduct.name} license (${licenseNumber(lic.number)}), activation required`,
      metadata: { softwareLicenseId: lic.id, softwareProductId: line.softwareProduct.id, orderId: order.id },
    });
    created.push({ id: lic.id, number: lic.number, productName: line.softwareProduct.name, slug: line.softwareProduct.slug });
  }
  return created;
}

export async function notifyLicensesPurchased(customerId: string, licenses: { number: number; productName: string; slug: string }[]) {
  if (!licenses.length) return;
  const c = await shopDb().customer.findUnique({ where: { id: customerId } });
  if (!c) return;
  for (const l of licenses) {
    await notify({
      to: c.email,
      subject: `Your ${l.productName} license: one more step`,
      text: `Thank you for buying ${l.productName} (${licenseNumber(l.number)}). To activate it, open ${l.productName}, copy the Registration Code shown in its registration screen, and enter it in your account. We will email you when your activation key is ready.`,
      actionUrl: softwareLink(c, l.slug),
      actionLabel: "Enter your registration code",
    });
  }
}

/** Staff-created license (manual, promotion or legacy). Never creates a fake order. */
export async function adminCreateLicense(s: Staff, input: z.infer<typeof adminLicenseSchema>) {
  const db = shopDb();
  const [customer, product] = await Promise.all([
    db.customer.findUnique({ where: { id: input.customerId } }),
    db.softwareProduct.findUnique({ where: { id: input.softwareProductId } }),
  ]);
  if (!customer) throw notFound("Customer");
  if (!product) throw notFound("Software product");
  const inst = input.installation;
  const code = inst ? normaliseRegistrationCode(inst.registrationCode) : null;
  if (code) {
    const clash = await db.softwareInstallation.findFirst({ where: { registrationCode: code, status: "ACTIVE" } });
    if (clash) throw new ShopError("CONFLICT", "That registration code is already active on another installation. Retire it first.");
  }
  let createdInstallationId: string | null = null;
  const created = await db.$transaction(async (tx) => {
    const now = new Date();
    const lic = await tx.softwareLicense.create({
      data: {
        customerId: customer.id,
        softwareProductId: product.id,
        status: inst ? "ACTIVE" : "PENDING_ACTIVATION",
        licenseType: product.licenseType,
        maxActivations: input.maxActivations ?? product.defaultMaxActivations,
        licenseSource: input.licenseSource,
        sourceReference: input.sourceReference,
        notes: input.notes,
        activatedAt: inst ? now : null,
        createdByStaffId: s.staffId,
      },
    });
    if (inst && code) {
      createdInstallationId = (await tx.softwareInstallation.create({
        data: {
          customerId: customer.id, softwareProductId: product.id, softwareLicenseId: lic.id,
          registrationCode: code,
          registrationIdentifier: normaliseRegistrationCode(inst.registrationIdentifier ?? code),
          activationKeyEncrypted: inst.activationKey ? encryptActivationKey(inst.activationKey) : null,
          status: "ACTIVE", label: inst.label, activatedAt: now, createdByStaffId: s.staffId,
        },
      })).id;
    }
    await recordActivity({
      tx, customerId: customer.id, staffId: s.staffId, type: "software.license_created",
      summary: `${product.name} license ${licenseNumber(lic.number)} added by staff (${input.licenseSource.replace("_", " ").toLowerCase()})${inst ? " with an existing installation" : ""}`,
      metadata: { softwareLicenseId: lic.id, source: input.licenseSource },
    });
    await audit(staffActor(s), "software_license.create", { type: "SoftwareLicense", id: lic.id }, {
      customerId: customer.id, productId: product.id, source: input.licenseSource, withInstallation: Boolean(inst), keyStored: Boolean(inst?.activationKey),
    }, tx);
    return lic;
  });
  // A player product activated on a computer is a player: create / link it.
  if (createdInstallationId) await ensurePlayerForInstallation(createdInstallationId, s.staffId);
  return created;
}

export async function setLicenseStatus(s: Staff, licenseId: string, status: "ACTIVE" | "SUSPENDED" | "REVOKED", reason: string) {
  const db = shopDb();
  return db.$transaction(async (tx) => {
    const lic = await tx.softwareLicense.findUnique({ where: { id: licenseId }, include: { product: true, installations: true } });
    if (!lic) throw notFound("License");
    if (lic.status === status) return lic;
    if (lic.status === "REVOKED") throw new ShopError("INVALID_STATE", "A revoked license cannot be changed. Create a new license instead.");
    const now = new Date();
    const hasActive = lic.installations.some((i) => i.status === "ACTIVE" || i.status === "SUSPENDED");
    const updated = await tx.softwareLicense.update({
      where: { id: lic.id },
      data: {
        status: status === "ACTIVE" ? (hasActive ? "ACTIVE" : "PENDING_ACTIVATION") : status,
        statusReason: reason,
        ...(status === "SUSPENDED" ? { suspendedAt: now } : {}),
        ...(status === "REVOKED" ? { revokedAt: now } : {}),
        ...(status === "ACTIVE" ? { suspendedAt: null } : {}),
      },
    });
    // Installations follow the license; history is kept, never deleted.
    if (status === "SUSPENDED") {
      await tx.softwareInstallation.updateMany({ where: { softwareLicenseId: lic.id, status: "ACTIVE" }, data: { status: "SUSPENDED", suspendedAt: now } });
    } else if (status === "ACTIVE") {
      await tx.softwareInstallation.updateMany({ where: { softwareLicenseId: lic.id, status: "SUSPENDED" }, data: { status: "ACTIVE", suspendedAt: null } });
    } else {
      await tx.softwareInstallation.updateMany({ where: { softwareLicenseId: lic.id, status: { in: ["ACTIVE", "SUSPENDED"] } }, data: { status: "DEACTIVATED" } });
      await tx.softwareActivationRequest.updateMany({ where: { softwareLicenseId: lic.id, status: { in: OPEN } }, data: { status: "CANCELLED" } });
    }
    // A player is its software: the players on these installations follow (never retired here,
    // so reinstating the license brings them and their music straight back).
    await syncPlayersForLicense(tx, lic.id, status === "ACTIVE" ? "ACTIVE" : "SUSPENDED", s.staffId);
    await recordActivity({
      tx, customerId: lic.customerId, staffId: s.staffId,
      type: status === "SUSPENDED" ? "software.license_suspended" : status === "REVOKED" ? "software.license_revoked" : "software.license_reinstated",
      summary: `${lic.product.name} ${licenseNumber(lic.number)} ${status === "SUSPENDED" ? "suspended" : status === "REVOKED" ? "revoked" : "reinstated"}: ${reason}`,
      metadata: { softwareLicenseId: lic.id },
    });
    await audit(staffActor(s), `software_license.${status.toLowerCase()}`, { type: "SoftwareLicense", id: lic.id }, { from: lic.status, reason }, tx);
    return updated;
  });
}

export async function updateLicense(s: Staff, licenseId: string, input: { maxActivations?: number; notes?: string | null }) {
  const lic = await shopDb().softwareLicense.findUnique({ where: { id: licenseId } });
  if (!lic) throw notFound("License");
  const updated = await shopDb().softwareLicense.update({ where: { id: licenseId }, data: input });
  await audit(staffActor(s), "software_license.update", { type: "SoftwareLicense", id: licenseId }, {
    maxActivations: input.maxActivations ?? undefined, from: lic.maxActivations,
  });
  return updated;
}

/** Refund of a software order line: license revoked, installations kept as history. */
export async function revokeLicenseForRefund(tx: ShopTx, orderItemId: string, refundId: string, staffId: string | null) {
  const lic = await tx.softwareLicense.findUnique({ where: { orderItemId }, include: { product: true } });
  if (!lic || lic.status === "REVOKED") return;
  const now = new Date();
  await tx.softwareLicense.update({ where: { id: lic.id }, data: { status: "REVOKED", revokedAt: now, statusReason: `refund:${refundId}` } });
  await tx.softwareInstallation.updateMany({ where: { softwareLicenseId: lic.id, status: { in: ["ACTIVE", "SUSPENDED"] } }, data: { status: "DEACTIVATED" } });
  await tx.softwareActivationRequest.updateMany({ where: { softwareLicenseId: lic.id, status: { in: OPEN } }, data: { status: "CANCELLED" } });
  await syncPlayersForLicense(tx, lic.id, "SUSPENDED", staffId);
  await recordActivity({
    tx, customerId: lic.customerId, staffId, type: "software.license_revoked",
    summary: `${lic.product.name} ${licenseNumber(lic.number)} revoked after refund. Already activated offline copies keep their local state.`,
    metadata: { softwareLicenseId: lic.id, refundId },
  });
}

/** Players running on a license's installations follow the license (ACTIVE / SUSPENDED). */
async function syncPlayersForLicense(tx: ShopTx, licenseId: string, status: "ACTIVE" | "SUSPENDED", staffId: string | null) {
  const now = new Date();
  await tx.registeredPlayer.updateMany({
    where: {
      status: status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
      softwareInstallations: { some: { softwareLicenseId: licenseId, ...(status === "ACTIVE" ? { status: "ACTIVE" } : {}) } },
    },
    data: { status, updatedByStaffId: staffId, ...(status === "SUSPENDED" ? { suspendedAt: now } : { suspendedAt: null }) },
  });
}

// ─── Customer: activation requests ───────────────────────────────────────────

async function ownedLicense(customerId: string, licenseId: string) {
  const lic = await shopDb().softwareLicense.findFirst({ where: { id: licenseId, customerId }, include: { product: true } });
  if (!lic) throw notFound("License");
  return lic;
}

async function findConflict(code: string, excludeInstallationIds: string[]) {
  return shopDb().softwareInstallation.findFirst({
    where: { registrationCode: code, status: "ACTIVE", id: { notIn: excludeInstallationIds } },
    select: { id: true, customerId: true },
  });
}

export async function submitActivation(customer: Customer, licenseId: string, input: z.infer<typeof activationSubmitSchema>) {
  const db = shopDb();
  const lic = await ownedLicense(customer.id, licenseId);
  if (lic.status === "SUSPENDED" || lic.status === "REVOKED") {
    throw new ShopError("INVALID_STATE", "This license cannot be activated right now. Please contact support.");
  }
  if (await db.softwareActivationRequest.findFirst({ where: { softwareLicenseId: lic.id, status: { in: OPEN } } })) {
    throw new ShopError("CONFLICT", "We are already processing a registration code for this license.");
  }
  const code = normaliseRegistrationCode(input.registrationCode);
  if (!/^[A-Z0-9]{4,64}$/.test(code)) throw new ShopError("VALIDATION_FAILED", "That does not look like a registration code. Copy it exactly as shown in the software.");

  const active = await db.softwareInstallation.findMany({ where: { softwareLicenseId: lic.id, status: "ACTIVE" } });
  let replaces: string | null = null;
  if (input.replacesInstallationId) {
    const r = active.find((i) => i.id === input.replacesInstallationId);
    if (!r) throw new ShopError("VALIDATION_FAILED", "Choose one of your active installations to replace");
    replaces = r.id;
  } else if (active.length >= lic.maxActivations) {
    throw new ShopError("CONFLICT", "All activations for this license are in use. Tell us which installation you are replacing.");
  }
  // Same code already active on *this* license (e.g. reinstall): treat as replacing it.
  const sameHere = active.find((i) => i.registrationCode === code);
  if (sameHere && !replaces) replaces = sameHere.id;
  const conflict = await findConflict(code, replaces ? [replaces] : []);

  const req = await db.$transaction(async (tx) => {
    const r = await tx.softwareActivationRequest.create({
      data: {
        softwareLicenseId: lic.id, softwareProductId: lic.softwareProductId, customerId: customer.id,
        registrationCode: code, customerMessage: input.message, replacesInstallationId: replaces,
        conflictInstallationId: conflict?.id ?? null,
      },
    });
    // Manual fulfillment work goes on the existing CRM task list.
    await tx.customerTask.create({
      data: {
        customerId: customer.id,
        softwareActivationRequestId: r.id,
        title: `Generate ${lic.product.name} activation for ${customerName(customer)} (${activationNumber(r.number)})`,
        description: conflict ? "Registration code is already active on another installation: review before approving." : null,
        priority: conflict ? "HIGH" : "NORMAL",
        dueAt: new Date(new Date().setHours(23, 59, 0, 0)),
      },
    });
    await recordActivity({
      tx, customerId: customer.id, type: "software.activation_requested",
      summary: `Submitted a registration code for ${lic.product.name} (${activationNumber(r.number)})${conflict ? ", needs review" : ""}`,
      metadata: { softwareActivationRequestId: r.id, softwareLicenseId: lic.id, conflict: Boolean(conflict) },
    });
    await audit({ type: "CUSTOMER", customerId: customer.id }, "software_activation.submitted", { type: "SoftwareActivationRequest", id: r.id }, {
      conflict: Boolean(conflict), replacement: Boolean(replaces),
    }, tx);
    return r;
  });

  await notify({
    to: customer.email,
    subject: `We received your ${lic.product.name} registration code`,
    text: `We received your registration code for ${lic.product.name} (${activationNumber(req.number)}). We will email you when your activation key is ready to copy from your account.`,
    actionUrl: softwareLink(customer, lic.product.slug),
    actionLabel: "View your license",
  });
  return req;
}

/** The customer answers an information request (optionally with a corrected code). */
export async function respondToActivation(customer: Customer, requestId: string, input: z.infer<typeof activationRespondSchema>) {
  const db = shopDb();
  const r = await db.softwareActivationRequest.findFirst({ where: { id: requestId, customerId: customer.id }, include: { product: true } });
  if (!r) throw notFound("Activation request");
  if (r.status !== "WAITING_FOR_CUSTOMER") throw new ShopError("INVALID_STATE", "We are not waiting for information on this request.");
  const code = input.registrationCode ? normaliseRegistrationCode(input.registrationCode) : r.registrationCode;
  const conflict = await findConflict(code, r.replacesInstallationId ? [r.replacesInstallationId] : []);
  await db.$transaction(async (tx) => {
    await tx.softwareActivationRequest.update({
      where: { id: r.id },
      data: {
        status: "SUBMITTED", registrationCode: code, conflictInstallationId: conflict?.id ?? null,
        customerMessage: [r.customerMessage, input.message].filter(Boolean).join("\n\n").slice(0, 4000),
      },
    });
    await recordActivity({
      tx, customerId: customer.id, type: "software.activation_customer_replied",
      summary: `Replied on ${activationNumber(r.number)}${input.registrationCode ? " with a new registration code" : ""}`,
      metadata: { softwareActivationRequestId: r.id },
    });
  });
}

export async function cancelActivation(customer: Customer, requestId: string) {
  const r = await shopDb().softwareActivationRequest.findFirst({ where: { id: requestId, customerId: customer.id } });
  if (!r) throw notFound("Activation request");
  if (!OPEN.includes(r.status)) throw new ShopError("INVALID_STATE", "This request is already closed.");
  await shopDb().$transaction(async (tx) => {
    await tx.softwareActivationRequest.update({ where: { id: r.id }, data: { status: "CANCELLED" } });
    await tx.customerTask.updateMany({ where: { softwareActivationRequestId: r.id, status: { in: ["OPEN", "IN_PROGRESS"] } }, data: { status: "CANCELLED" } });
    await recordActivity({ tx, customerId: customer.id, type: "software.activation_cancelled", summary: `Cancelled ${activationNumber(r.number)}` });
  });
}

/** Owning customer reveals the key of an ACTIVE installation. Audited; never cached. */
export async function customerRevealKey(customer: Customer, installationId: string) {
  const inst = await shopDb().softwareInstallation.findFirst({
    where: { id: installationId, customerId: customer.id, status: "ACTIVE", license: { customerId: customer.id, status: "ACTIVE" } },
    select: { id: true, activationKeyEncrypted: true },
  });
  if (!inst) throw notFound("Installation");
  if (!inst.activationKeyEncrypted) throw new ShopError("UNAVAILABLE", "No activation key is stored for this installation. Please contact support.");
  await audit({ type: "CUSTOMER", customerId: customer.id }, "software_installation.key_revealed", { type: "SoftwareInstallation", id: inst.id });
  return decryptActivationKey(inst.activationKeyEncrypted);
}

// ─── Staff: activation queue ─────────────────────────────────────────────────

export const ACTIVATION_FILTERS = {
  needs_action: "Needs staff action",
  new: "New",
  in_review: "In review",
  waiting_customer: "Waiting for customer",
  conflicts: "Conflicts",
  mine: "My activations",
  approved: "Approved",
  rejected: "Rejected",
  all: "All",
} as const;
export type ActivationFilter = keyof typeof ACTIVATION_FILTERS;

function queueWhere(filter: ActivationFilter, staffId: string): Prisma.SoftwareActivationRequestWhereInput {
  switch (filter) {
    case "needs_action": return { status: { in: ["SUBMITTED", "IN_REVIEW"] } };
    case "new": return { status: "SUBMITTED" };
    case "in_review": return { status: "IN_REVIEW" };
    case "waiting_customer": return { status: "WAITING_FOR_CUSTOMER" };
    case "conflicts": return { status: { in: OPEN }, conflictInstallationId: { not: null } };
    case "mine": return { assignedStaffId: staffId, status: { in: OPEN } };
    case "approved": return { status: "APPROVED" };
    case "rejected": return { status: "REJECTED" };
    default: return {};
  }
}

export async function activationQueue(params: { filter?: ActivationFilter; productId?: string; q?: string; page?: number; staffId: string }) {
  const db = shopDb();
  const filter: ActivationFilter = params.filter && params.filter in ACTIVATION_FILTERS ? params.filter : "needs_action";
  const q = params.q?.trim();
  const num = q ? /^(?:ACT-?)?(\d+)$/i.exec(q)?.[1] : undefined;
  const where: Prisma.SoftwareActivationRequestWhereInput = {
    AND: [
      queueWhere(filter, params.staffId),
      params.productId ? { softwareProductId: params.productId } : {},
      q ? {
        OR: [
          ...(num ? [{ number: Number(num) }] : []),
          { registrationCode: { contains: normaliseRegistrationCode(q) } },
          { customer: { email: { contains: q, mode: "insensitive" } } },
          { customer: { lastName: { contains: q, mode: "insensitive" } } },
          { customer: { companyName: { contains: q, mode: "insensitive" } } },
        ],
      } : {},
    ],
  };
  const page = Math.max(params.page ?? 1, 1);
  const open = ["needs_action", "new", "in_review", "waiting_customer", "conflicts", "mine"].includes(filter);
  const [total, items, counts] = await Promise.all([
    db.softwareActivationRequest.count({ where }),
    db.softwareActivationRequest.findMany({
      where,
      orderBy: open ? [{ submittedAt: "asc" }] : [{ updatedAt: "desc" }],
      skip: (page - 1) * 50,
      take: 50,
      select: {
        id: true, number: true, status: true, registrationCode: true, submittedAt: true, updatedAt: true, conflictInstallationId: true,
        replacesInstallationId: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
        product: { select: { id: true, name: true } },
        license: { select: { id: true, number: true, licenseSource: true } },
        assignedStaff: { select: { id: true, displayName: true, email: true } },
      },
    }),
    Promise.all((["needs_action", "new", "waiting_customer", "conflicts", "mine"] as ActivationFilter[]).map(async (f) =>
      [f, await db.softwareActivationRequest.count({ where: queueWhere(f, params.staffId) })] as const)),
  ]);
  return { filter, total, page, pageCount: Math.max(Math.ceil(total / 50), 1), items, counts: Object.fromEntries(counts) as Record<ActivationFilter, number> };
}

/** Staff view of one request. The activation key is never included (installations expose `hasActivationKey`). */
export async function getActivationRequest(id: string) {
  const r = await shopDb().softwareActivationRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true, phone: true } },
      product: { select: { id: true, name: true, slug: true } },
      license: {
        select: {
          id: true, number: true, status: true, maxActivations: true, licenseSource: true, purchasedAt: true,
          order: { select: { id: true, number: true } },
          installations: {
            orderBy: { createdAt: "desc" },
            select: { id: true, status: true, registrationCode: true, label: true, activatedAt: true, retiredAt: true, activationKeyEncrypted: true },
          },
        },
      },
      assignedStaff: { select: { id: true, displayName: true, email: true } },
      reviewedBy: { select: { displayName: true, email: true } },
      tasks: { select: { id: true, status: true, title: true, assignedStaff: { select: { displayName: true, email: true } } } },
    },
  });
  if (!r) return null;
  const conflict = r.conflictInstallationId
    ? await shopDb().softwareInstallation.findUnique({
        where: { id: r.conflictInstallationId },
        select: { id: true, status: true, customerId: true, softwareLicenseId: true, customer: { select: { email: true, firstName: true, lastName: true, companyName: true } } },
      })
    : null;
  return {
    ...r,
    license: {
      ...r.license,
      installations: r.license.installations.map(({ activationKeyEncrypted, ...i }) => ({ ...i, hasActivationKey: Boolean(activationKeyEncrypted) })),
    },
    conflict: conflict ? { ...conflict, sameCustomer: conflict.customerId === r.customerId } : null,
  };
}

export async function processActivation(
  s: Staff & { canTransfer: boolean },
  requestId: string,
  input: z.input<typeof activationStaffSchema>,
) {
  const db = shopDb();
  const r = await db.softwareActivationRequest.findUnique({ where: { id: requestId }, include: { product: true, customer: true, license: true } });
  if (!r) throw notFound("Activation request");
  const isOpen = OPEN.includes(r.status);
  const label = activationNumber(r.number);

  switch (input.action) {
    case "start_review": {
      if (!isOpen) throw new ShopError("INVALID_STATE", "This request is closed");
      await db.$transaction(async (tx) => {
        await tx.softwareActivationRequest.update({ where: { id: r.id }, data: { status: "IN_REVIEW", assignedStaffId: r.assignedStaffId ?? s.staffId } });
        await tx.customerTask.updateMany({ where: { softwareActivationRequestId: r.id, status: "OPEN" }, data: { status: "IN_PROGRESS", assignedStaffId: r.assignedStaffId ?? s.staffId } });
        await recordActivity({ tx, customerId: r.customerId, staffId: s.staffId, type: "software.activation_in_review", summary: `${label} is being processed` });
        await audit(staffActor(s), "software_activation.in_review", { type: "SoftwareActivationRequest", id: r.id }, {}, tx);
      });
      return;
    }
    case "assign": {
      if (input.assignedStaffId && !(await db.staffAccount.findFirst({ where: { id: input.assignedStaffId, status: "ACTIVE" } }))) {
        throw new ShopError("VALIDATION_FAILED", "Assign to an active staff member");
      }
      await db.$transaction(async (tx) => {
        await tx.softwareActivationRequest.update({ where: { id: r.id }, data: { assignedStaffId: input.assignedStaffId } });
        await tx.customerTask.updateMany({ where: { softwareActivationRequestId: r.id, status: { in: ["OPEN", "IN_PROGRESS"] } }, data: { assignedStaffId: input.assignedStaffId } });
        await audit(staffActor(s), "software_activation.assigned", { type: "SoftwareActivationRequest", id: r.id }, { assignedStaffId: input.assignedStaffId }, tx);
      });
      return;
    }
    case "request_info": {
      if (!isOpen) throw new ShopError("INVALID_STATE", "This request is closed");
      await db.$transaction(async (tx) => {
        await tx.softwareActivationRequest.update({ where: { id: r.id }, data: { status: "WAITING_FOR_CUSTOMER", infoRequest: input.message, assignedStaffId: r.assignedStaffId ?? s.staffId } });
        await recordActivity({ tx, customerId: r.customerId, staffId: s.staffId, type: "software.activation_waiting_for_customer", summary: `Asked for information on ${label}` });
        await audit(staffActor(s), "software_activation.info_requested", { type: "SoftwareActivationRequest", id: r.id }, {}, tx);
      });
      await notify({
        to: r.customer.email,
        subject: `We need a little more information to activate ${r.product.name}`,
        text: `To finish activating ${r.product.name} (${label}) we need some information from you. Please answer in your account.`,
        actionUrl: softwareLink(r.customer, r.product.slug),
        actionLabel: "Answer",
      });
      return;
    }
    case "update_code": {
      if (!isOpen) throw new ShopError("INVALID_STATE", "This request is closed");
      const code = normaliseRegistrationCode(input.registrationCode);
      const conflict = await findConflict(code, r.replacesInstallationId ? [r.replacesInstallationId] : []);
      await db.$transaction(async (tx) => {
        await tx.softwareActivationRequest.update({ where: { id: r.id }, data: { registrationCode: code, conflictInstallationId: conflict?.id ?? null } });
        await audit(staffActor(s), "software_activation.code_edited", { type: "SoftwareActivationRequest", id: r.id }, { reason: input.reason, conflict: Boolean(conflict) }, tx);
      });
      return;
    }
    case "note": {
      await db.softwareActivationRequest.update({ where: { id: r.id }, data: { adminNotes: input.adminNotes } });
      return;
    }
    case "reject": {
      if (!isOpen) throw new ShopError("INVALID_STATE", "This request is closed");
      await db.$transaction(async (tx) => {
        await tx.softwareActivationRequest.update({
          where: { id: r.id },
          data: { status: "REJECTED", rejectionReason: input.reason, reviewedByStaffId: s.staffId, reviewedAt: new Date() },
        });
        await tx.customerTask.updateMany({ where: { softwareActivationRequestId: r.id, status: { in: ["OPEN", "IN_PROGRESS"] } }, data: { status: "CANCELLED" } });
        await recordActivity({ tx, customerId: r.customerId, staffId: s.staffId, type: "software.activation_rejected", summary: `${label} could not be activated: ${input.reason}` });
        await audit(staffActor(s), "software_activation.rejected", { type: "SoftwareActivationRequest", id: r.id }, { reason: input.reason }, tx);
      });
      await notify({
        to: r.customer.email,
        subject: `Your ${r.product.name} activation needs attention`,
        text: `We could not complete the activation of ${r.product.name} (${label}). Open your account to see why and what to do next.`,
        actionUrl: softwareLink(r.customer, r.product.slug),
        actionLabel: "View details",
      });
      return;
    }
    case "approve": {
      if (!isOpen) throw new ShopError("INVALID_STATE", "This request is closed");
      if (r.license.status === "SUSPENDED" || r.license.status === "REVOKED") {
        throw new ShopError("INVALID_STATE", `The license is ${r.license.status.toLowerCase()}; it cannot be activated`);
      }
      // Re-check the conflict at approval time: data may have changed since submission.
      const conflict = await findConflict(r.registrationCode, r.replacesInstallationId ? [r.replacesInstallationId] : []);
      const conflictElsewhere = conflict && conflict.customerId !== r.customerId;
      if (conflictElsewhere && (input.resolveConflict !== "RETIRE_EXISTING" || !s.canTransfer)) {
        throw new ShopError("FORBIDDEN", "This registration code is active for another customer. Only a super admin can retire that installation and approve.");
      }
      const retireIds = [r.replacesInstallationId, conflict?.id].filter(Boolean) as string[];
      const activeCount = await db.softwareInstallation.count({ where: { softwareLicenseId: r.softwareLicenseId, status: "ACTIVE", id: { notIn: retireIds } } });
      if (activeCount >= r.license.maxActivations) {
        throw new ShopError("CONFLICT", "All activations of this license are in use. Retire an installation or raise the activation limit first.");
      }
      const now = new Date();
      const installation = await db.$transaction(async (tx) => {
        for (const id of retireIds) {
          await tx.softwareInstallation.updateMany({
            where: { id, status: { in: ["ACTIVE", "SUSPENDED"] } },
            data: { status: "RETIRED", retiredAt: now, retiredReason: id === r.replacesInstallationId ? `replaced by ${label}` : `registration moved by ${label}`, updatedByStaffId: s.staffId },
          });
        }
        const inst = await tx.softwareInstallation.create({
          data: {
            customerId: r.customerId, softwareProductId: r.softwareProductId, softwareLicenseId: r.softwareLicenseId,
            registeredPlayerId: input.registeredPlayerId ?? null,
            registrationCode: r.registrationCode,
            registrationIdentifier: normaliseRegistrationCode(input.registrationIdentifier ?? r.registrationCode),
            activationKeyEncrypted: encryptActivationKey(input.activationKey),
            status: "ACTIVE", label: input.label, activatedAt: now, createdByStaffId: s.staffId,
          },
        });
        await tx.softwareActivationRequest.update({
          where: { id: r.id },
          data: { status: "APPROVED", reviewedByStaffId: s.staffId, reviewedAt: now, softwareInstallationId: inst.id, conflictInstallationId: null },
        });
        await tx.softwareLicense.update({ where: { id: r.softwareLicenseId }, data: { status: "ACTIVE", activatedAt: r.license.activatedAt ?? now } });
        await tx.customerTask.updateMany({ where: { softwareActivationRequestId: r.id, status: { in: ["OPEN", "IN_PROGRESS"] } }, data: { status: "DONE", completedAt: now } });
        await recordActivity({
          tx, customerId: r.customerId, staffId: s.staffId, type: "software.activation_approved",
          summary: `${r.product.name} activated (${label})${retireIds.length ? `, ${retireIds.length} earlier installation retired` : ""}`,
          metadata: { softwareInstallationId: inst.id, softwareLicenseId: r.softwareLicenseId },
        });
        // The key itself is never part of audit metadata.
        await audit(staffActor(s), "software_activation.approved", { type: "SoftwareActivationRequest", id: r.id }, {
          installationId: inst.id, retired: retireIds.length, conflictResolved: Boolean(conflictElsewhere),
        }, tx);
        return inst;
      });
      // The activated copy of a player product is a player: create / link it, move the music
      // of the computer it replaces, and let retired installations take their players along.
      await ensurePlayerForInstallation(installation.id, s.staffId);
      if (r.replacesInstallationId) await moveLibraryForReplacement(r.replacesInstallationId, installation.id, s.staffId, label);
      for (const id of retireIds) await syncPlayerStatusFromInstallation(id, s.staffId);
      await notify({
        to: r.customer.email,
        subject: `Your ${r.product.name} license is ready`,
        text: `Your ${r.product.name} license is ready. Sign in to your account to view and copy your activation key, then enter it in the software.`,
        actionUrl: softwareLink(r.customer, r.product.slug),
        actionLabel: "View my software",
      });
      return installation;
    }
  }
}

// ─── Staff: installations ────────────────────────────────────────────────────

export async function staffRevealInstallationKey(s: Staff, installationId: string) {
  const inst = await shopDb().softwareInstallation.findUnique({ where: { id: installationId }, select: { id: true, customerId: true, activationKeyEncrypted: true } });
  if (!inst) throw notFound("Installation");
  if (!inst.activationKeyEncrypted) throw new ShopError("UNAVAILABLE", "No activation key stored");
  await audit(staffActor(s), "software_installation.key_revealed", { type: "SoftwareInstallation", id: inst.id }, { customerId: inst.customerId });
  return decryptActivationKey(inst.activationKeyEncrypted);
}

export async function installationAction(s: Staff, installationId: string, action: "retire" | "suspend" | "reactivate", reason: string) {
  const db = shopDb();
  const inst = await db.softwareInstallation.findUnique({ where: { id: installationId }, include: { product: true, license: true } });
  if (!inst) throw notFound("Installation");
  const now = new Date();
  const data: Prisma.SoftwareInstallationUpdateInput =
    action === "retire"
      ? { status: "RETIRED", retiredAt: now, retiredReason: reason }
      : action === "suspend"
        ? { status: "SUSPENDED", suspendedAt: now }
        : { status: "ACTIVE", suspendedAt: null };
  if (inst.status === "RETIRED") throw new ShopError("INVALID_STATE", "Retired installations are history and cannot change");
  if (action === "reactivate") {
    if (inst.license.status !== "ACTIVE") throw new ShopError("INVALID_STATE", "Reactivate the license first");
    const clash = await db.softwareInstallation.findFirst({ where: { registrationCode: inst.registrationCode, status: "ACTIVE", id: { not: inst.id } } });
    if (clash) throw new ShopError("CONFLICT", "That registration code is active on another installation");
  }
  await db.$transaction(async (tx) => {
    await tx.softwareInstallation.update({ where: { id: inst.id }, data: { ...data, updatedBy: { connect: { id: s.staffId } } } });
    await recordActivity({
      tx, customerId: inst.customerId, staffId: s.staffId,
      type: action === "retire" ? "software.installation_retired" : action === "suspend" ? "software.installation_suspended" : "software.installation_reactivated",
      summary: `${inst.product.name} installation ending ${inst.registrationCode.slice(-4)} ${action === "retire" ? "retired" : action === "suspend" ? "suspended" : "reactivated"}: ${reason}`,
      metadata: { softwareInstallationId: inst.id },
    });
    await audit(staffActor(s), `software_installation.${action}`, { type: "SoftwareInstallation", id: inst.id }, { reason }, tx);
  });
  await syncPlayerStatusFromInstallation(inst.id, s.staffId);
}

/** CRM "Software" tab: downloads, licenses, installations (no keys), requests. */
export async function crmSoftware(customerId: string) {
  const db = shopDb();
  const [downloads, licenses] = await Promise.all([
    db.softwareDownload.findMany({
      where: { customerId },
      orderBy: { downloadedAt: "desc" },
      take: 100,
      select: { id: true, downloadedAt: true, source: true, product: { select: { id: true, name: true } }, release: { select: { version: true, platform: true, architecture: true } } },
    }),
    db.softwareLicense.findMany({
      where: { customerId },
      orderBy: { purchasedAt: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        order: { select: { id: true, number: true } },
        installations: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true, status: true, registrationCode: true, registrationIdentifier: true, label: true, activatedAt: true, retiredAt: true,
            retiredReason: true, registeredPlayerId: true, activationKeyEncrypted: true,
          },
        },
        activationRequests: { orderBy: { submittedAt: "desc" }, select: { id: true, number: true, status: true, registrationCode: true, submittedAt: true, conflictInstallationId: true } },
        supportTickets: { select: { id: true, number: true, subject: true, status: true } },
      },
    }),
  ]);
  return {
    downloads,
    licenses: licenses.map((l) => ({
      ...l,
      licenseNumber: licenseNumber(l.number),
      installations: l.installations.map(({ activationKeyEncrypted, ...i }) => ({ ...i, hasActivationKey: Boolean(activationKeyEncrypted) })),
    })),
  };
}

export async function listLicensesAdmin(params: { q?: string; status?: string; productId?: string; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim();
  const num = q ? /^(?:LIC-?)?(\d+)$/i.exec(q)?.[1] : undefined;
  const where: Prisma.SoftwareLicenseWhereInput = {
    AND: [
      params.status && ["PENDING_ACTIVATION", "ACTIVE", "SUSPENDED", "REVOKED"].includes(params.status) ? { status: params.status as "ACTIVE" } : {},
      params.productId ? { softwareProductId: params.productId } : {},
      q ? {
        OR: [
          ...(num ? [{ number: Number(num) }] : []),
          { customer: { email: { contains: q, mode: "insensitive" } } },
          { customer: { firstName: { contains: q, mode: "insensitive" } } },
          { customer: { lastName: { contains: q, mode: "insensitive" } } },
          { customer: { companyName: { contains: q, mode: "insensitive" } } },
          { installations: { some: { OR: [{ registrationCode: { contains: normaliseRegistrationCode(q) } }, { registrationIdentifier: { contains: normaliseRegistrationCode(q) } }] } } },
        ],
      } : {},
    ],
  };
  const page = Math.max(params.page ?? 1, 1);
  const [total, items] = await Promise.all([
    db.softwareLicense.count({ where }),
    db.softwareLicense.findMany({
      where, orderBy: { purchasedAt: "desc" }, skip: (page - 1) * 50, take: 50,
      select: {
        id: true, number: true, status: true, licenseSource: true, purchasedAt: true, activatedAt: true, maxActivations: true,
        notes: true, sourceReference: true, statusReason: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
        product: { select: { id: true, name: true } },
        order: { select: { id: true, number: true } },
        _count: { select: { installations: { where: { status: "ACTIVE" } } } },
      },
    }),
  ]);
  return { total, page, pageCount: Math.max(Math.ceil(total / 50), 1), items };
}

export { licenseNumber, activationNumber };
