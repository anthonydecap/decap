import "server-only";
import type { Prisma } from "@/generated/shop-prisma/client";
import { shopDb } from "../db";
import { formatOrderNumber } from "./checkout";

/** Read models for the admin dashboard, orders, customers, royalties and audit log. */

export async function dashboardMetrics() {
  const db = shopDb();
  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const paidStatuses = ["FULFILLED", "PARTIALLY_REFUNDED", "REFUNDED", "PAID"] as const;
  const [revenue, orders30, customers, published, drafts, bundles, pendingImports, invalidAssets, recentOrders, recentAudit] =
    await Promise.all([
      db.order.aggregate({
        where: { status: { in: [...paidStatuses] }, paidAt: { gte: since30 } },
        _sum: { totalCents: true, refundedCents: true },
      }),
      db.order.count({ where: { status: { in: [...paidStatuses] }, paidAt: { gte: since30 } } }),
      db.customer.count(),
      db.arrangement.count({ where: { status: "PUBLISHED" } }),
      db.arrangement.count({ where: { status: "DRAFT" } }),
      db.bundle.count({ where: { status: "PUBLISHED" } }),
      db.importBatch.count({ where: { status: { in: ["UPLOADING", "VALIDATING", "REVIEW_REQUIRED", "READY"] } } }),
      db.assetVersion.count({ where: { status: "INVALID", supersededAt: null } }),
      db.order.findMany({
        where: { status: { not: "CANCELED" } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, number: true, status: true, totalCents: true, currency: true, createdAt: true, customerEmailSnapshot: true },
      }),
      db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
  return {
    grossCents30: revenue._sum.totalCents ?? 0,
    refundedCents30: revenue._sum.refundedCents ?? 0,
    orders30,
    customers,
    published,
    drafts,
    bundles,
    pendingImports,
    invalidAssets,
    recentOrders: recentOrders.map((o) => ({ ...o, orderNumber: formatOrderNumber(o.number) })),
    recentAudit,
  };
}

export async function searchOrders(params: { q?: string; status?: string; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim();
  const numeric = q?.replace(/^DMI-/i, "");
  const where: Prisma.OrderWhereInput = {
    ...(params.status ? { status: params.status as Prisma.EnumOrderStatusFilter["equals"] } : {}),
    ...(q
      ? {
          OR: [
            ...(numeric && /^\d+$/.test(numeric) ? [{ number: Number(numeric) }] : []),
            { customerEmailSnapshot: { contains: q, mode: "insensitive" as const } },
            { stripePaymentIntentId: q },
          ],
        }
      : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const [total, rows] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 50, take: 50,
      select: {
        id: true, number: true, status: true, totalCents: true, refundedCents: true, currency: true, createdAt: true,
        customerEmailSnapshot: true, customerId: true, _count: { select: { allocations: true } },
      },
    }),
  ]);
  return { total, page, pageCount: Math.max(Math.ceil(total / 50), 1), items: rows.map((o) => ({ ...o, orderNumber: formatOrderNumber(o.number) })) };
}

export async function getOrderAdmin(id: string) {
  const order = await shopDb().order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: { orderBy: { position: "asc" }, include: { allocations: { include: { entitlementSource: true } } } },
      refunds: { orderBy: { createdAt: "desc" }, include: { allocations: true } },
      royaltyEntries: { orderBy: { occurredAt: "asc" } },
    },
  });
  return order ? { ...order, orderNumber: formatOrderNumber(order.number) } : null;
}

export async function searchCustomers(params: { q?: string; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim();
  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const page = Math.max(params.page ?? 1, 1);
  const [total, items] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 50, take: 50,
      select: {
        id: true, email: true, firstName: true, lastName: true, emailVerified: true, countryCode: true, createdAt: true,
        _count: { select: { orders: true, entitlements: { where: { status: "ACTIVE" } } } },
      },
    }),
  ]);
  return { total, items, page, pageCount: Math.max(Math.ceil(total / 50), 1) };
}

export async function getCustomerAdmin(id: string) {
  const db = shopDb();
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      legalAcceptances: { orderBy: { acceptedAt: "desc" } },
      entitlements: {
        orderBy: { firstGrantedAt: "desc" },
        include: {
          arrangement: { select: { id: true, sku: true, displayTitle: true } },
          sources: { orderBy: { grantedAt: "asc" } },
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        select: { id: true, number: true, status: true, totalCents: true, refundedCents: true, currency: true, createdAt: true },
      },
    },
  });
  if (!customer) return null;
  return { ...customer, orders: customer.orders.map((o) => ({ ...o, orderNumber: formatOrderNumber(o.number) })) };
}

export async function royaltyReport(params: { from: Date; to: Date; arrangerId?: string }) {
  const db = shopDb();
  const where: Prisma.RoyaltyLedgerEntryWhereInput = {
    occurredAt: { gte: params.from, lt: params.to },
    ...(params.arrangerId ? { arrangerId: params.arrangerId } : {}),
  };
  const [grouped, arrangers, entries] = await Promise.all([
    db.royaltyLedgerEntry.groupBy({
      by: ["arrangerId", "entryType", "currency"],
      where,
      _sum: { amountCents: true, netRevenueCents: true },
      _count: { _all: true },
    }),
    db.arranger.findMany({ select: { id: true, name: true } }),
    params.arrangerId
      ? db.royaltyLedgerEntry.findMany({ where, orderBy: { occurredAt: "desc" }, take: 500 })
      : Promise.resolve([]),
  ]);
  const names = new Map(arrangers.map((a) => [a.id, a.name]));
  const byArranger = new Map<string, {
    arrangerId: string; name: string; currency: string; salesCount: number; refundCount: number;
    netRevenueCents: number; royaltyCents: number;
  }>();
  for (const g of grouped) {
    const key = `${g.arrangerId}:${g.currency}`;
    const row = byArranger.get(key) ?? {
      arrangerId: g.arrangerId, name: names.get(g.arrangerId) ?? "Unknown arranger", currency: g.currency,
      salesCount: 0, refundCount: 0, netRevenueCents: 0, royaltyCents: 0,
    };
    if (g.entryType === "SALE") row.salesCount += g._count._all;
    if (g.entryType === "REFUND") row.refundCount += g._count._all;
    row.netRevenueCents += g._sum.netRevenueCents ?? 0;
    row.royaltyCents += g._sum.amountCents ?? 0;
    byArranger.set(key, row);
  }
  return { rows: [...byArranger.values()].sort((a, b) => b.royaltyCents - a.royaltyCents), entries };
}

export async function listAuditLog(params: { action?: string; entityType?: string; entityId?: string; page?: number }) {
  const db = shopDb();
  const where: Prisma.AuditLogWhereInput = {
    ...(params.action ? { action: { startsWith: params.action } } : {}),
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(params.entityId ? { entityId: params.entityId } : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const [total, items] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 100, take: 100 }),
  ]);
  return { total, items, page, pageCount: Math.max(Math.ceil(total / 100), 1) };
}
