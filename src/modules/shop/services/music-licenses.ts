import "server-only";
import type {
  MusicLicenseSource,
  MusicLicenseStatus,
  Prisma,
} from "@/generated/shop-prisma/client";
import { additionalPlayerPriceCents, type MusicPolicy } from "../domain/music-policy";
import { targetKeyOf, UNASSIGNED_TARGET, type PricingCartLine, type PricingCatalogBundle, type PricingTarget } from "../domain/cart-pricing";
import { shopDb, type ShopTx } from "../db";
import { ShopError, notFound } from "../errors";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { grantEntitlementSource } from "./entitlements";
import { getMusicPolicy } from "./music-policy";

/**
 * Player-bound music licensing.
 *
 *   Entitlement   = commercial acquisition history ("this customer bought / was given X").
 *   MusicLicense  = the right to have ONE arrangement delivered for ONE registered player.
 *
 * Everything that decides whether music may be delivered, what a player's library is, or
 * whether a purchase is a duplicate, reads MusicLicense. Rows are never deleted: moves
 * retire the old row and create a continuation (`originalMusicLicenseId`), with a
 * MusicLicenseEvent per step.
 */

export const LIVE_LICENSE_STATUSES: MusicLicenseStatus[] = ["ACTIVE", "TRANSFER_PENDING"];

/** "••••91PL": enough for a customer to recognise their player, useless to anyone else. */
export function maskRegistration(code: string | null | undefined): string {
  if (!code) return "";
  return `••••${code.slice(-4)}`;
}

/**
 * What a customer calls a player: their own name for it, else the software's name. Always
 * shown together with the masked registration where two players could share a name.
 */
export function playerDisplayName(p: { friendlyName?: string | null; registrationCode: string; playerType: { name: string } }): string {
  return p.friendlyName?.trim() || p.playerType.name;
}

// ─── Players as music targets ───────────────────────────────────────────────

export const MUSIC_PLAYER_SELECT = {
  id: true,
  customerId: true,
  friendlyName: true,
  registrationCode: true,
  status: true,
  activatedAt: true,
  retiredAt: true,
  createdAt: true,
  playerTypeId: true,
  playerType: {
    select: {
      id: true, code: true, name: true, supportsMusicLibrary: true, softwareProductId: true,
      softwareProduct: { select: { id: true, name: true, slug: true } },
    },
  },
  softwareInstallations: {
    where: { status: "ACTIVE" as const },
    select: { license: { select: { status: true } } },
  },
} satisfies Prisma.RegisteredPlayerSelect;

type MusicPlayerRow = Prisma.RegisteredPlayerGetPayload<{ select: typeof MUSIC_PLAYER_SELECT }>;

export type IneligibleReason = "NOT_ACTIVE" | "NO_MUSIC_LIBRARY" | "SOFTWARE_LICENSE_REQUIRED";

export type MusicPlayer = {
  id: string;
  customerId: string;
  name: string;
  friendlyName: string | null;
  typeName: string;
  typeCode: string;
  maskedRegistration: string;
  status: MusicPlayerRow["status"];
  supportsMusicLibrary: boolean;
  softwareLicensed: boolean;
  softwareProduct: { id: string; name: string; slug: string } | null;
  eligible: boolean;
  ineligibleReason: IneligibleReason | null;
  activatedAt: Date | null;
  retiredAt: Date | null;
};

export function toMusicPlayer(row: MusicPlayerRow, policy: MusicPolicy): MusicPlayer {
  const softwareLicensed = row.softwareInstallations.some((i) => i.license.status === "ACTIVE");
  const ineligibleReason: IneligibleReason | null =
    row.status !== "ACTIVE" ? "NOT_ACTIVE"
    : !row.playerType.supportsMusicLibrary ? "NO_MUSIC_LIBRARY"
    : policy.requireActiveSoftwareLicenseForMusic && !softwareLicensed ? "SOFTWARE_LICENSE_REQUIRED"
    : null;
  return {
    id: row.id,
    customerId: row.customerId,
    name: playerDisplayName(row),
    friendlyName: row.friendlyName,
    typeName: row.playerType.name,
    typeCode: row.playerType.code,
    maskedRegistration: maskRegistration(row.registrationCode),
    status: row.status,
    supportsMusicLibrary: row.playerType.supportsMusicLibrary,
    softwareLicensed,
    softwareProduct: row.playerType.softwareProduct,
    eligible: ineligibleReason === null,
    ineligibleReason,
    activatedAt: row.activatedAt,
    retiredAt: row.retiredAt,
  };
}

/** All of a customer's players as music targets (retired last). */
export async function customerMusicPlayers(customerId: string, tx?: ShopTx): Promise<MusicPlayer[]> {
  const db = tx ?? shopDb();
  const [rows, policy] = await Promise.all([
    db.registeredPlayer.findMany({
      where: { customerId },
      select: MUSIC_PLAYER_SELECT,
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    }),
    getMusicPolicy(tx),
  ]);
  const order = { ACTIVE: 0, PENDING: 1, SUSPENDED: 2, RETIRED: 3 } as const;
  return rows.map((r) => toMusicPlayer(r, policy)).sort((a, b) => order[a.status] - order[b.status]);
}

/** Only players that may receive music right now. */
export async function eligibleMusicPlayers(customerId: string, tx?: ShopTx): Promise<MusicPlayer[]> {
  return (await customerMusicPlayers(customerId, tx)).filter((p) => p.eligible && p.supportsMusicLibrary);
}

/**
 * The IDOR gate for every customer action that names a player: it must exist, belong to
 * this customer, be ACTIVE and be able to receive music. The browser-sent id is never trusted.
 */
export async function requireCustomerMusicPlayer(customerId: string, playerId: string, tx?: ShopTx): Promise<MusicPlayer> {
  const db = tx ?? shopDb();
  const row = await db.registeredPlayer.findFirst({ where: { id: playerId, customerId }, select: MUSIC_PLAYER_SELECT });
  if (!row) throw new ShopError("NOT_FOUND", "Player not found");
  const player = toMusicPlayer(row, await getMusicPolicy(tx));
  if (!player.eligible) {
    const message = player.ineligibleReason === "SOFTWARE_LICENSE_REQUIRED"
      ? `A full ${player.softwareProduct?.name ?? "DMI Player"} license is required before music can be added to ${player.name}.`
      : player.ineligibleReason === "NO_MUSIC_LIBRARY"
        ? `${player.name} cannot receive music.`
        : `${player.name} is not active, so music cannot be added to it.`;
    throw new ShopError("PLAYER_REQUIRED", message, { reason: player.ineligibleReason, playerId: player.id });
  }
  return player;
}

/** Customer may rename their own player. Nothing else about a player is customer-editable. */
export async function renameCustomerPlayer(customerId: string, playerId: string, friendlyName: string | null) {
  const db = shopDb();
  const player = await db.registeredPlayer.findFirst({ where: { id: playerId, customerId }, select: { id: true, friendlyName: true } });
  if (!player) throw new ShopError("NOT_FOUND", "Player not found");
  const name = friendlyName?.trim().replace(/\s+/g, " ").slice(0, 60) || null;
  await db.registeredPlayer.update({ where: { id: player.id }, data: { friendlyName: name } });
  await audit({ type: "CUSTOMER", customerId }, "player.renamed", { type: "RegisteredPlayer", id: player.id }, { from: player.friendlyName, to: name });
  return name;
}

// ─── Compatibility ──────────────────────────────────────────────────────────

/**
 * Which of `arrangementIds` are compatible with a player type. `null` means the type has no
 * profile restriction (everything is compatible). An arrangement is compatible when it
 * lists no profiles at all, lists a generic profile, or shares a profile with the type.
 */
export async function compatibleArrangementIds(
  playerTypeId: string,
  arrangementIds: readonly string[],
  tx?: ShopTx,
): Promise<Set<string> | null> {
  const db = tx ?? shopDb();
  const type = await db.playerType.findUnique({ where: { id: playerTypeId }, select: { systemProfiles: { select: { id: true } } } });
  if (!type || type.systemProfiles.length === 0) return null;
  const typeProfiles = new Set(type.systemProfiles.map((p) => p.id));
  const ids = [...new Set(arrangementIds)];
  if (!ids.length) return new Set();
  const rows = await db.arrangementCompatibility.findMany({
    where: { arrangementId: { in: ids } },
    select: { arrangementId: true, systemProfileId: true, systemProfile: { select: { isGeneric: true } } },
  });
  const byArrangement = new Map<string, typeof rows>();
  for (const r of rows) byArrangement.set(r.arrangementId, [...(byArrangement.get(r.arrangementId) ?? []), r]);
  return new Set(ids.filter((id) => {
    const compat = byArrangement.get(id);
    return !compat || compat.some((c) => c.systemProfile.isGeneric || typeProfiles.has(c.systemProfileId));
  }));
}

// ─── Pricing context ────────────────────────────────────────────────────────

/** Arrangement ids of a customer's live (and unassigned) licenses, keyed by player. */
async function licenseIndex(customerId: string, tx?: ShopTx) {
  const db = tx ?? shopDb();
  const rows = await db.musicLicense.findMany({
    where: { customerId, status: { in: [...LIVE_LICENSE_STATUSES, "UNASSIGNED"] } },
    select: { arrangementId: true, licensedPlayerId: true, status: true },
  });
  const byPlayer = new Map<string, Set<string>>();
  const all = new Set<string>();
  for (const r of rows) {
    all.add(r.arrangementId);
    const key = r.status === "UNASSIGNED" ? UNASSIGNED_TARGET : targetKeyOf(r.licensedPlayerId);
    if (!byPlayer.has(key)) byPlayer.set(key, new Set());
    byPlayer.get(key)!.add(r.arrangementId);
  }
  return { byPlayer, all };
}

/**
 * Everything `priceCart` needs to price a signed-in customer's music per player. Players
 * that are not this customer's (or not eligible) come back `eligible: false`, so a forged
 * target id is dropped from the cart instead of being priced.
 */
export async function loadPricingTargets(
  customerId: string,
  lines: readonly PricingCartLine[],
  bundles: ReadonlyMap<string, PricingCatalogBundle>,
  tx?: ShopTx,
) {
  const db = tx ?? shopDb();
  const policy = await getMusicPolicy(tx);
  const musicLines = lines.filter((l) => l.type !== "SOFTWARE_LICENSE") as Extract<PricingCartLine, { type: "ARRANGEMENT" | "BUNDLE" }>[];
  const playerIds = [...new Set(musicLines.map((l) => l.targetPlayerId).filter(Boolean) as string[])];
  const [rows, index, eligiblePlayers] = await Promise.all([
    playerIds.length
      ? db.registeredPlayer.findMany({ where: { id: { in: playerIds }, customerId }, select: MUSIC_PLAYER_SELECT })
      : Promise.resolve([]),
    licenseIndex(customerId, tx),
    eligibleMusicPlayers(customerId, tx),
  ]);

  const targets = new Map<string, PricingTarget>();
  for (const row of rows) {
    const player = toMusicPlayer(row, policy);
    const arrangementIds = musicLines
      .filter((l) => l.targetPlayerId === row.id)
      .flatMap((l) => (l.type === "BUNDLE" ? (bundles.get(l.bundleId)?.items.map((i) => i.arrangementId) ?? []) : [l.arrangementId]));
    targets.set(row.id, {
      playerId: row.id,
      label: player.name,
      eligible: player.eligible,
      licensedArrangementIds: index.byPlayer.get(row.id) ?? new Set(),
      compatibleArrangementIds: await compatibleArrangementIds(row.playerTypeId, arrangementIds, tx),
    });
  }
  // "Assign later" is only for customers who do not have a player to choose yet.
  targets.set(UNASSIGNED_TARGET, {
    playerId: null,
    label: "Assign later",
    eligible: policy.allowAssignLater && eligiblePlayers.length === 0,
    licensedArrangementIds: index.byPlayer.get(UNASSIGNED_TARGET) ?? new Set(),
    compatibleArrangementIds: null,
  });

  return {
    targets,
    customerLicensedArrangementIds: index.all,
    additionalPriceCents: (retail: number) => additionalPlayerPriceCents(retail, policy.additionalPlayer),
    eligiblePlayers,
    policy,
  };
}

// ─── Creating licenses ──────────────────────────────────────────────────────

type CreateLicenseInput = {
  customerId: string;
  arrangementId: string;
  playerId: string | null;
  source: MusicLicenseSource;
  entitlementId?: string | null;
  entitlementSourceId?: string | null;
  orderId?: string | null;
  orderItemId?: string | null;
  orderAllocationId?: string | null;
  originalMusicLicenseId?: string | null;
  pricePaidCents?: number | null;
  currency?: string | null;
  staffId?: string | null;
  reason?: string | null;
  transferId?: string | null;
  needsReview?: boolean;
  statusReason?: string | null;
};

/**
 * Creates one license (ACTIVE when a player is given, otherwise UNASSIGNED) and its first
 * event. Callers make sure the player has no live license for the arrangement yet; the
 * partial unique index is the last line of defence.
 */
export async function createMusicLicense(tx: ShopTx, input: CreateLicenseInput) {
  const now = new Date();
  const status: MusicLicenseStatus = input.playerId ? "ACTIVE" : "UNASSIGNED";
  const license = await tx.musicLicense.create({
    data: {
      customerId: input.customerId,
      arrangementId: input.arrangementId,
      licensedPlayerId: input.playerId,
      status,
      licenseSource: input.source,
      entitlementId: input.entitlementId ?? null,
      entitlementSourceId: input.entitlementSourceId ?? null,
      orderId: input.orderId ?? null,
      orderItemId: input.orderItemId ?? null,
      orderAllocationId: input.orderAllocationId ?? null,
      originalMusicLicenseId: input.originalMusicLicenseId ?? null,
      pricePaidCents: input.pricePaidCents ?? null,
      currency: input.currency ?? null,
      grantedByStaffId: input.staffId ?? null,
      reason: input.reason ?? null,
      needsReview: input.needsReview ?? false,
      statusReason: input.statusReason ?? null,
      assignedAt: input.playerId ? now : null,
      activatedAt: input.playerId ? now : null,
    },
  });
  await tx.musicLicenseEvent.create({
    data: {
      musicLicenseId: license.id,
      type: input.originalMusicLicenseId ? "TRANSFERRED_IN" : "CREATED",
      toPlayerId: input.playerId,
      transferId: input.transferId ?? null,
      staffId: input.staffId ?? null,
      reason: input.reason ?? input.source,
    },
  });
  return license;
}

/** Live license for this player + arrangement, if any. */
export function liveLicense(tx: ShopTx, playerId: string, arrangementId: string) {
  return tx.musicLicense.findFirst({ where: { licensedPlayerId: playerId, arrangementId, status: { in: LIVE_LICENSE_STATUSES } } });
}

/**
 * Fulfillment: one license per paid allocation (idempotent on `orderAllocationId`). A target
 * that stopped being valid between checkout and payment, or a player that meanwhile got
 * the same arrangement another way, never blocks fulfillment: the license is kept
 * UNASSIGNED and flagged for staff, so the customer is never charged for nothing silently.
 */
export async function createLicenseForAllocation(tx: ShopTx, input: {
  customerId: string;
  currency: string;
  orderId: string;
  allocation: { id: string; arrangementId: string; allocatedCents: number; additionalPlayer: boolean; orderItemId: string };
  orderItem: { itemType: string; targetPlayerId: string | null };
  entitlementId: string;
  entitlementSourceId: string;
}) {
  const existing = await tx.musicLicense.findUnique({ where: { orderAllocationId: input.allocation.id } });
  if (existing) return existing;

  const source: MusicLicenseSource = input.allocation.additionalPlayer
    ? "ADDITIONAL_PLAYER_PURCHASE"
    : input.orderItem.itemType === "BUNDLE" ? "BUNDLE" : "PURCHASE";
  let playerId = input.orderItem.targetPlayerId;
  let needsReview = false;
  let statusReason: string | null = null;
  if (playerId) {
    const player = await tx.registeredPlayer.findFirst({
      where: { id: playerId, customerId: input.customerId, status: "ACTIVE", playerType: { supportsMusicLibrary: true } },
      select: { id: true },
    });
    if (!player) {
      playerId = null; needsReview = true; statusReason = "Target player was no longer active at payment time";
    } else if (await liveLicense(tx, playerId, input.allocation.arrangementId)) {
      playerId = null; needsReview = true; statusReason = "Player already had this arrangement at payment time";
    }
  }
  return createMusicLicense(tx, {
    customerId: input.customerId,
    arrangementId: input.allocation.arrangementId,
    playerId,
    source,
    entitlementId: input.entitlementId,
    entitlementSourceId: input.entitlementSourceId,
    orderId: input.orderId,
    orderItemId: input.allocation.orderItemId,
    orderAllocationId: input.allocation.id,
    pricePaidCents: input.allocation.allocatedCents,
    currency: input.currency,
    needsReview,
    statusReason,
  });
}

// ─── Staff grants ───────────────────────────────────────────────────────────

export const GRANT_SOURCES = ["ADMIN_GRANT", "PROMOTION", "CUSTOMER_SERVICE", "LEGACY_IMPORT"] as const;
export type GrantSource = (typeof GRANT_SOURCES)[number];

const entitlementSourceFor = (s: GrantSource) => (s === "CUSTOMER_SERVICE" ? "ADMIN_GRANT" : s);

/**
 * Staff grant music to a player (or, with no player, as an unassigned license). Never a fake
 * order: an EntitlementSource records why, a MusicLicense records where. Arrangements the
 * player already has, or that do not fit its type, are skipped and reported.
 */
export async function grantMusic(input: {
  staffId: string;
  customerId: string;
  playerId: string | null;
  arrangementIds?: string[];
  bundleId?: string | null;
  source: GrantSource;
  reason: string;
  reference?: string | null;
}) {
  if (!input.reason.trim()) throw new ShopError("VALIDATION_FAILED", "A reason is required");
  const db = shopDb();
  return db.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId }, select: { id: true } });
    if (!customer) throw notFound("Customer");
    let ids = [...new Set(input.arrangementIds ?? [])];
    if (input.bundleId) {
      const bundle = await tx.bundle.findUnique({ where: { id: input.bundleId }, select: { items: { orderBy: { position: "asc" }, select: { arrangementId: true } } } });
      if (!bundle) throw notFound("Collection");
      ids = [...new Set([...ids, ...bundle.items.map((i) => i.arrangementId)])];
    }
    if (!ids.length) throw new ShopError("VALIDATION_FAILED", "Choose at least one arrangement");
    const arrangements = await tx.arrangement.findMany({ where: { id: { in: ids } }, select: { id: true, displayTitle: true } });
    if (arrangements.length !== ids.length) throw notFound("Arrangement");

    let player: { id: string; playerTypeId: string; name: string } | null = null;
    if (input.playerId) {
      const row = await tx.registeredPlayer.findFirst({ where: { id: input.playerId, customerId: input.customerId }, select: MUSIC_PLAYER_SELECT });
      if (!row) throw new ShopError("NOT_FOUND", "That player does not belong to this customer");
      if (!row.playerType.supportsMusicLibrary) throw new ShopError("VALIDATION_FAILED", `${row.playerType.name} players cannot receive music`);
      if (row.status === "RETIRED") throw new ShopError("VALIDATION_FAILED", "Music cannot be granted to a retired player");
      player = { id: row.id, playerTypeId: row.playerTypeId, name: playerDisplayName(row) };
    }
    const compatible = player ? await compatibleArrangementIds(player.playerTypeId, ids, tx) : null;

    const granted: string[] = [];
    const skipped: { arrangementId: string; title: string; reason: "ALREADY_LICENSED" | "INCOMPATIBLE" }[] = [];
    for (const a of arrangements) {
      if (compatible && !compatible.has(a.id)) { skipped.push({ arrangementId: a.id, title: a.displayTitle, reason: "INCOMPATIBLE" }); continue; }
      if (player && await liveLicense(tx, player.id, a.id)) { skipped.push({ arrangementId: a.id, title: a.displayTitle, reason: "ALREADY_LICENSED" }); continue; }
      const { entitlement, source } = await grantEntitlementSource(tx, {
        customerId: input.customerId, arrangementId: a.id, sourceType: entitlementSourceFor(input.source),
        grantedByStaffId: input.staffId, grantReason: input.reason, sourceReference: input.reference ?? (player ? `player:${player.id}` : null),
      });
      const license = await createMusicLicense(tx, {
        customerId: input.customerId, arrangementId: a.id, playerId: player?.id ?? null, source: input.source,
        entitlementId: entitlement.id, entitlementSourceId: source.id, staffId: input.staffId, reason: input.reason,
      });
      granted.push(license.id);
    }
    if (granted.length) {
      const what = granted.length === 1 ? `"${arrangements.find((a) => !skipped.some((s) => s.arrangementId === a.id))?.displayTitle}"` : `${granted.length} arrangements`;
      await recordActivity({
        tx, customerId: input.customerId, type: "music.granted", staffId: input.staffId,
        summary: `${what} added to ${player ? player.name : "the account (not yet assigned to a player)"} (${input.source.replace(/_/g, " ").toLowerCase()}): ${input.reason}`,
        metadata: { playerId: player?.id ?? null, count: granted.length, source: input.source, bundleId: input.bundleId ?? null },
      });
      await audit({ type: "STAFF", staffId: input.staffId }, "music_license.granted", { type: "Customer", id: input.customerId }, {
        playerId: player?.id ?? null, count: granted.length, skipped: skipped.length, source: input.source, reason: input.reason, licenseIds: granted,
      }, tx);
    }
    return { granted: granted.length, licenseIds: granted, skipped };
  });
}

/** Staff revoke one license (mistaken grant, chargeback). History stays. */
export async function revokeMusicLicense(input: { staffId: string; licenseId: string; reason: string }) {
  if (!input.reason.trim()) throw new ShopError("VALIDATION_FAILED", "A reason is required");
  return shopDb().$transaction(async (tx) => {
    const license = await tx.musicLicense.findUnique({ where: { id: input.licenseId }, include: { arrangement: { select: { displayTitle: true } } } });
    if (!license) throw notFound("Music license");
    if (license.status === "REVOKED" || license.status === "RETIRED") throw new ShopError("INVALID_STATE", "This license is no longer active");
    await setLicenseEnded(tx, license.id, "REVOKED", { staffId: input.staffId, reason: input.reason, fromPlayerId: license.licensedPlayerId });
    await recordActivity({
      tx, customerId: license.customerId, type: "music.revoked", staffId: input.staffId,
      summary: `"${license.arrangement.displayTitle}" is no longer licensed: ${input.reason}`,
      metadata: { musicLicenseId: license.id, playerId: license.licensedPlayerId },
    });
    await audit({ type: "STAFF", staffId: input.staffId }, "music_license.revoked", { type: "MusicLicense", id: license.id }, { reason: input.reason }, tx);
  });
}

/** Ends a license (RETIRED or REVOKED) and writes the matching event. */
export async function setLicenseEnded(
  tx: ShopTx,
  licenseId: string,
  status: "RETIRED" | "REVOKED",
  ctx: { staffId?: string | null; reason: string; transferId?: string | null; fromPlayerId?: string | null; toPlayerId?: string | null; eventType?: "RETIRED" | "REVOKED" | "TRANSFERRED_OUT" },
) {
  const now = new Date();
  await tx.musicLicense.update({
    where: { id: licenseId },
    data: {
      status,
      statusReason: ctx.reason,
      ...(status === "REVOKED" ? { revokedAt: now } : { retiredAt: now }),
      ...(ctx.eventType === "TRANSFERRED_OUT" ? { transferredAt: now } : {}),
    },
  });
  await tx.musicLicenseEvent.create({
    data: {
      musicLicenseId: licenseId,
      type: ctx.eventType ?? status,
      fromPlayerId: ctx.fromPlayerId ?? null,
      toPlayerId: ctx.toPlayerId ?? null,
      transferId: ctx.transferId ?? null,
      staffId: ctx.staffId ?? null,
      reason: ctx.reason,
    },
  });
}

/** The license currently carrying a lineage forward (follows move/replacement continuations). */
export async function currentLicenseInLineage(tx: ShopTx, licenseId: string) {
  let current = await tx.musicLicense.findUnique({ where: { id: licenseId } });
  for (let i = 0; current && i < 50; i++) {
    const next = await tx.musicLicense.findFirst({ where: { originalMusicLicenseId: current.id }, orderBy: { createdAt: "desc" } });
    if (!next) break;
    current = next;
  }
  return current;
}

/** Refund of an allocation: the license it created (wherever it moved since) stops being live. */
export async function revokeLicenseForRefundedAllocation(tx: ShopTx, allocationId: string, refundId: string, staffId: string | null) {
  const origin = await tx.musicLicense.findUnique({ where: { orderAllocationId: allocationId } });
  if (!origin) return null;
  const current = await currentLicenseInLineage(tx, origin.id);
  if (!current || current.status === "REVOKED" || current.status === "RETIRED") return null;
  await setLicenseEnded(tx, current.id, "REVOKED", { staffId, reason: `refund:${refundId}`, fromPlayerId: current.licensedPlayerId });
  return current.id;
}

// ─── Assignment (assign later, legacy review) ───────────────────────────────

/**
 * First assignment of an UNASSIGNED license. Customers may do this once for their own
 * bought-for-later music; legacy rows flagged for review are staff-only. After this the
 * license is locked to the player: moving it is a staff transfer.
 */
export async function assignLicenses(input: {
  actor: { type: "CUSTOMER"; customerId: string } | { type: "STAFF"; staffId: string };
  licenseIds: string[];
  playerId: string;
  reason?: string;
}) {
  const db = shopDb();
  return db.$transaction(async (tx) => {
    const licenses = await tx.musicLicense.findMany({ where: { id: { in: input.licenseIds } }, include: { arrangement: { select: { id: true, displayTitle: true } } } });
    if (licenses.length !== new Set(input.licenseIds).size) throw notFound("Music license");
    const customerId = licenses[0]!.customerId;
    if (licenses.some((l) => l.customerId !== customerId)) throw new ShopError("VALIDATION_FAILED", "Licenses belong to different customers");
    if (input.actor.type === "CUSTOMER") {
      if (customerId !== input.actor.customerId) throw new ShopError("NOT_FOUND", "Music license not found");
      if (licenses.some((l) => l.needsReview)) throw new ShopError("FORBIDDEN", "DMI Support will assign this music for you");
    }
    if (licenses.some((l) => l.status !== "UNASSIGNED")) throw new ShopError("INVALID_STATE", "Only music that is not yet on a player can be assigned");
    const player = await requireCustomerMusicPlayer(customerId, input.playerId, tx);
    const row = await tx.registeredPlayer.findUniqueOrThrow({ where: { id: player.id }, select: { playerTypeId: true } });
    const compatible = await compatibleArrangementIds(row.playerTypeId, licenses.map((l) => l.arrangementId), tx);

    const assigned: string[] = [];
    const skipped: { licenseId: string; title: string; reason: "ALREADY_LICENSED" | "INCOMPATIBLE" }[] = [];
    const staffId = input.actor.type === "STAFF" ? input.actor.staffId : null;
    for (const l of licenses) {
      if (compatible && !compatible.has(l.arrangementId)) { skipped.push({ licenseId: l.id, title: l.arrangement.displayTitle, reason: "INCOMPATIBLE" }); continue; }
      if (await liveLicense(tx, player.id, l.arrangementId)) { skipped.push({ licenseId: l.id, title: l.arrangement.displayTitle, reason: "ALREADY_LICENSED" }); continue; }
      const now = new Date();
      await tx.musicLicense.update({
        where: { id: l.id },
        data: { status: "ACTIVE", licensedPlayerId: player.id, assignedAt: now, activatedAt: now, needsReview: false, statusReason: null },
      });
      await tx.musicLicenseEvent.create({
        data: { musicLicenseId: l.id, type: "ASSIGNED", toPlayerId: player.id, staffId, reason: input.reason ?? (staffId ? "Assigned by DMI" : "Assigned by customer") },
      });
      assigned.push(l.id);
    }
    if (assigned.length) {
      await recordActivity({
        tx, customerId, type: "music.assigned", staffId,
        summary: `${assigned.length === 1 ? `"${licenses.find((l) => l.id === assigned[0])!.arrangement.displayTitle}"` : `${assigned.length} arrangements`} added to ${player.name}`,
        metadata: { playerId: player.id, count: assigned.length },
      });
      await audit(
        input.actor.type === "STAFF" ? { type: "STAFF", staffId: input.actor.staffId } : { type: "CUSTOMER", customerId },
        "music_license.assigned", { type: "RegisteredPlayer", id: player.id }, { count: assigned.length, licenseIds: assigned, reason: input.reason ?? null }, tx,
      );
    }
    return { assigned: assigned.length, skipped };
  });
}

/**
 * When a player becomes ACTIVE:
 *  1. if it is now the customer's ONLY eligible player, unflagged unassigned music (bought
 *     for later, or legacy with no player) lands on it;
 *  2. the player type's starter collection is licensed to it (PLAYER_STARTER_PACK, no order).
 * Idempotent: running it twice adds nothing.
 */
export async function onPlayerActivated(playerId: string, staffId: string | null) {
  const db = shopDb();
  const player = await db.registeredPlayer.findUnique({
    where: { id: playerId },
    select: { ...MUSIC_PLAYER_SELECT, playerType: { select: { ...MUSIC_PLAYER_SELECT.playerType.select, starterBundleId: true, starterBundle: { select: { id: true, title: true, items: { orderBy: { position: "asc" }, select: { arrangementId: true } } } } } } },
  });
  if (!player || player.status !== "ACTIVE" || !player.playerType.supportsMusicLibrary) return { assigned: 0, starter: 0 };
  const eligible = await eligibleMusicPlayers(player.customerId);
  let assigned = 0;
  if (eligible.length === 1 && eligible[0]!.id === player.id) {
    const pending = await db.musicLicense.findMany({ where: { customerId: player.customerId, status: "UNASSIGNED", needsReview: false }, select: { id: true } });
    if (pending.length) {
      assigned = (await assignLicenses({
        actor: staffId ? { type: "STAFF", staffId } : { type: "CUSTOMER", customerId: player.customerId },
        licenseIds: pending.map((p) => p.id), playerId: player.id, reason: "Player activated: music waiting for a player",
      })).assigned;
    }
  }

  let starter = 0;
  const bundle = player.playerType.starterBundle;
  if (bundle?.items.length) {
    starter = await db.$transaction(async (tx) => {
      const ids = bundle.items.map((i) => i.arrangementId);
      const compatible = await compatibleArrangementIds(player.playerTypeId, ids, tx);
      let created = 0;
      for (const arrangementId of ids) {
        if (compatible && !compatible.has(arrangementId)) continue;
        if (await liveLicense(tx, player.id, arrangementId)) continue;
        // Once per player: a starter license that was later retired is not re-granted.
        const had = await tx.musicLicense.findFirst({ where: { licensedPlayerId: player.id, arrangementId, licenseSource: "PLAYER_STARTER_PACK" } });
        if (had) continue;
        const { entitlement, source } = await grantEntitlementSource(tx, {
          customerId: player.customerId, arrangementId, sourceType: "PROMOTION", sourceReference: `starter:${player.id}`, grantReason: `Starter music for ${player.playerType.name}`,
        });
        await createMusicLicense(tx, {
          customerId: player.customerId, arrangementId, playerId: player.id, source: "PLAYER_STARTER_PACK",
          entitlementId: entitlement.id, entitlementSourceId: source.id, reason: `Starter collection "${bundle.title}"`,
        });
        created++;
      }
      if (created) {
        await recordActivity({
          tx, customerId: player.customerId, type: "music.starter", staffId,
          summary: `Starter music added to ${playerDisplayName(player)} (${created} arrangement${created === 1 ? "" : "s"} from "${bundle.title}")`,
          metadata: { playerId: player.id, bundleId: bundle.id, count: created },
        });
      }
      return created;
    });
  }
  return { assigned, starter };
}

// ─── Reads ──────────────────────────────────────────────────────────────────

/** Live license counts per player for a customer (one grouped query). */
export async function licenseCountsByPlayer(customerId: string, tx?: ShopTx): Promise<Map<string, number>> {
  const rows = await (tx ?? shopDb()).musicLicense.groupBy({
    by: ["licensedPlayerId"],
    where: { customerId, status: { in: LIVE_LICENSE_STATUSES }, licensedPlayerId: { not: null } },
    _count: { _all: true },
  });
  return new Map(rows.map((r) => [r.licensedPlayerId!, r._count._all]));
}

const LIBRARY_ARRANGEMENT_SELECT = {
  id: true, slug: true, sku: true, displayTitle: true, subtitle: true, durationSeconds: true,
  work: { select: { title: true, originalArtist: true } },
  arranger: { select: { name: true } },
} satisfies Prisma.ArrangementSelect;

/**
 * One player's library: its ACTIVE licenses only. Server-side search and paging, because a
 * player may hold thousands of arrangements. Never touches delivery artifacts.
 */
export async function playerLibrary(playerId: string, opts: { q?: string; page?: number; pageSize?: number; customerId?: string } = {}) {
  const db = shopDb();
  const pageSize = Math.min(Math.max(opts.pageSize ?? 50, 1), 200);
  const page = Math.max(opts.page ?? 1, 1);
  const q = opts.q?.trim();
  const where: Prisma.MusicLicenseWhereInput = {
    licensedPlayerId: playerId,
    status: { in: LIVE_LICENSE_STATUSES },
    ...(opts.customerId ? { customerId: opts.customerId } : {}),
    ...(q ? {
      arrangement: {
        OR: [
          { displayTitle: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { work: { title: { contains: q, mode: "insensitive" } } },
          { work: { originalArtist: { contains: q, mode: "insensitive" } } },
        ],
      },
    } : {}),
  };
  const [total, rows] = await Promise.all([
    db.musicLicense.count({ where }),
    db.musicLicense.findMany({
      where,
      orderBy: [{ arrangement: { displayTitle: "asc" } }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, status: true, licenseSource: true, activatedAt: true, createdAt: true, orderId: true,
        arrangement: { select: LIBRARY_ARRANGEMENT_SELECT },
      },
    }),
  ]);
  return { total, page, pageSize, pages: Math.max(Math.ceil(total / pageSize), 1), items: rows };
}

/**
 * Account-wide "My Music": one row per arrangement with the players it is licensed on, plus
 * music bought for later that still needs a player.
 */
export async function customerMusic(customerId: string, opts: { playerId?: string | null; q?: string } = {}) {
  const db = shopDb();
  const q = opts.q?.trim();
  const rows = await db.musicLicense.findMany({
    where: {
      customerId,
      status: { in: [...LIVE_LICENSE_STATUSES, "UNASSIGNED"] },
      ...(opts.playerId ? { licensedPlayerId: opts.playerId } : {}),
      ...(q ? { arrangement: { OR: [{ displayTitle: { contains: q, mode: "insensitive" } }, { work: { originalArtist: { contains: q, mode: "insensitive" } } }] } } : {}),
    },
    orderBy: [{ arrangement: { displayTitle: "asc" } }],
    select: {
      id: true, status: true, needsReview: true, licensedPlayerId: true, licenseSource: true, createdAt: true,
      arrangement: { select: LIBRARY_ARRANGEMENT_SELECT },
    },
  });
  const byArrangement = new Map<string, { arrangement: (typeof rows)[number]["arrangement"]; playerIds: string[]; unassigned: { id: string; needsReview: boolean }[] }>();
  for (const r of rows) {
    const entry = byArrangement.get(r.arrangement.id) ?? { arrangement: r.arrangement, playerIds: [], unassigned: [] };
    if (r.status === "UNASSIGNED") entry.unassigned.push({ id: r.id, needsReview: r.needsReview });
    else if (r.licensedPlayerId) entry.playerIds.push(r.licensedPlayerId);
    byArrangement.set(r.arrangement.id, entry);
  }
  return [...byArrangement.values()];
}

/** Per-license history for staff (and the arrangement row in a player library). */
export async function licenseHistory(licenseId: string) {
  const db = shopDb();
  const license = await db.musicLicense.findUnique({ where: { id: licenseId }, select: { id: true, originalMusicLicenseId: true } });
  if (!license) throw notFound("Music license");
  // Walk back to the first license of the lineage, then forward through every continuation.
  let rootId = license.id;
  for (let i = 0, cur = license; cur.originalMusicLicenseId && i < 50; i++) {
    rootId = cur.originalMusicLicenseId;
    cur = (await db.musicLicense.findUnique({ where: { id: rootId }, select: { id: true, originalMusicLicenseId: true } }))!;
  }
  const chain: string[] = [rootId];
  for (let i = 0; i < 50; i++) {
    const next = await db.musicLicense.findFirst({ where: { originalMusicLicenseId: chain[chain.length - 1]! }, select: { id: true }, orderBy: { createdAt: "asc" } });
    if (!next) break;
    chain.push(next.id);
  }
  return db.musicLicenseEvent.findMany({
    where: { musicLicenseId: { in: chain } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, type: true, reason: true, createdAt: true, fromPlayerId: true, toPlayerId: true, musicLicenseId: true,
      staff: { select: { displayName: true, email: true } },
      transfer: { select: { id: true, number: true, type: true } },
    },
  });
}
