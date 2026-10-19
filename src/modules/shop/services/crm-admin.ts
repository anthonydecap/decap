import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/shop-prisma/client";
import { shopDb } from "../db";
import { ShopError, notFound } from "../errors";
import type { communicationSchema, crmCustomerSchema, customerTagSchema, taskPatchSchema, taskSchema } from "../schemas";
import { storage } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { audit } from "./audit";
import { formatOrderNumber } from "./checkout";
import { recordActivity } from "./crm";
import { saveProfile } from "./profile";
import { detectAttachmentType, MAX_ATTACHMENT_BYTES } from "./support-files";

/**
 * Staff-side CRM: the customer workspace. Every write is audited and lands on the
 * customer's timeline. Nothing here is ever shown to the customer (notes, tasks, tags,
 * communication log and documents are internal).
 */

type Staff = { staffId: string };
const actor = (s: Staff) => ({ type: "STAFF" as const, staffId: s.staffId });

async function requireCustomer(customerId: string) {
  const c = await shopDb().customer.findUnique({ where: { id: customerId } });
  if (!c) throw notFound("Customer");
  return c;
}

// ─── Overview ────────────────────────────────────────────────────────────────

const PAID_STATUSES = ["PAID", "FULFILLED", "PARTIALLY_REFUNDED", "REFUNDED"] as const;
const OPEN_TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_SUPPORT"] as const;

/** One round trip of aggregates; no per-row work. */
export async function customerOverview(customerId: string) {
  const db = shopDb();
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: {
      tags: { include: { tag: true }, orderBy: { assignedAt: "asc" } },
      addresses: { where: { type: "BILLING" }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }], take: 1 },
      legalAcceptances: { orderBy: { acceptedAt: "desc" } },
    },
  });
  if (!customer) return null;
  const [activeMusicLicenses, unassignedMusic, musicNeedsReview] = await Promise.all([
    db.musicLicense.count({ where: { customerId, status: "ACTIVE" } }),
    db.musicLicense.count({ where: { customerId, status: "UNASSIGNED" } }),
    db.musicLicense.count({ where: { customerId, status: "UNASSIGNED", needsReview: true } }),
  ]);
  const [spend, lastOrder, owned, activePlayers, totalPlayers, openTickets, lastActivity, nextTask, softwareLicenses, pendingActivations, softwareDownloads] = await Promise.all([
    db.order.aggregate({
      where: { customerId, status: { in: [...PAID_STATUSES] } },
      _sum: { totalCents: true, refundedCents: true },
      _count: { _all: true },
    }),
    db.order.findFirst({ where: { customerId, status: { in: [...PAID_STATUSES] } }, orderBy: { paidAt: "desc" }, select: { id: true, number: true, paidAt: true } }),
    db.entitlement.count({ where: { customerId, status: "ACTIVE" } }),
    db.registeredPlayer.count({ where: { customerId, status: "ACTIVE" } }),
    db.registeredPlayer.count({ where: { customerId } }),
    db.supportTicket.count({ where: { customerId, status: { in: [...OPEN_TICKET_STATUSES] } } }),
    db.customerActivity.findFirst({ where: { customerId }, orderBy: { occurredAt: "desc" }, select: { occurredAt: true, summary: true } }),
    db.customerTask.findFirst({
      where: { customerId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      include: { assignedStaff: { select: { displayName: true, email: true } } },
    }),
    db.softwareLicense.count({ where: { customerId, status: { in: ["ACTIVE", "PENDING_ACTIVATION"] } } }),
    db.softwareActivationRequest.count({ where: { customerId, status: { in: ["SUBMITTED", "IN_REVIEW", "WAITING_FOR_CUSTOMER"] } } }),
    db.softwareDownload.count({ where: { customerId } }),
  ]);
  const terms = customer.legalAcceptances.find((l) => l.documentType === "TERMS");
  const privacy = customer.legalAcceptances.find((l) => l.documentType === "PRIVACY");
  return {
    customer,
    billing: customer.addresses[0] ?? null,
    tags: customer.tags.map((t) => t.tag),
    alerts: customer.tags.map((t) => t.tag).filter((t) => t.isAlert),
    metrics: {
      lifetimeSpendCents: (spend._sum.totalCents ?? 0) - (spend._sum.refundedCents ?? 0),
      orderCount: spend._count._all,
      ownedArrangements: owned,
      activeMusicLicenses,
      unassignedMusic,
      musicNeedsReview,
      activePlayers,
      totalPlayers,
      openTickets,
      lastPurchase: lastOrder ? { id: lastOrder.id, orderNumber: formatOrderNumber(lastOrder.number), at: lastOrder.paidAt } : null,
      lastActivity,
      nextTask,
      softwareLicenses,
      pendingActivations,
      softwareDownloads,
    },
    consent: {
      marketingConsent: customer.marketingConsent,
      marketingConsentAt: customer.marketingConsentAt,
      termsAcceptedAt: terms?.acceptedAt ?? null,
      termsVersion: terms?.documentVersion ?? null,
      privacyAcceptedAt: privacy?.acceptedAt ?? null,
      privacyVersion: privacy?.documentVersion ?? null,
    },
  };
}

export async function updateCustomerCrm(s: Staff, customerId: string, input: z.infer<typeof crmCustomerSchema>) {
  const customer = await requireCustomer(customerId);
  await shopDb().$transaction(async (tx) => {
    if (input.profile) await saveProfile(customer, input.profile, actor(s), tx);
    const data: Prisma.CustomerUpdateInput = {};
    if (input.crmStatus && input.crmStatus !== customer.crmStatus) {
      data.crmStatus = input.crmStatus;
      data.archivedAt = input.crmStatus === "ARCHIVED" ? new Date() : null;
    }
    if (input.customerSource !== undefined && input.customerSource !== customer.customerSource) data.customerSource = input.customerSource;
    if (Object.keys(data).length) {
      await tx.customer.update({ where: { id: customerId }, data });
      await recordActivity({
        tx, customerId, staffId: s.staffId, type: "crm.status_changed",
        summary: [
          data.crmStatus ? `CRM status ${customer.crmStatus.toLowerCase()} to ${String(data.crmStatus).toLowerCase()}` : null,
          data.customerSource !== undefined ? `source set to ${String(data.customerSource ?? "none").toLowerCase().replace("_", " ")}` : null,
        ].filter(Boolean).join(", "),
        metadata: { crmStatus: data.crmStatus ?? undefined, customerSource: data.customerSource ?? undefined },
      });
      await audit(actor(s), "customer.crm_updated", { type: "Customer", id: customerId }, { from: customer.crmStatus, to: data.crmStatus ?? null }, tx);
    }
  });
}

// ─── Tags and alert flags ────────────────────────────────────────────────────

export async function listCustomerTags() {
  return shopDb().customerTag.findMany({ orderBy: [{ isAlert: "desc" }, { name: "asc" }], include: { _count: { select: { assignments: true } } } });
}

export async function saveCustomerTag(s: Staff, id: string | null, input: z.infer<typeof customerTagSchema>) {
  try {
    const tag = id
      ? await shopDb().customerTag.update({ where: { id }, data: input })
      : await shopDb().customerTag.create({ data: input });
    await audit(actor(s), id ? "customer_tag.update" : "customer_tag.create", { type: "CustomerTag", id: tag.id }, { name: tag.name, isAlert: tag.isAlert });
    return tag;
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") throw new ShopError("CONFLICT", "A tag with that name already exists");
    if ((e as { code?: string }).code === "P2025") throw notFound("Tag");
    throw e;
  }
}

export async function deleteCustomerTag(s: Staff, id: string) {
  const r = await shopDb().customerTag.deleteMany({ where: { id } });
  if (!r.count) throw notFound("Tag");
  await audit(actor(s), "customer_tag.delete", { type: "CustomerTag", id });
}

export async function setCustomerTags(s: Staff, customerId: string, tagIds: string[]) {
  await requireCustomer(customerId);
  const db = shopDb();
  const tags = await db.customerTag.findMany({ where: { id: { in: tagIds } } });
  if (tags.length !== new Set(tagIds).size) throw new ShopError("VALIDATION_FAILED", "Unknown tag");
  await db.$transaction(async (tx) => {
    const before = await tx.customerTagAssignment.findMany({ where: { customerId }, include: { tag: true } });
    const keep = new Set(tagIds);
    const removed = before.filter((b) => !keep.has(b.tagId));
    const had = new Set(before.map((b) => b.tagId));
    const added = tags.filter((t) => !had.has(t.id));
    await tx.customerTagAssignment.deleteMany({ where: { customerId, tagId: { notIn: tagIds } } });
    if (added.length) await tx.customerTagAssignment.createMany({ data: added.map((t) => ({ customerId, tagId: t.id })) });
    if (added.length || removed.length) {
      await recordActivity({
        tx, customerId, staffId: s.staffId, type: "crm.tags_changed",
        summary: [
          added.length ? `Tagged ${added.map((t) => t.name).join(", ")}` : null,
          removed.length ? `removed ${removed.map((r) => r.tag.name).join(", ")}` : null,
        ].filter(Boolean).join("; "),
      });
    }
  });
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function addNote(s: Staff, customerId: string, body: string) {
  await requireCustomer(customerId);
  return shopDb().$transaction(async (tx) => {
    const note = await tx.customerNote.create({ data: { customerId, body, createdByStaffId: s.staffId } });
    await recordActivity({ tx, customerId, staffId: s.staffId, type: "note.added", summary: `Note: ${body.slice(0, 140)}${body.length > 140 ? "…" : ""}`, metadata: { noteId: note.id } });
    return note;
  });
}

export async function editNote(s: Staff, noteId: string, body: string) {
  const note = await shopDb().customerNote.findUnique({ where: { id: noteId } });
  if (!note) throw notFound("Note");
  // Only the author edits their note; everyone else adds a new one.
  if (note.createdByStaffId !== s.staffId) throw new ShopError("FORBIDDEN", "Only the author can edit a note");
  const updated = await shopDb().customerNote.update({ where: { id: noteId }, data: { body } });
  await audit(actor(s), "note.edited", { type: "CustomerNote", id: noteId });
  return updated;
}

export async function listNotes(customerId: string) {
  return shopDb().customerNote.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: { createdByStaff: { select: { id: true, displayName: true, email: true } } },
  });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

async function assertTaskLinks(customerId: string, input: { registeredPlayerId?: string | null; supportTicketId?: string | null; assignedStaffId?: string | null }) {
  const db = shopDb();
  if (input.registeredPlayerId && !(await db.registeredPlayer.findFirst({ where: { id: input.registeredPlayerId, customerId } }))) {
    throw new ShopError("VALIDATION_FAILED", "That player does not belong to this customer");
  }
  if (input.supportTicketId && !(await db.supportTicket.findFirst({ where: { id: input.supportTicketId, customerId } }))) {
    throw new ShopError("VALIDATION_FAILED", "That ticket does not belong to this customer");
  }
  if (input.assignedStaffId && !(await db.staffAccount.findFirst({ where: { id: input.assignedStaffId, status: "ACTIVE" } }))) {
    throw new ShopError("VALIDATION_FAILED", "Tasks can only be assigned to active staff");
  }
}

export async function createTask(s: Staff, customerId: string, input: z.infer<typeof taskSchema>) {
  await requireCustomer(customerId);
  await assertTaskLinks(customerId, input);
  return shopDb().$transaction(async (tx) => {
    const task = await tx.customerTask.create({
      data: {
        customerId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        assignedStaffId: input.assignedStaffId ?? s.staffId,
        dueAt: input.dueAt ?? null,
        registeredPlayerId: input.registeredPlayerId ?? null,
        supportTicketId: input.supportTicketId ?? null,
        createdByStaffId: s.staffId,
        completedAt: input.status === "DONE" ? new Date() : null,
      },
    });
    await recordActivity({ tx, customerId, staffId: s.staffId, type: "task.created", summary: `Task: ${task.title}`, metadata: { taskId: task.id, dueAt: task.dueAt } });
    return task;
  });
}

export async function updateTask(s: Staff, taskId: string, input: z.infer<typeof taskPatchSchema>) {
  const task = await shopDb().customerTask.findUnique({ where: { id: taskId } });
  if (!task) throw notFound("Task");
  await assertTaskLinks(task.customerId, input);
  return shopDb().$transaction(async (tx) => {
    const finishing = input.status && ["DONE", "CANCELLED"].includes(input.status) && !["DONE", "CANCELLED"].includes(task.status);
    const updated = await tx.customerTask.update({
      where: { id: taskId },
      data: {
        ...input,
        ...(input.status === "DONE" && task.status !== "DONE" ? { completedAt: new Date() } : {}),
        ...(input.status && !["DONE"].includes(input.status) ? { completedAt: null } : {}),
      },
    });
    if (finishing || (input.assignedStaffId !== undefined && input.assignedStaffId !== task.assignedStaffId)) {
      await recordActivity({
        tx, customerId: task.customerId, staffId: s.staffId,
        type: finishing ? `task.${input.status!.toLowerCase()}` : "task.reassigned",
        summary: finishing ? `Task ${input.status === "DONE" ? "completed" : "cancelled"}: ${task.title}` : `Task reassigned: ${task.title}`,
        metadata: { taskId },
      });
    }
    return updated;
  });
}

export async function listCustomerTasks(customerId: string) {
  return shopDb().customerTask.findMany({
    where: { customerId },
    orderBy: [{ status: "asc" }, { dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    include: {
      assignedStaff: { select: { id: true, displayName: true, email: true } },
      player: { select: { id: true, registrationCode: true, playerType: { select: { name: true } } } },
      ticket: { select: { id: true, number: true, subject: true } },
    },
  });
}

/** Dashboard buckets for one staff member (or everyone). */
export async function taskBuckets(staffId: string | null) {
  const db = shopDb();
  const now = new Date();
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const inAWeek = new Date(startOfTomorrow.getTime() + 7 * 86400000);
  const open = { status: { in: ["OPEN", "IN_PROGRESS"] as ("OPEN" | "IN_PROGRESS")[] } };
  const mine = staffId ? { assignedStaffId: staffId } : {};
  const include = { customer: { select: { id: true, firstName: true, lastName: true, companyName: true, email: true } } } as const;
  const [myTasks, overdue, dueToday, upcoming] = await Promise.all([
    staffId ? db.customerTask.findMany({ where: { ...open, ...mine }, orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }], take: 20, include }) : Promise.resolve([]),
    db.customerTask.findMany({ where: { ...open, dueAt: { lt: now } }, orderBy: { dueAt: "asc" }, take: 20, include }),
    db.customerTask.findMany({ where: { ...open, dueAt: { gte: now, lt: startOfTomorrow } }, orderBy: { dueAt: "asc" }, take: 20, include }),
    db.customerTask.findMany({ where: { ...open, dueAt: { gte: startOfTomorrow, lt: inAWeek } }, orderBy: { dueAt: "asc" }, take: 20, include }),
  ]);
  return { myTasks, overdue, dueToday, upcoming };
}

// ─── Communication log ───────────────────────────────────────────────────────

export async function logCommunication(s: Staff, customerId: string, input: z.infer<typeof communicationSchema>) {
  await requireCustomer(customerId);
  return shopDb().$transaction(async (tx) => {
    const entry = await tx.communicationLogEntry.create({
      data: { customerId, staffId: s.staffId, type: input.type, direction: input.direction, subject: input.subject, body: input.body, occurredAt: input.occurredAt ?? new Date() },
    });
    const label = input.type.replace("_", " ").toLowerCase();
    await recordActivity({
      tx, customerId, staffId: s.staffId, type: "communication.logged", occurredAt: entry.occurredAt,
      summary: `${input.direction === "INBOUND" ? "Inbound" : "Outbound"} ${label}${input.subject ? `: ${input.subject}` : ""}`,
      metadata: { communicationId: entry.id, type: input.type },
    });
    return entry;
  });
}

export async function listCommunications(customerId: string) {
  return shopDb().communicationLogEntry.findMany({
    where: { customerId },
    orderBy: { occurredAt: "desc" },
    include: { staff: { select: { displayName: true, email: true } } },
  });
}

// ─── Documents (internal, private storage) ───────────────────────────────────

export async function uploadCustomerDocument(s: Staff, customerId: string, input: { title: string; file: File; registeredPlayerId?: string | null }) {
  await requireCustomer(customerId);
  if (input.registeredPlayerId && !(await shopDb().registeredPlayer.findFirst({ where: { id: input.registeredPlayerId, customerId } }))) {
    throw new ShopError("VALIDATION_FAILED", "That player does not belong to this customer");
  }
  if (input.file.size <= 0 || input.file.size > MAX_ATTACHMENT_BYTES) throw new ShopError("VALIDATION_FAILED", "Files must be between 1 byte and 4 MB");
  const body = new Uint8Array(await input.file.arrayBuffer());
  const type = detectAttachmentType(body, input.file.name);
  if (!type) throw new ShopError("VALIDATION_FAILED", "Only PDF, JPEG, PNG, WebP, plain text and MIDI files are accepted");
  const key = generateObjectKey("DOCUMENTS", "customer", type.ext);
  await storage().write({ store: "DOCUMENTS", key }, body, type.mime);
  return shopDb().$transaction(async (tx) => {
    const doc = await tx.customerDocument.create({
      data: {
        customerId, registeredPlayerId: input.registeredPlayerId ?? null, title: input.title.slice(0, 200),
        fileName: input.file.name.slice(0, 255), contentType: type.mime, sizeBytes: body.length, storageKey: key, uploadedByStaffId: s.staffId,
      },
    });
    await recordActivity({ tx, customerId, staffId: s.staffId, type: "document.uploaded", summary: `Document added: ${doc.title}`, metadata: { documentId: doc.id } });
    return doc;
  });
}

export async function listCustomerDocuments(customerId: string) {
  return shopDb().customerDocument.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, fileName: true, contentType: true, sizeBytes: true, createdAt: true, registeredPlayerId: true,
      uploadedBy: { select: { displayName: true, email: true } },
    },
  });
}

export async function documentDownloadUrl(s: Staff, documentId: string) {
  const doc = await shopDb().customerDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw notFound("Document");
  const { url } = await storage().createDownloadUrl({ store: "DOCUMENTS", key: doc.storageKey }, { expiresInSeconds: 120, filename: doc.fileName });
  await audit(actor(s), "document.downloaded", { type: "CustomerDocument", id: doc.id }, { customerId: doc.customerId });
  return url;
}

// ─── Search and saved views ──────────────────────────────────────────────────

export const CUSTOMER_VIEWS = {
  all: "All customers",
  business: "Business customers",
  with_players: "With active players",
  no_player: "Without a player",
  open_tickets: "With open tickets",
  follow_up: "Needs follow-up",
  overdue_tasks: "Overdue tasks",
  inactive: "Inactive",
  recent: "Joined in the last 30 days",
  high_value: "High value",
} as const;
export type CustomerView = keyof typeof CUSTOMER_VIEWS;

const HIGH_VALUE_CENTS = Number(process.env.SHOP_CRM_HIGH_VALUE_CENTS ?? 50_000);

function viewWhere(view: CustomerView): Prisma.CustomerWhereInput {
  const now = new Date();
  switch (view) {
    case "business": return { accountType: "BUSINESS" };
    case "with_players": return { players: { some: { status: "ACTIVE" } } };
    case "no_player": return { players: { none: {} } };
    case "open_tickets": return { supportTickets: { some: { status: { in: [...OPEN_TICKET_STATUSES] } } } };
    case "follow_up": return {
      OR: [
        { tasks: { some: { status: { in: ["OPEN", "IN_PROGRESS"] } } } },
        { tags: { some: { tag: { name: { equals: "Needs Follow-up", mode: "insensitive" } } } } },
      ],
    };
    case "overdue_tasks": return { tasks: { some: { status: { in: ["OPEN", "IN_PROGRESS"] }, dueAt: { lt: now } } } };
    case "inactive": return { crmStatus: { in: ["INACTIVE", "ARCHIVED"] } };
    case "recent": return { createdAt: { gte: new Date(now.getTime() - 30 * 86400000) } };
    default: return {};
  }
}

/**
 * Search across name, email, company, VAT, phone, player registration / identifier /
 * serial, order number and ticket number. A player reference or SUP-/DMI- number jumps
 * straight to the owning customer.
 */
export async function searchCrmCustomers(params: { q?: string; view?: CustomerView; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim() ?? "";
  const view: CustomerView = params.view && params.view in CUSTOMER_VIEWS ? params.view : "all";
  const and: Prisma.CustomerWhereInput[] = [viewWhere(view)];
  if (q) {
    const compact = q.replace(/[\s-]/g, "").toUpperCase();
    const ticketNo = /^SUP-?(\d+)$/i.exec(q)?.[1];
    const orderNo = /^DMI-?(\d+)$/i.exec(q)?.[1];
    const or: Prisma.CustomerWhereInput[] = [
      { email: { contains: q, mode: "insensitive" } },
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { vatNumber: { contains: compact, mode: "insensitive" } },
      { players: { some: { OR: [
        { registrationCode: { contains: compact, mode: "insensitive" } },
        { registrationIdentifier: { contains: compact, mode: "insensitive" } },
        { serialNumber: { contains: q, mode: "insensitive" } },
        { friendlyName: { contains: q, mode: "insensitive" } },
      ] } } },
    ];
    // Music: customers holding a live license for a matching arrangement.
    if (q.length >= 3) {
      or.push({ musicLicenses: { some: { status: { in: ["ACTIVE", "TRANSFER_PENDING", "UNASSIGNED"] }, arrangement: { OR: [{ displayTitle: { contains: q, mode: "insensitive" } }, { sku: { equals: q, mode: "insensitive" } }] } } } });
    }
    const transferNo = /^TRF-?(\d+)$/i.exec(q)?.[1];
    if (transferNo) or.push({ musicTransfersOut: { some: { number: Number(transferNo) } } }, { musicTransfersIn: { some: { number: Number(transferNo) } } });
    const parts = q.split(/\s+/);
    if (parts.length >= 2) {
      or.push({ AND: [{ firstName: { contains: parts[0]!, mode: "insensitive" } }, { lastName: { contains: parts.slice(1).join(" "), mode: "insensitive" } }] });
    }
    const licenseNo = /^LIC-?(\d+)$/i.exec(q)?.[1];
    const activationNo = /^ACT-?(\d+)$/i.exec(q)?.[1];
    if (licenseNo) or.push({ softwareLicenses: { some: { number: Number(licenseNo) } } });
    if (activationNo) or.push({ softwareActivations: { some: { number: Number(activationNo) } } });
    // Software registration codes / identifiers (installations and pending requests) and product names.
    or.push(
      { softwareInstallations: { some: { OR: [{ registrationCode: { contains: compact } }, { registrationIdentifier: { contains: compact } }] } } },
      { softwareActivations: { some: { registrationCode: { contains: compact } } } },
      { softwareLicenses: { some: { product: { name: { contains: q, mode: "insensitive" } } } } },
    );
    if (ticketNo) or.push({ supportTickets: { some: { number: Number(ticketNo) } } });
    if (orderNo) or.push({ orders: { some: { number: Number(orderNo) } } });
    if (/^\d+$/.test(q)) {
      or.push({ supportTickets: { some: { number: Number(q) } } }, { orders: { some: { number: Number(q) } } });
    }
    and.push({ OR: or });
  }
  const where: Prisma.CustomerWhereInput = { AND: and };
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = 50;

  let ids: string[] | null = null;
  if (view === "high_value") {
    const grouped = await db.order.groupBy({
      by: ["customerId"],
      where: { status: { in: [...PAID_STATUSES] } },
      _sum: { totalCents: true, refundedCents: true },
    });
    ids = grouped
      .filter((g) => (g._sum.totalCents ?? 0) - (g._sum.refundedCents ?? 0) >= HIGH_VALUE_CENTS)
      .map((g) => g.customerId);
    and.push({ id: { in: ids } });
  }

  const [total, rows] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, email: true, firstName: true, lastName: true, companyName: true, accountType: true, crmStatus: true,
        emailVerified: true, countryCode: true, createdAt: true, phone: true,
        tags: { select: { tag: { select: { name: true, isAlert: true } } } },
        _count: {
          select: {
            orders: { where: { status: { in: [...PAID_STATUSES] } } },
            players: { where: { status: "ACTIVE" } },
            entitlements: { where: { status: "ACTIVE" } },
            supportTickets: { where: { status: { in: [...OPEN_TICKET_STATUSES] } } },
          },
        },
      },
    }),
  ]);
  return { total, page, pageCount: Math.max(Math.ceil(total / pageSize), 1), view, items: rows };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

/** Operational snapshot for the admin dashboard: players waiting for activation, new customers. */
export async function crmDashboard() {
  const db = shopDb();
  const since = new Date(Date.now() - 7 * 86400000);
  const [pendingPlayers, recentPlayers, newCustomers, newCustomerCount] = await Promise.all([
    db.registeredPlayer.count({ where: { status: "PENDING" } }),
    db.registeredPlayer.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, status: true, registrationCode: true, createdAt: true, activatedAt: true,
        playerType: { select: { name: true } },
        customer: { select: { id: true, firstName: true, lastName: true, companyName: true, email: true } },
      },
    }),
    db.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, firstName: true, lastName: true, companyName: true, email: true, createdAt: true, accountType: true },
    }),
    db.customer.count({ where: { createdAt: { gte: since } } }),
  ]);
  return { pendingPlayers, recentPlayers, newCustomers, newCustomerCount };
}
