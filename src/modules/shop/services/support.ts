import "server-only";
import type { z } from "zod";
import type { Customer, MessageVisibility, Prisma, SupportCategory, SupportTicket, TicketStatus } from "@/generated/shop-prisma/client";
import { shopDb, type ShopTx } from "../db";
import { ShopError, notFound } from "../errors";
import type { newTicketSchema, staffTicketMessageSchema, ticketPatchSchema } from "../schemas";
import { storage } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { appUrl, notify } from "./email";
import { LIVE_LICENSE_STATUSES, maskRegistration } from "./music-licenses";
import { detectAttachmentType, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS_PER_MESSAGE } from "./support-files";

/**
 * Customer support tickets.
 *
 * The ticket is the source of truth; email only notifies. Messages are an append-only
 * conversation. INTERNAL messages are staff notes and never leave staff-only queries:
 * every customer-facing function filters on `visibility: PUBLIC` at the query, not in UI.
 *
 * Status automation:
 *   customer creates / replies      → WAITING_FOR_SUPPORT (a RESOLVED ticket reopens)
 *   staff replies                   → IN_PROGRESS, or WAITING_FOR_CUSTOMER when asking
 *   staff resolves                  → RESOLVED
 *   CLOSED                          → stays closed; the customer opens a new request
 */

export const ticketNumber = (n: number) => `SUP-${n}`;
export const OPEN_STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_SUPPORT"];

/** Customer-facing labels (staff see the enum names). */
export const CUSTOMER_STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: "Received",
  IN_PROGRESS: "We are working on it",
  WAITING_FOR_CUSTOMER: "Waiting for your reply",
  WAITING_FOR_SUPPORT: "Waiting for our team",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const CATEGORY_LABEL: Record<SupportCategory, string> = {
  SOFTWARE_ACTIVATION: "Activating my software",
  SOFTWARE_PROBLEM: "A problem with DMI software",
  PLAYER_REGISTRATION: "Registering a player",
  PLAYER_PROBLEM: "A problem with my player",
  MUSIC_DOWNLOAD: "Getting music onto my player",
  MUSIC_PLAYBACK: "Music does not play correctly",
  ORDER_PAYMENT: "An order or payment",
  ARRANGEMENT_QUESTION: "A question about an arrangement",
  ACCOUNT: "My account",
  BILLING: "Invoices and billing",
  REFUND_REQUEST: "Requesting a refund",
  OTHER: "Something else",
};

/** A recently resolved ticket reopens when the customer replies; older ones ask for a new request. */
export const REOPEN_WINDOW_MS = 14 * 86400000;

type FileInput = File;

type StoredFile = { fileName: string; contentType: string; sizeBytes: number; storageKey: string };

/**
 * Validates (size + real file type) and uploads before any database write, so a bad file
 * never leaves a half-created ticket and slow uploads never hold a transaction open.
 * Files land in the private SUPPORT namespace, never next to music, deliveries or previews.
 */
async function uploadAttachments(files: FileInput[]): Promise<StoredFile[]> {
  if (files.length > MAX_ATTACHMENTS_PER_MESSAGE) throw new ShopError("VALIDATION_FAILED", `At most ${MAX_ATTACHMENTS_PER_MESSAGE} files per message`);
  const prepared: { f: FileInput; body: Uint8Array; mime: string; ext: string }[] = [];
  for (const f of files) {
    if (f.size <= 0 || f.size > MAX_ATTACHMENT_BYTES) throw new ShopError("VALIDATION_FAILED", `"${f.name}" must be between 1 byte and 4 MB`);
    const body = new Uint8Array(await f.arrayBuffer());
    const type = detectAttachmentType(body, f.name);
    if (!type) throw new ShopError("VALIDATION_FAILED", `"${f.name}" is not an accepted file type (PDF, JPEG, PNG, WebP, text or MIDI)`);
    prepared.push({ f, body, mime: type.mime, ext: type.ext });
  }
  const stored: StoredFile[] = [];
  for (const p of prepared) {
    const key = generateObjectKey("SUPPORT", "attachment", p.ext);
    await storage().write({ store: "SUPPORT", key }, p.body, p.mime);
    stored.push({ fileName: p.f.name.replace(/[\\/]/g, "_").slice(0, 200), contentType: p.mime, sizeBytes: p.body.length, storageKey: key });
  }
  return stored;
}

async function saveAttachmentRows(tx: ShopTx, messageId: string, stored: StoredFile[]) {
  if (stored.length) await tx.supportAttachment.createMany({ data: stored.map((x) => ({ ...x, messageId })) });
}

// ─── Customer side ───────────────────────────────────────────────────────────

type SoftwareLinkInput = {
  softwareProductId?: string | null;
  softwareLicenseId?: string | null;
  softwareInstallationId?: string | null;
  softwareActivationRequestId?: string | null;
};

/** Resolves and ownership-checks software links; fills the product from the license when omitted. */
async function resolveSoftwareLinks(customerId: string, input: SoftwareLinkInput) {
  const db = shopDb();
  let productId = input.softwareProductId ?? null;
  const fail = () => { throw new ShopError("VALIDATION_FAILED", "That software item is not on your account"); };
  const pin = (id: string) => { if (productId && productId !== id) fail(); productId = id; };
  if (input.softwareLicenseId) {
    const l = await db.softwareLicense.findFirst({ where: { id: input.softwareLicenseId, customerId }, select: { softwareProductId: true } });
    if (!l) fail(); else pin(l.softwareProductId);
  }
  if (input.softwareInstallationId) {
    const i = await db.softwareInstallation.findFirst({ where: { id: input.softwareInstallationId, customerId }, select: { softwareProductId: true, softwareLicenseId: true } });
    if (!i || (input.softwareLicenseId && i.softwareLicenseId !== input.softwareLicenseId)) fail(); else pin(i.softwareProductId);
  }
  if (input.softwareActivationRequestId) {
    const r = await db.softwareActivationRequest.findFirst({ where: { id: input.softwareActivationRequestId, customerId }, select: { softwareProductId: true, softwareLicenseId: true } });
    if (!r || (input.softwareLicenseId && r.softwareLicenseId !== input.softwareLicenseId)) fail(); else pin(r.softwareProductId);
  }
  if (input.softwareProductId && !input.softwareLicenseId && !input.softwareInstallationId && !input.softwareActivationRequestId) {
    // A product alone may be any visible product the customer downloaded or licensed.
    const known = await db.softwareProduct.findFirst({
      where: { id: input.softwareProductId, OR: [{ downloads: { some: { customerId } } }, { licenses: { some: { customerId } } }] },
      select: { id: true },
    });
    if (!known) fail();
  }
  return {
    softwareProductId: productId,
    softwareLicenseId: input.softwareLicenseId ?? null,
    softwareInstallationId: input.softwareInstallationId ?? null,
    softwareActivationRequestId: input.softwareActivationRequestId ?? null,
  };
}

/** Options the customer may link a ticket to: only their own players / orders / library. */
export async function customerTicketLinkOptions(customerId: string) {
  const db = shopDb();
  const [players, orders, library, software] = await Promise.all([
    db.registeredPlayer.findMany({
      where: { customerId, status: { not: "RETIRED" } },
      select: { id: true, registrationCode: true, friendlyName: true, playerType: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: { customerId, status: { in: ["PAID", "FULFILLED", "PARTIALLY_REFUNDED", "REFUNDED"] } },
      select: { id: true, number: true, createdAt: true, totalCents: true, currency: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.entitlement.findMany({
      where: { customerId, status: "ACTIVE" },
      select: { arrangement: { select: { id: true, displayTitle: true } } },
      orderBy: { firstGrantedAt: "desc" },
      take: 200,
    }),
    db.softwareLicense.findMany({
      where: { customerId },
      orderBy: { purchasedAt: "desc" },
      select: {
        id: true, number: true, product: { select: { id: true, name: true } },
        installations: { where: { status: { not: "RETIRED" } }, select: { id: true, registrationCode: true, status: true } },
        activationRequests: { orderBy: { submittedAt: "desc" }, take: 3, select: { id: true, number: true, status: true } },
      },
    }),
  ]);
  return {
    software: software.map((l) => ({
      licenseId: l.id,
      productId: l.product.id,
      productName: l.product.name,
      licenseNumber: `LIC-${l.number}`,
      label: `${l.product.name}, license LIC-${l.number}`,
      installations: l.installations.map((i) => ({
        id: i.id, last4: i.registrationCode.slice(-4), label: `${l.product.name}, registration ending ${i.registrationCode.slice(-4)}`,
      })),
      requests: l.activationRequests.map((r) => ({ id: r.id, requestNumber: `ACT-${r.number}`, label: `Activation request ACT-${r.number}` })),
    })),
    // Friendly name first, then type and masked registration, so two players are easy to tell apart.
    players: players.map((p) => {
      const masked = maskRegistration(p.registrationCode);
      const name = p.friendlyName?.trim();
      return {
        id: p.id,
        name: name || `${p.playerType.name} ${masked}`,
        typeName: p.playerType.name,
        maskedRegistration: masked,
        label: name ? `${name} (${p.playerType.name} ${masked})` : `${p.playerType.name} ${masked}`,
      };
    }),
    orders: orders.map((o) => ({ id: o.id, label: `DMI-${String(o.number).padStart(6, "0")}`, createdAt: o.createdAt })),
    arrangements: library.map((e) => ({ id: e.arrangement.id, label: e.arrangement.displayTitle })),
    arrangementsByPlayer: await arrangementsByPlayer(customerId, players.map((p) => p.id)),
  };
}

/** Arrangements live on each of the customer's players (the "Music" support topic). */
async function arrangementsByPlayer(customerId: string, playerIds: string[]): Promise<Record<string, { id: string; label: string }[]>> {
  if (!playerIds.length) return {};
  const rows = await shopDb().musicLicense.findMany({
    where: { customerId, licensedPlayerId: { in: playerIds }, status: { in: LIVE_LICENSE_STATUSES } },
    select: { licensedPlayerId: true, arrangement: { select: { id: true, displayTitle: true } } },
    orderBy: { arrangement: { displayTitle: "asc" } },
    take: 5000,
  });
  const out: Record<string, { id: string; label: string }[]> = {};
  for (const r of rows) {
    if (!r.licensedPlayerId) continue;
    (out[r.licensedPlayerId] ??= []).push({ id: r.arrangement.id, label: r.arrangement.displayTitle });
  }
  return out;
}

export async function createTicket(customer: Customer, input: z.infer<typeof newTicketSchema>, files: FileInput[] = []) {
  const db = shopDb();
  // Ownership is decided here, never trusted from the browser.
  if (input.registeredPlayerId && !(await db.registeredPlayer.findFirst({ where: { id: input.registeredPlayerId, customerId: customer.id } }))) {
    throw new ShopError("VALIDATION_FAILED", "That player is not linked to your account");
  }
  if (input.orderId && !(await db.order.findFirst({ where: { id: input.orderId, customerId: customer.id } }))) {
    throw new ShopError("VALIDATION_FAILED", "That order is not on your account");
  }
  // An arrangement must be the customer's: owned (entitlement) or licensed on one of their
  // players. With a player named too, a license on that player also qualifies.
  if (input.arrangementId) {
    const [owned, licensed] = await Promise.all([
      db.entitlement.findFirst({ where: { customerId: customer.id, arrangementId: input.arrangementId }, select: { id: true } }),
      db.musicLicense.findFirst({
        where: {
          customerId: customer.id,
          arrangementId: input.arrangementId,
          ...(input.registeredPlayerId ? { licensedPlayerId: input.registeredPlayerId } : {}),
        },
        select: { id: true },
      }),
    ]);
    if (!owned && !licensed) throw new ShopError("VALIDATION_FAILED", "That arrangement is not in your library");
  }
  // Software links: each must belong to this customer, and they must agree with each other.
  const sw = await resolveSoftwareLinks(customer.id, input);
  const stored = await uploadAttachments(files);

  const ticket = await db.$transaction(async (tx) => {
    const now = new Date();
    const t = await tx.supportTicket.create({
      data: {
        customerId: customer.id,
        registeredPlayerId: input.registeredPlayerId ?? null,
        orderId: input.orderId ?? null,
        arrangementId: input.arrangementId ?? null,
        ...sw,
        category: input.category,
        subject: input.subject,
        status: "WAITING_FOR_SUPPORT",
        priority: ["REFUND_REQUEST", "PLAYER_PROBLEM", "SOFTWARE_ACTIVATION"].includes(input.category) ? "HIGH" : "NORMAL",
        lastCustomerReplyAt: now,
      },
    });
    const msg = await tx.supportMessage.create({
      data: { ticketId: t.id, authorType: "CUSTOMER", customerId: customer.id, visibility: "PUBLIC", body: input.message },
    });
    await saveAttachmentRows(tx, msg.id, stored);
    await recordActivity({
      tx, customerId: customer.id, type: "support.ticket_created",
      summary: `Opened ${ticketNumber(t.number)}: ${t.subject}`,
      metadata: { ticketId: t.id, category: t.category },
    });
    await audit({ type: "CUSTOMER", customerId: customer.id }, "support.ticket_created", { type: "SupportTicket", id: t.id }, { category: t.category }, tx);
    return t;
  });

  await notify({
    to: customer.email,
    subject: `We received your request ${ticketNumber(ticket.number)}`,
    text: `Thanks for contacting DMI. Your request "${ticket.subject}" has number ${ticketNumber(ticket.number)}. We will let you know as soon as there is a reply.`,
    actionUrl: appUrl(`/${customer.preferredLanguage ?? "en"}/shop/account/support/${ticket.id}`),
    actionLabel: "View your request",
  });
  return ticket;
}

const publicMessages = {
  where: { visibility: "PUBLIC" as MessageVisibility },
  orderBy: { createdAt: "asc" as const },
  select: {
    id: true, authorType: true, body: true, createdAt: true,
    staff: { select: { displayName: true } },
    attachments: { select: { id: true, fileName: true, contentType: true, sizeBytes: true } },
  },
} satisfies Prisma.SupportTicket$messagesArgs;

export async function listCustomerTickets(customerId: string) {
  return shopDb().supportTicket.findMany({
    where: { customerId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, number: true, subject: true, category: true, status: true, createdAt: true, updatedAt: true,
      lastStaffReplyAt: true, lastCustomerReplyAt: true,
    },
  });
}

/** Customer view: PUBLIC messages only, and only the customer's own ticket. */
export async function getCustomerTicket(customerId: string, ticketId: string) {
  const t = await shopDb().supportTicket.findFirst({
    where: { id: ticketId, customerId },
    select: {
      id: true, number: true, subject: true, category: true, status: true, createdAt: true, updatedAt: true, resolvedAt: true, closedAt: true,
      player: { select: { id: true, registrationCode: true, friendlyName: true, playerType: { select: { name: true } } } },
      order: { select: { id: true, number: true } },
      arrangement: { select: { id: true, displayTitle: true, slug: true } },
      softwareProduct: { select: { id: true, name: true, slug: true } },
      softwareLicense: { select: { id: true, number: true } },
      softwareActivationRequest: { select: { id: true, number: true, status: true } },
      messages: publicMessages,
    },
  });
  if (!t) return null;
  return {
    ...t,
    // Staff are shown by first name only to customers.
    messages: t.messages.map((m) => ({ ...m, staffName: m.staff?.displayName?.split(" ")[0] ?? (m.authorType === "STAFF" ? "DMI support" : null), staff: undefined })),
  };
}

export async function customerReply(customer: Customer, ticketId: string, body: string, files: FileInput[] = []) {
  const db = shopDb();
  const t = await db.supportTicket.findFirst({ where: { id: ticketId, customerId: customer.id } });
  if (!t) throw notFound("Request");
  if (t.status === "CLOSED") throw new ShopError("INVALID_STATE", "This request is closed. Please open a new request.");
  if (t.status === "RESOLVED" && t.resolvedAt && Date.now() - t.resolvedAt.getTime() > REOPEN_WINDOW_MS) {
    throw new ShopError("INVALID_STATE", "This request was resolved some time ago. Please open a new request.");
  }
  const stored = await uploadAttachments(files);
  await db.$transaction(async (tx) => {
    const msg = await tx.supportMessage.create({
      data: { ticketId: t.id, authorType: "CUSTOMER", customerId: customer.id, visibility: "PUBLIC", body },
    });
    await saveAttachmentRows(tx, msg.id, stored);
    await tx.supportTicket.update({
      where: { id: t.id },
      data: { status: "WAITING_FOR_SUPPORT", lastCustomerReplyAt: new Date(), ...(t.status === "RESOLVED" ? { resolvedAt: null } : {}) },
    });
    await recordActivity({
      tx, customerId: customer.id, type: t.status === "RESOLVED" ? "support.ticket_reopened" : "support.customer_replied",
      summary: `${t.status === "RESOLVED" ? "Reopened" : "Replied on"} ${ticketNumber(t.number)}`,
      metadata: { ticketId: t.id },
    });
  });
}

/** Attachment download for the customer: own ticket, PUBLIC message only. */
export async function customerAttachmentUrl(customerId: string, attachmentId: string) {
  const a = await shopDb().supportAttachment.findFirst({
    where: { id: attachmentId, message: { visibility: "PUBLIC", ticket: { customerId } } },
  });
  if (!a) throw notFound("Attachment");
  return (await storage().createDownloadUrl({ store: "SUPPORT", key: a.storageKey }, { expiresInSeconds: 120, filename: a.fileName })).url;
}

export async function customerSupportSummary(customerId: string) {
  const db = shopDb();
  const [openCount, recent] = await Promise.all([
    db.supportTicket.count({ where: { customerId, status: { in: OPEN_STATUSES } } }),
    db.supportTicket.findMany({
      where: { customerId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, number: true, subject: true, status: true, updatedAt: true },
    }),
  ]);
  return { openCount, recent };
}

// ─── Staff side ──────────────────────────────────────────────────────────────

export const INBOX_FILTERS = {
  needs_reply: "Needs staff reply",
  unassigned: "Unassigned",
  mine: "My tickets",
  in_progress: "In progress",
  waiting_customer: "Waiting for customer",
  high: "High priority",
  urgent: "Urgent",
  registration: "Registration",
  player_problem: "Player problem",
  billing: "Billing",
  resolved: "Resolved",
  closed: "Closed",
  all: "All",
} as const;
export type InboxFilter = keyof typeof INBOX_FILTERS;

function inboxWhere(filter: InboxFilter, staffId: string): Prisma.SupportTicketWhereInput {
  switch (filter) {
    case "needs_reply": return { status: { in: ["OPEN", "WAITING_FOR_SUPPORT"] } };
    case "unassigned": return { assignedStaffId: null, status: { in: OPEN_STATUSES } };
    case "mine": return { assignedStaffId: staffId, status: { in: OPEN_STATUSES } };
    case "in_progress": return { status: "IN_PROGRESS" };
    case "waiting_customer": return { status: "WAITING_FOR_CUSTOMER" };
    case "high": return { priority: { in: ["HIGH", "URGENT"] }, status: { in: OPEN_STATUSES } };
    case "urgent": return { priority: "URGENT", status: { in: OPEN_STATUSES } };
    case "registration": return { category: "PLAYER_REGISTRATION", status: { in: OPEN_STATUSES } };
    case "player_problem": return { category: "PLAYER_PROBLEM", status: { in: OPEN_STATUSES } };
    case "billing": return { category: { in: ["BILLING", "ORDER_PAYMENT", "REFUND_REQUEST"] }, status: { in: OPEN_STATUSES } };
    case "resolved": return { status: "RESOLVED" };
    case "closed": return { status: "CLOSED" };
    default: return {};
  }
}

export async function supportInbox(params: { filter?: InboxFilter; q?: string; page?: number; staffId: string }) {
  const db = shopDb();
  const filter: InboxFilter = params.filter && params.filter in INBOX_FILTERS ? params.filter : "needs_reply";
  const q = params.q?.trim();
  const num = q ? /^(?:SUP-?)?(\d+)$/i.exec(q)?.[1] : undefined;
  const where: Prisma.SupportTicketWhereInput = {
    AND: [
      inboxWhere(filter, params.staffId),
      q
        ? {
            OR: [
              ...(num ? [{ number: Number(num) }] : []),
              { subject: { contains: q, mode: "insensitive" } },
              { customer: { email: { contains: q, mode: "insensitive" } } },
              { customer: { companyName: { contains: q, mode: "insensitive" } } },
              { customer: { firstName: { contains: q, mode: "insensitive" } } },
              { customer: { lastName: { contains: q, mode: "insensitive" } } },
              { player: { registrationCode: { contains: q.replace(/[\s-]/g, ""), mode: "insensitive" } } },
              { softwareInstallation: { registrationCode: { contains: q.replace(/[\s-]/g, "").toUpperCase() } } },
            ],
          }
        : {},
    ],
  };
  const page = Math.max(params.page ?? 1, 1);
  const priorityOrder: Prisma.SupportTicketOrderByWithRelationInput[] = [{ priority: "desc" }, { updatedAt: "asc" }];
  const [total, items, counts] = await Promise.all([
    db.supportTicket.count({ where }),
    db.supportTicket.findMany({
      where,
      orderBy: ["resolved", "closed", "all"].includes(filter) ? [{ updatedAt: "desc" }] : priorityOrder,
      skip: (page - 1) * 50,
      take: 50,
      select: {
        id: true, number: true, subject: true, category: true, status: true, priority: true, createdAt: true, updatedAt: true,
        lastCustomerReplyAt: true, lastStaffReplyAt: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
        player: { select: { id: true, registrationCode: true, playerType: { select: { name: true } } } },
        assignedStaff: { select: { id: true, displayName: true, email: true } },
      },
    }),
    Promise.all(
      (["needs_reply", "unassigned", "mine", "high"] as InboxFilter[]).map(async (f) => [f, await db.supportTicket.count({ where: inboxWhere(f, params.staffId) })] as const),
    ),
  ]);
  return { filter, total, page, pageCount: Math.max(Math.ceil(total / 50), 1), items, counts: Object.fromEntries(counts) as Record<InboxFilter, number> };
}

/** Staff view: every message including INTERNAL notes. */
export async function getStaffTicket(ticketId: string) {
  return shopDb().supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true, accountType: true, phone: true, preferredLanguage: true } },
      player: { select: { id: true, registrationCode: true, serialNumber: true, status: true, playerType: { select: { name: true } } } },
      order: { select: { id: true, number: true, status: true, totalCents: true, currency: true } },
      arrangement: { select: { id: true, displayTitle: true, sku: true } },
      softwareProduct: { select: { id: true, name: true, slug: true } },
      softwareLicense: { select: { id: true, number: true, status: true } },
      softwareInstallation: { select: { id: true, registrationCode: true, status: true } },
      softwareActivationRequest: { select: { id: true, number: true, status: true } },
      assignedStaff: { select: { id: true, displayName: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          staff: { select: { displayName: true, email: true } },
          attachments: { select: { id: true, fileName: true, contentType: true, sizeBytes: true } },
        },
      },
      tasks: { include: { assignedStaff: { select: { displayName: true, email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

export async function staffMessage(
  s: { staffId: string },
  ticketId: string,
  input: z.infer<typeof staffTicketMessageSchema>,
  files: FileInput[] = [],
) {
  const db = shopDb();
  const t = await db.supportTicket.findUnique({ where: { id: ticketId }, include: { customer: true } });
  if (!t) throw notFound("Ticket");
  const stored = await uploadAttachments(files);
  const isPublic = input.visibility === "PUBLIC";
  const next: TicketStatus | null = isPublic
    ? input.nextStatus ?? (t.status === "CLOSED" ? "CLOSED" : "IN_PROGRESS")
    : null;
  const now = new Date();

  await db.$transaction(async (tx) => {
    const msg = await tx.supportMessage.create({
      data: { ticketId: t.id, authorType: "STAFF", staffId: s.staffId, visibility: input.visibility, body: input.message },
    });
    await saveAttachmentRows(tx, msg.id, stored);
    if (isPublic) {
      await tx.supportTicket.update({
        where: { id: t.id },
        data: {
          status: next!,
          lastStaffReplyAt: now,
          firstResponseAt: t.firstResponseAt ?? now,
          ...(next === "RESOLVED" ? { resolvedAt: now } : { resolvedAt: null }),
          ...(next !== "CLOSED" ? { closedAt: null } : {}),
          // Whoever answers an unassigned ticket picks it up.
          ...(t.assignedStaffId ? {} : { assignedStaffId: s.staffId }),
        },
      });
    } else {
      await tx.supportTicket.update({ where: { id: t.id }, data: { updatedAt: now } });
    }
    await recordActivity({
      tx, customerId: t.customerId, staffId: s.staffId,
      type: isPublic ? (next === "RESOLVED" ? "support.ticket_resolved" : "support.staff_replied") : "support.internal_note",
      summary: isPublic
        ? `${next === "RESOLVED" ? "Resolved" : next === "WAITING_FOR_CUSTOMER" ? "Asked for information on" : "Replied on"} ${ticketNumber(t.number)}`
        : `Internal note on ${ticketNumber(t.number)}`,
      metadata: { ticketId: t.id },
    });
    await audit({ type: "STAFF", staffId: s.staffId }, isPublic ? "support.reply" : "support.internal_note", { type: "SupportTicket", id: t.id }, {
      nextStatus: next,
    }, tx);
  });

  if (isPublic) {
    const link = appUrl(`/${t.customer.preferredLanguage ?? "en"}/shop/account/support/${t.id}`);
    const n = ticketNumber(t.number);
    await notify(
      next === "RESOLVED"
        ? { to: t.customer.email, subject: `${n} has been resolved`, text: `We marked your request "${t.subject}" as resolved. If something is still not right, reply from your account and we will pick it up again.`, actionUrl: link, actionLabel: "View your request" }
        : next === "WAITING_FOR_CUSTOMER"
          ? { to: t.customer.email, subject: `We need a little more information (${n})`, text: `Our team replied to "${t.subject}" and needs some information from you. Please answer from your account.`, actionUrl: link, actionLabel: "Reply" }
          : { to: t.customer.email, subject: `New reply on ${n}`, text: `Our team replied to your request "${t.subject}". Sign in to read it.`, actionUrl: link, actionLabel: "Read the reply" },
    );
  }
}

export async function updateTicket(s: { staffId: string }, ticketId: string, input: z.infer<typeof ticketPatchSchema>) {
  const db = shopDb();
  const t = await db.supportTicket.findUnique({ where: { id: ticketId } });
  if (!t) throw notFound("Ticket");
  if (input.assignedStaffId && !(await db.staffAccount.findFirst({ where: { id: input.assignedStaffId, status: "ACTIVE" } }))) {
    throw new ShopError("VALIDATION_FAILED", "Tickets can only be assigned to active staff");
  }
  const now = new Date();
  const data: Prisma.SupportTicketUncheckedUpdateInput = {};
  const changes: string[] = [];
  if (input.status && input.status !== t.status) {
    data.status = input.status;
    if (input.status === "RESOLVED") data.resolvedAt = now;
    if (input.status === "CLOSED") data.closedAt = now;
    if (!["RESOLVED", "CLOSED"].includes(input.status)) { data.resolvedAt = null; data.closedAt = null; }
    changes.push(`status ${t.status.toLowerCase().replace(/_/g, " ")} to ${input.status.toLowerCase().replace(/_/g, " ")}`);
  }
  if (input.priority && input.priority !== t.priority) { data.priority = input.priority; changes.push(`priority ${input.priority.toLowerCase()}`); }
  if (input.category && input.category !== t.category) { data.category = input.category; changes.push(`category ${input.category.toLowerCase().replace(/_/g, " ")}`); }
  if (input.assignedStaffId !== undefined && input.assignedStaffId !== t.assignedStaffId) {
    data.assignedStaffId = input.assignedStaffId;
    const who = input.assignedStaffId ? await db.staffAccount.findUnique({ where: { id: input.assignedStaffId }, select: { displayName: true, email: true } }) : null;
    changes.push(input.assignedStaffId ? `assigned to ${who?.displayName ?? who?.email ?? "staff"}` : "unassigned");
  }
  if (!changes.length) return t;
  const updated = await db.$transaction(async (tx) => {
    const u = await tx.supportTicket.update({ where: { id: t.id }, data });
    // Assignment and status changes are visible in the conversation as internal system lines.
    await tx.supportMessage.create({
      data: { ticketId: t.id, authorType: "SYSTEM", staffId: s.staffId, visibility: "INTERNAL", body: `Changed ${changes.join(", ")}.` },
    });
    await recordActivity({ tx, customerId: t.customerId, staffId: s.staffId, type: "support.ticket_updated", summary: `${ticketNumber(t.number)}: ${changes.join(", ")}`, metadata: { ticketId: t.id } });
    await audit({ type: "STAFF", staffId: s.staffId }, "support.ticket_updated", { type: "SupportTicket", id: t.id }, { changes }, tx);
    return u;
  });
  if (input.status === "RESOLVED" && t.status !== "RESOLVED") {
    const c = await db.customer.findUnique({ where: { id: t.customerId } });
    if (c) {
      await notify({
        to: c.email, subject: `${ticketNumber(t.number)} has been resolved`,
        text: `We marked your request "${t.subject}" as resolved. If something is still not right, reply from your account.`,
        actionUrl: appUrl(`/${c.preferredLanguage ?? "en"}/shop/account/support/${t.id}`), actionLabel: "View your request",
      });
    }
  }
  return updated;
}

/** Staff attachment download (any visibility). Audited. */
export async function staffAttachmentUrl(s: { staffId: string }, attachmentId: string) {
  const a = await shopDb().supportAttachment.findUnique({ where: { id: attachmentId }, include: { message: { select: { ticketId: true } } } });
  if (!a) throw notFound("Attachment");
  await audit({ type: "STAFF", staffId: s.staffId }, "support.attachment_downloaded", { type: "SupportAttachment", id: a.id }, { ticketId: a.message.ticketId });
  return (await storage().createDownloadUrl({ store: "SUPPORT", key: a.storageKey }, { expiresInSeconds: 120, filename: a.fileName })).url;
}

export async function ticketsForCustomer(customerId: string) {
  return shopDb().supportTicket.findMany({
    where: { customerId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, number: true, subject: true, status: true, priority: true, category: true, updatedAt: true, createdAt: true,
      registeredPlayerId: true, assignedStaff: { select: { displayName: true, email: true } },
    },
  });
}

export async function supportDashboard(staffId: string) {
  const db = shopDb();
  const [needsReply, unassigned, mine, urgent, oldest] = await Promise.all([
    db.supportTicket.count({ where: inboxWhere("needs_reply", staffId) }),
    db.supportTicket.count({ where: inboxWhere("unassigned", staffId) }),
    db.supportTicket.count({ where: inboxWhere("mine", staffId) }),
    db.supportTicket.count({ where: { priority: "URGENT", status: { in: OPEN_STATUSES } } }),
    db.supportTicket.findMany({
      where: inboxWhere("needs_reply", staffId),
      orderBy: [{ priority: "desc" }, { lastCustomerReplyAt: "asc" }],
      take: 5,
      select: { id: true, number: true, subject: true, priority: true, lastCustomerReplyAt: true, customer: { select: { email: true, companyName: true } } },
    }),
  ]);
  return { needsReply, unassigned, mine, urgent, oldest };
}

export type { SupportTicket };
