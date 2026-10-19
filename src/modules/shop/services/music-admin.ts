import "server-only";
import type { MusicLicenseSource, MusicLicenseStatus, PlayerStatus, Prisma } from "@/generated/shop-prisma/client";
import { runLegacyMusicMigration } from "../migration/legacy-music";
import { shopDb } from "../db";
import { notFound } from "../errors";
import { formatOrderNumber } from "./checkout";
import { audit } from "./audit";
import { LIVE_LICENSE_STATUSES, maskRegistration, playerDisplayName } from "./music-licenses";
import { listTransfers } from "./music-transfers";

/** Staff-side reads for the player-centric CRM: players, licenses, migration queue. */

const PLAYER_LIST_SELECT = {
  id: true, friendlyName: true, adminLabel: true, registrationCode: true, serialNumber: true, status: true, activatedAt: true, retiredAt: true, createdAt: true,
  playerType: { select: { id: true, name: true, code: true, supportsMusicLibrary: true } },
  customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
} satisfies Prisma.RegisteredPlayerSelect;

export async function listPlayersAdmin(params: { q?: string; status?: PlayerStatus | "all"; typeId?: string; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim() ?? "";
  const compact = q.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const where: Prisma.RegisteredPlayerWhereInput = {
    ...(params.status && params.status !== "all" ? { status: params.status } : {}),
    ...(params.typeId ? { playerTypeId: params.typeId } : {}),
    ...(q ? {
      OR: [
        ...(compact.length >= 3 ? [{ registrationCode: { contains: compact } }, { registrationIdentifier: { contains: compact } }] : []),
        { serialNumber: { contains: q, mode: "insensitive" } },
        { friendlyName: { contains: q, mode: "insensitive" } },
        { adminLabel: { contains: q, mode: "insensitive" } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { customer: { lastName: { contains: q, mode: "insensitive" } } },
        { customer: { companyName: { contains: q, mode: "insensitive" } } },
      ],
    } : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = 50;
  const [total, rows] = await Promise.all([
    db.registeredPlayer.count({ where }),
    db.registeredPlayer.findMany({ where, select: PLAYER_LIST_SELECT, orderBy: [{ status: "asc" }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  const counts = rows.length
    ? await db.musicLicense.groupBy({ by: ["licensedPlayerId"], where: { licensedPlayerId: { in: rows.map((r) => r.id) }, status: { in: LIVE_LICENSE_STATUSES } }, _count: { _all: true } })
    : [];
  const byPlayer = new Map(counts.map((c) => [c.licensedPlayerId!, c._count._all]));
  return {
    total, page, pages: Math.max(Math.ceil(total / pageSize), 1),
    items: rows.map((r) => ({ ...r, name: playerDisplayName(r), maskedRegistration: maskRegistration(r.registrationCode), licenseCount: byPlayer.get(r.id) ?? 0 })),
  };
}

/** Everything staff need on one player page. Activation key never included. */
export async function adminPlayerDetail(playerId: string) {
  const db = shopDb();
  const player = await db.registeredPlayer.findUnique({
    where: { id: playerId },
    select: {
      ...PLAYER_LIST_SELECT,
      customerId: true, registrationIdentifier: true, purchaseDate: true, warrantyUntil: true, dealerName: true, registeredAt: true, suspendedAt: true, updatedAt: true,
      activationKeyEncrypted: true,
      playerType: { select: { id: true, name: true, code: true, supportsMusicLibrary: true, softwareProduct: { select: { id: true, name: true } } } },
      softwareInstallations: {
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, label: true, activatedAt: true, product: { select: { name: true } }, license: { select: { id: true, number: true, status: true } } },
      },
    },
  });
  if (!player) throw notFound("Player");
  const { activationKeyEncrypted, ...rest } = player;
  const [licenseCounts, sources, transfers, deliveries, orders, tickets, activity, otherPlayers] = await Promise.all([
    db.musicLicense.groupBy({ by: ["status"], where: { licensedPlayerId: playerId }, _count: { _all: true } }),
    db.musicLicense.groupBy({ by: ["licenseSource"], where: { licensedPlayerId: playerId, status: { in: LIVE_LICENSE_STATUSES } }, _count: { _all: true } }),
    listTransfers({ playerId, take: 50 }),
    db.deliveryArtifact.findMany({
      where: { registeredPlayerId: playerId },
      orderBy: { createdAt: "desc" },
      take: 25,
      select: { id: true, createdAt: true, encoderVersion: true, protectionProfileVersion: true, bytes: true, arrangement: { select: { displayTitle: true } } },
    }),
    db.orderItem.findMany({
      where: { targetPlayerId: playerId },
      orderBy: { order: { createdAt: "desc" } },
      take: 50,
      select: { id: true, titleSnapshot: true, chargedCents: true, itemType: true, order: { select: { id: true, number: true, status: true, currency: true, createdAt: true } } },
    }),
    db.supportTicket.findMany({
      where: { registeredPlayerId: playerId },
      orderBy: { updatedAt: "desc" },
      take: 25,
      select: { id: true, number: true, subject: true, status: true, updatedAt: true },
    }),
    db.customerActivity.findMany({
      where: { customerId: player.customerId, metadata: { path: ["playerId"], equals: playerId } },
      orderBy: { occurredAt: "desc" },
      take: 30,
      select: { id: true, type: true, summary: true, occurredAt: true },
    }),
    db.registeredPlayer.findMany({
      where: { customerId: player.customerId, id: { not: playerId } },
      select: { id: true, friendlyName: true, registrationCode: true, status: true, playerType: { select: { name: true, supportsMusicLibrary: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const count = (s: MusicLicenseStatus) => licenseCounts.find((c) => c.status === s)?._count._all ?? 0;
  return {
    player: { ...rest, name: playerDisplayName(rest), maskedRegistration: maskRegistration(rest.registrationCode), hasActivationKey: !!activationKeyEncrypted },
    licenses: { active: count("ACTIVE"), transferPending: count("TRANSFER_PENDING"), retired: count("RETIRED"), revoked: count("REVOKED") },
    sources: sources.map((s) => ({ source: s.licenseSource, count: s._count._all })),
    transfers,
    deliveries: deliveries.map((d) => ({ ...d, bytes: Number(d.bytes) })),
    orders: orders.map((o) => ({ ...o, orderNumber: formatOrderNumber(o.order.number) })),
    tickets,
    activity,
    otherPlayers: otherPlayers.map((p) => ({ id: p.id, name: playerDisplayName(p), status: p.status, supportsMusicLibrary: p.playerType.supportsMusicLibrary, maskedRegistration: maskRegistration(p.registrationCode) })),
  };
}

/** Licenses on one player (any status) for the admin library table, with search + paging. */
export async function adminPlayerLicenses(playerId: string, params: { q?: string; status?: MusicLicenseStatus | "live" | "all"; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim();
  const status = params.status ?? "live";
  const where: Prisma.MusicLicenseWhereInput = {
    licensedPlayerId: playerId,
    ...(status === "live" ? { status: { in: LIVE_LICENSE_STATUSES } } : status === "all" ? {} : { status }),
    ...(q ? { arrangement: { OR: [{ displayTitle: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }, { work: { originalArtist: { contains: q, mode: "insensitive" } } }] } } : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = 50;
  const [total, items] = await Promise.all([
    db.musicLicense.count({ where }),
    db.musicLicense.findMany({
      where, orderBy: [{ arrangement: { displayTitle: "asc" } }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: {
        id: true, status: true, licenseSource: true, createdAt: true, activatedAt: true, retiredAt: true, revokedAt: true, statusReason: true, reason: true,
        pricePaidCents: true, currency: true, orderId: true, order: { select: { number: true } }, grantedBy: { select: { displayName: true, email: true } },
        arrangement: { select: { id: true, sku: true, displayTitle: true, work: { select: { originalArtist: true } } } },
      },
    }),
  ]);
  return { total, page, pages: Math.max(Math.ceil(total / pageSize), 1), items: items.map((i) => ({ ...i, orderNumber: i.order ? formatOrderNumber(i.order.number) : null })) };
}

/** Customer-wide music matrix for the CRM Music tab: arrangement → players. */
export async function customerMusicMatrix(customerId: string, params: { playerId?: string; status?: "live" | "ended" | "unassigned" | "all"; source?: MusicLicenseSource; q?: string } = {}) {
  const db = shopDb();
  const status = params.status ?? "live";
  const rows = await db.musicLicense.findMany({
    where: {
      customerId,
      ...(params.playerId ? { licensedPlayerId: params.playerId } : {}),
      ...(params.source ? { licenseSource: params.source } : {}),
      ...(status === "live" ? { status: { in: LIVE_LICENSE_STATUSES } } : status === "ended" ? { status: { in: ["RETIRED", "REVOKED"] } } : status === "unassigned" ? { status: "UNASSIGNED" } : {}),
      ...(params.q?.trim() ? { arrangement: { displayTitle: { contains: params.q.trim(), mode: "insensitive" } } } : {}),
    },
    orderBy: [{ arrangement: { displayTitle: "asc" } }, { createdAt: "asc" }],
    take: 2000,
    select: {
      id: true, status: true, licenseSource: true, createdAt: true, needsReview: true, statusReason: true,
      arrangement: { select: { id: true, displayTitle: true, sku: true } },
      licensedPlayer: { select: { id: true, friendlyName: true, registrationCode: true, playerType: { select: { name: true } } } },
    },
  });
  const by = new Map<string, { arrangement: (typeof rows)[number]["arrangement"]; licenses: { id: string; status: MusicLicenseStatus; source: MusicLicenseSource; createdAt: Date; needsReview: boolean; statusReason: string | null; player: { id: string; name: string } | null }[] }>();
  for (const r of rows) {
    const e = by.get(r.arrangement.id) ?? { arrangement: r.arrangement, licenses: [] };
    e.licenses.push({
      id: r.id, status: r.status, source: r.licenseSource, createdAt: r.createdAt, needsReview: r.needsReview, statusReason: r.statusReason,
      player: r.licensedPlayer ? { id: r.licensedPlayer.id, name: playerDisplayName(r.licensedPlayer) } : null,
    });
    by.set(r.arrangement.id, e);
  }
  return [...by.values()];
}

/** Global music-license search for /admin/shop/music. */
export async function searchMusicLicenses(params: { q?: string; status?: MusicLicenseStatus | "all"; source?: MusicLicenseSource; page?: number }) {
  const db = shopDb();
  const q = params.q?.trim();
  const where: Prisma.MusicLicenseWhereInput = {
    ...(params.status && params.status !== "all" ? { status: params.status } : {}),
    ...(params.source ? { licenseSource: params.source } : {}),
    ...(q ? {
      OR: [
        { arrangement: { displayTitle: { contains: q, mode: "insensitive" } } },
        { arrangement: { sku: { contains: q, mode: "insensitive" } } },
        { customer: { email: { contains: q, mode: "insensitive" } } },
        { licensedPlayer: { friendlyName: { contains: q, mode: "insensitive" } } },
        { licensedPlayer: { registrationCode: { contains: q.toUpperCase().replace(/[^A-Z0-9]/g, "") || q } } },
      ],
    } : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = 50;
  const [total, items] = await Promise.all([
    db.musicLicense.count({ where }),
    db.musicLicense.findMany({
      where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize,
      select: {
        id: true, status: true, licenseSource: true, createdAt: true, needsReview: true,
        arrangement: { select: { id: true, displayTitle: true, sku: true } },
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        licensedPlayer: { select: { id: true, friendlyName: true, registrationCode: true, playerType: { select: { name: true } } } },
      },
    }),
  ]);
  return {
    total, page, pages: Math.max(Math.ceil(total / pageSize), 1),
    items: items.map((i) => ({ ...i, playerName: i.licensedPlayer ? playerDisplayName(i.licensedPlayer) : null })),
  };
}

/** /admin/shop/music/migration: customers whose legacy music still needs a player. */
export async function migrationQueue() {
  const db = shopDb();
  const grouped = await db.musicLicense.groupBy({
    by: ["customerId", "needsReview"],
    where: { status: "UNASSIGNED" },
    _count: { _all: true },
  });
  const ids = [...new Set(grouped.map((g) => g.customerId))];
  if (!ids.length) return [];
  const [customers, players, active] = await Promise.all([
    db.customer.findMany({ where: { id: { in: ids } }, select: { id: true, email: true, firstName: true, lastName: true, companyName: true } }),
    db.registeredPlayer.groupBy({ by: ["customerId"], where: { customerId: { in: ids }, status: "ACTIVE", playerType: { supportsMusicLibrary: true } }, _count: { _all: true } }),
    db.musicLicense.groupBy({ by: ["customerId"], where: { customerId: { in: ids }, status: "ACTIVE" }, _count: { _all: true } }),
  ]);
  return customers.map((c) => {
    const review = grouped.find((g) => g.customerId === c.id && g.needsReview)?._count._all ?? 0;
    const waiting = grouped.find((g) => g.customerId === c.id && !g.needsReview)?._count._all ?? 0;
    const playerCount = players.find((p) => p.customerId === c.id)?._count._all ?? 0;
    return {
      customer: c,
      needsReview: review,
      waiting,
      players: playerCount,
      activeLicenses: active.find((a) => a.customerId === c.id)?._count._all ?? 0,
      status: review > 0 ? "NEEDS_REVIEW" as const : playerCount === 0 ? "WAITING_FOR_PLAYER" as const : "READY_TO_ASSIGN" as const,
    };
  }).sort((a, b) => b.needsReview - a.needsReview || b.waiting - a.waiting);
}

/** Unassigned licenses of one customer (for the review screen). */
export async function unassignedLicenses(customerId: string) {
  return shopDb().musicLicense.findMany({
    where: { customerId, status: "UNASSIGNED" },
    orderBy: [{ needsReview: "desc" }, { arrangement: { displayTitle: "asc" } }],
    select: {
      id: true, needsReview: true, statusReason: true, licenseSource: true, createdAt: true, orderId: true,
      arrangement: { select: { id: true, displayTitle: true, sku: true } },
    },
  });
}

export async function runMigrationFromAdmin(staffId: string, opts: { dryRun: boolean; customerId?: string }) {
  const report = await runLegacyMusicMigration(shopDb(), { dryRun: opts.dryRun, customerIds: opts.customerId ? [opts.customerId] : undefined });
  if (!opts.dryRun) {
    await audit({ type: "STAFF", staffId }, "music_migration.applied", { type: "MusicLicense", id: opts.customerId ?? "all" }, { totals: report.totals });
  }
  return report;
}
