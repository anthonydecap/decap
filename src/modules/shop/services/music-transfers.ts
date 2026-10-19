import "server-only";
import type { MusicTransferType } from "@/generated/shop-prisma/client";
import { shopDb, type ShopTx } from "../db";
import { ShopError, notFound } from "../errors";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { grantEntitlementSource } from "./entitlements";
import {
  compatibleArrangementIds,
  createMusicLicense,
  LIVE_LICENSE_STATUSES,
  liveLicense,
  playerDisplayName,
  setLicenseEnded,
} from "./music-licenses";
import { getMusicPolicy } from "./music-policy";

/**
 * Staff-controlled movement of music between players. Customers never call anything here.
 *
 *  - transferLibrary MOVE   legitimate replacement / migration: licenses leave the old player
 *  - transferLibrary COPY   extra licenses on another player while the old one keeps its
 *                           music; needs `music:grant` and an explicit reason (never silent)
 *  - replacePlayer          MOVE + old player RETIRED + new player ACTIVE, one transaction
 *  - transferPlayerOwnership a player changes customer; its library follows or not per the
 *                           central resale policy
 *
 * Every operation writes one MusicLicenseTransfer (TRF-…), one event per affected license,
 * an audit entry and timeline entries. Old license rows are RETIRED, never deleted; the new
 * row points back with `originalMusicLicenseId`. Order history is never touched.
 */

export const TRANSFER_TYPE_LABELS: Record<MusicTransferType, string> = {
  HARDWARE_REPLACEMENT: "Hardware replacement",
  WARRANTY_REPLACEMENT: "Warranty replacement",
  COMPUTER_REPLACEMENT: "Computer replacement",
  UPGRADE: "Upgrade",
  CUSTOMER_PLAYER_TRANSFER: "Player moved between customers",
  PLAYER_RESALE: "Player resale",
  ADMIN_CORRECTION: "Admin correction",
  OTHER: "Other",
};

export const formatTransferNumber = (n: number) => `TRF-${n}`;

type PlayerRow = { id: string; customerId: string; status: string; playerTypeId: string; registrationCode: string; friendlyName: string | null; playerType: { name: string; supportsMusicLibrary: boolean } };

async function loadPlayer(tx: ShopTx, id: string): Promise<PlayerRow> {
  const p = await tx.registeredPlayer.findUnique({
    where: { id },
    select: { id: true, customerId: true, status: true, playerTypeId: true, registrationCode: true, friendlyName: true, playerType: { select: { name: true, supportsMusicLibrary: true } } },
  });
  if (!p) throw notFound("Player");
  return p;
}

/**
 * Moves (or copies) the live licenses of one player to another player of the SAME customer.
 * Licenses the target already has are not duplicated (the source license is still retired
 * on MOVE, so nothing stays live twice); incompatible ones are skipped and reported.
 */
async function moveOrCopyLicenses(tx: ShopTx, input: {
  transferId: string;
  from: PlayerRow;
  to: PlayerRow;
  mode: "MOVE" | "COPY";
  staffId: string;
  reason: string;
  replacement: boolean;
  arrangementIds?: string[];
}) {
  const licenses = await tx.musicLicense.findMany({
    where: {
      licensedPlayerId: input.from.id,
      status: { in: LIVE_LICENSE_STATUSES },
      ...(input.arrangementIds?.length ? { arrangementId: { in: input.arrangementIds } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  const compatible = await compatibleArrangementIds(input.to.playerTypeId, licenses.map((l) => l.arrangementId), tx);
  let moved = 0;
  const skipped: { arrangementId: string; reason: "ALREADY_LICENSED" | "INCOMPATIBLE" }[] = [];
  for (const l of licenses) {
    if (compatible && !compatible.has(l.arrangementId)) {
      // MOVE never strands music: an incompatible license stays on the old player for staff to resolve.
      skipped.push({ arrangementId: l.arrangementId, reason: "INCOMPATIBLE" });
      continue;
    }
    const already = await liveLicense(tx, input.to.id, l.arrangementId);
    if (input.mode === "MOVE") {
      await setLicenseEnded(tx, l.id, "RETIRED", {
        staffId: input.staffId, reason: input.reason, transferId: input.transferId,
        fromPlayerId: input.from.id, toPlayerId: input.to.id, eventType: "TRANSFERRED_OUT",
      });
    }
    if (already) { skipped.push({ arrangementId: l.arrangementId, reason: "ALREADY_LICENSED" }); continue; }
    if (input.mode === "MOVE") {
      await createMusicLicense(tx, {
        customerId: input.to.customerId, arrangementId: l.arrangementId, playerId: input.to.id,
        source: input.replacement ? "REPLACEMENT_TRANSFER" : "TRANSFER",
        entitlementId: l.entitlementId, entitlementSourceId: l.entitlementSourceId,
        orderId: l.orderId, orderItemId: l.orderItemId, originalMusicLicenseId: l.id,
        pricePaidCents: l.pricePaidCents, currency: l.currency,
        staffId: input.staffId, reason: input.reason, transferId: input.transferId,
      });
    } else {
      // COPY is a new, unpaid license: an explicit privileged grant with its own source row.
      const { entitlement, source } = await grantEntitlementSource(tx, {
        customerId: input.to.customerId, arrangementId: l.arrangementId, sourceType: "ADMIN_GRANT",
        grantedByStaffId: input.staffId, grantReason: input.reason, sourceReference: `transfer:${input.transferId}`,
      });
      await createMusicLicense(tx, {
        customerId: input.to.customerId, arrangementId: l.arrangementId, playerId: input.to.id, source: "CUSTOMER_SERVICE",
        entitlementId: entitlement.id, entitlementSourceId: source.id,
        staffId: input.staffId, reason: input.reason, transferId: input.transferId,
      });
    }
    moved++;
  }
  return { moved, skipped, total: licenses.length };
}

export async function transferLibrary(input: {
  staffId: string;
  fromPlayerId: string;
  toPlayerId: string;
  mode: "MOVE" | "COPY";
  type: MusicTransferType;
  reason: string;
  notes?: string | null;
  arrangementIds?: string[];
}) {
  if (!input.reason.trim()) throw new ShopError("VALIDATION_FAILED", "A reason is required");
  if (input.fromPlayerId === input.toPlayerId) throw new ShopError("VALIDATION_FAILED", "Choose two different players");
  return shopDb().$transaction(async (tx) => {
    const from = await loadPlayer(tx, input.fromPlayerId);
    const to = await loadPlayer(tx, input.toPlayerId);
    if (from.customerId !== to.customerId) {
      throw new ShopError("VALIDATION_FAILED", "Both players must belong to the same customer. Move the player to the customer first.");
    }
    if (!to.playerType.supportsMusicLibrary) throw new ShopError("VALIDATION_FAILED", `${to.playerType.name} players cannot receive music`);
    if (to.status === "RETIRED") throw new ShopError("VALIDATION_FAILED", "Music cannot be moved to a retired player");

    const transfer = await tx.musicLicenseTransfer.create({
      data: {
        type: input.type, mode: input.mode, status: "COMPLETED", fromPlayerId: from.id, toPlayerId: to.id,
        customerId: from.customerId, reason: input.reason.trim(), notes: input.notes?.trim() || null,
        createdByStaffId: input.staffId, approvedByStaffId: input.staffId, completedAt: new Date(),
      },
    });
    const result = await moveOrCopyLicenses(tx, { transferId: transfer.id, from, to, mode: input.mode, staffId: input.staffId, reason: input.reason.trim(), replacement: false, arrangementIds: input.arrangementIds });
    await tx.musicLicenseTransfer.update({ where: { id: transfer.id }, data: { licenseCount: result.moved } });
    const fromName = playerDisplayName(from);
    const toName = playerDisplayName(to);
    await recordActivity({
      tx, customerId: from.customerId, staffId: input.staffId,
      type: input.mode === "MOVE" ? "music.library_transferred" : "music.library_copied",
      summary: input.mode === "MOVE"
        ? `Library transferred: ${fromName} → ${toName} (${result.moved} arrangement${result.moved === 1 ? "" : "s"}, ${formatTransferNumber(transfer.number)})`
        : `${result.moved} additional license${result.moved === 1 ? "" : "s"} created on ${toName} from ${fromName} (${formatTransferNumber(transfer.number)}): ${input.reason}`,
      metadata: { transferId: transfer.id, fromPlayerId: from.id, toPlayerId: to.id, count: result.moved, skipped: result.skipped.length },
    });
    await audit({ type: "STAFF", staffId: input.staffId }, input.mode === "MOVE" ? "music_library.transferred" : "music_library.copied", { type: "MusicLicenseTransfer", id: transfer.id }, {
      fromPlayerId: from.id, toPlayerId: to.id, count: result.moved, skipped: result.skipped.length, type: input.type, reason: input.reason,
    }, tx);
    return { transferId: transfer.id, number: formatTransferNumber(transfer.number), ...result };
  });
}

/**
 * Replace a failed / upgraded player: the whole library moves to the replacement, the old
 * player is RETIRED and the new one ACTIVE, atomically. The replacement must already be
 * registered for the same customer (registration and activation key stay the normal
 * player workflow).
 */
export async function replacePlayer(input: {
  staffId: string;
  oldPlayerId: string;
  newPlayerId: string;
  type: Extract<MusicTransferType, "HARDWARE_REPLACEMENT" | "WARRANTY_REPLACEMENT" | "COMPUTER_REPLACEMENT" | "UPGRADE" | "OTHER">;
  reason: string;
  notes?: string | null;
}) {
  if (!input.reason.trim()) throw new ShopError("VALIDATION_FAILED", "A reason is required");
  if (input.oldPlayerId === input.newPlayerId) throw new ShopError("VALIDATION_FAILED", "Choose the replacement player");
  const policy = await getMusicPolicy();
  return shopDb().$transaction(async (tx) => {
    const from = await loadPlayer(tx, input.oldPlayerId);
    const to = await loadPlayer(tx, input.newPlayerId);
    if (from.customerId !== to.customerId) throw new ShopError("VALIDATION_FAILED", "The replacement must be registered to the same customer");
    if (from.status === "RETIRED") throw new ShopError("INVALID_STATE", "This player is already retired");
    if (to.status === "RETIRED") throw new ShopError("INVALID_STATE", "The replacement player is retired");
    if (!to.playerType.supportsMusicLibrary) throw new ShopError("VALIDATION_FAILED", `${to.playerType.name} players cannot receive music`);

    const transfer = await tx.musicLicenseTransfer.create({
      data: {
        type: input.type, mode: "MOVE", status: "COMPLETED", fromPlayerId: from.id, toPlayerId: to.id,
        customerId: from.customerId, reason: input.reason.trim(),
        notes: [input.notes?.trim(), `Replacement policy: ${policy.replacementPolicy}`].filter(Boolean).join("\n"),
        createdByStaffId: input.staffId, approvedByStaffId: input.staffId, completedAt: new Date(),
      },
    });
    const result = await moveOrCopyLicenses(tx, { transferId: transfer.id, from, to, mode: "MOVE", staffId: input.staffId, reason: input.reason.trim(), replacement: true });
    await tx.musicLicenseTransfer.update({ where: { id: transfer.id }, data: { licenseCount: result.moved } });
    const now = new Date();
    await tx.registeredPlayer.update({ where: { id: from.id }, data: { status: "RETIRED", retiredAt: now, updatedByStaffId: input.staffId } });
    if (to.status !== "ACTIVE") {
      await tx.registeredPlayer.update({ where: { id: to.id }, data: { status: "ACTIVE", activatedAt: now, updatedByStaffId: input.staffId } });
    }
    await recordActivity({
      tx, customerId: from.customerId, staffId: input.staffId, type: "player.replaced",
      summary: `Player replaced: ${playerDisplayName(from)} → ${playerDisplayName(to)} (${result.moved} arrangement${result.moved === 1 ? "" : "s"} moved, ${formatTransferNumber(transfer.number)})`,
      metadata: { transferId: transfer.id, oldPlayerId: from.id, newPlayerId: to.id, count: result.moved, skipped: result.skipped.length, type: input.type },
    });
    await audit({ type: "STAFF", staffId: input.staffId }, "player.replaced", { type: "MusicLicenseTransfer", id: transfer.id }, {
      oldPlayerId: from.id, newPlayerId: to.id, count: result.moved, skipped: result.skipped.length, type: input.type, reason: input.reason,
    }, tx);
    return { transferId: transfer.id, number: formatTransferNumber(transfer.number), ...result };
  });
}

/**
 * A player changes customer (resale, family move). The library outcome comes from the
 * central resale policy; only ADMIN_DECIDES lets staff pick per case. PLAYER_AND_LIBRARY
 * re-issues the player's live licenses to the new owner (the seller's copies are retired,
 * so their old Entitlements cannot regenerate that library for another player).
 * PLAYER_ONLY retires the player's licenses: the buyer starts with an empty library.
 */
export async function transferPlayerOwnership(input: {
  staffId: string;
  playerId: string;
  toCustomerId: string;
  reason: string;
  libraryPolicy?: "PLAYER_AND_LIBRARY" | "PLAYER_ONLY";
  type?: Extract<MusicTransferType, "PLAYER_RESALE" | "CUSTOMER_PLAYER_TRANSFER" | "ADMIN_CORRECTION">;
}) {
  if (!input.reason.trim()) throw new ShopError("VALIDATION_FAILED", "A reason is required");
  const policy = await getMusicPolicy();
  const libraryPolicy = policy.resalePolicy === "ADMIN_DECIDES" ? input.libraryPolicy : policy.resalePolicy;
  if (!libraryPolicy) throw new ShopError("VALIDATION_FAILED", "Choose what happens to the music on this player");
  if (input.libraryPolicy && input.libraryPolicy !== libraryPolicy) {
    throw new ShopError("VALIDATION_FAILED", `The resale policy is ${policy.resalePolicy.replace(/_/g, " ").toLowerCase()}; that cannot be overridden here`);
  }
  return shopDb().$transaction(async (tx) => {
    const player = await loadPlayer(tx, input.playerId);
    if (player.customerId === input.toCustomerId) throw new ShopError("VALIDATION_FAILED", "The player already belongs to that customer");
    const target = await tx.customer.findUnique({ where: { id: input.toCustomerId }, select: { id: true } });
    if (!target) throw notFound("Customer");
    const fromCustomerId = player.customerId;

    const transfer = await tx.musicLicenseTransfer.create({
      data: {
        type: input.type ?? "PLAYER_RESALE", mode: "PLAYER_OWNERSHIP", status: "COMPLETED", fromPlayerId: player.id, toPlayerId: player.id,
        customerId: fromCustomerId, newCustomerId: input.toCustomerId, libraryPolicy, reason: input.reason.trim(),
        createdByStaffId: input.staffId, approvedByStaffId: input.staffId, completedAt: new Date(),
      },
    });
    await tx.registeredPlayer.update({ where: { id: player.id }, data: { customerId: input.toCustomerId, friendlyName: null, updatedByStaffId: input.staffId } });
    // Software installed on the machine follows the machine's ownership record only by staff action; nothing automatic here.

    const licenses = await tx.musicLicense.findMany({ where: { licensedPlayerId: player.id, status: { in: LIVE_LICENSE_STATUSES } } });
    let count = 0;
    for (const l of licenses) {
      await setLicenseEnded(tx, l.id, "RETIRED", {
        staffId: input.staffId, transferId: transfer.id, fromPlayerId: player.id, toPlayerId: player.id,
        reason: libraryPolicy === "PLAYER_AND_LIBRARY" ? `Player transferred with its library: ${input.reason}` : `Player transferred without its library: ${input.reason}`,
        eventType: libraryPolicy === "PLAYER_AND_LIBRARY" ? "TRANSFERRED_OUT" : "RETIRED",
      });
      if (libraryPolicy === "PLAYER_AND_LIBRARY") {
        const { entitlement, source } = await grantEntitlementSource(tx, {
          customerId: input.toCustomerId, arrangementId: l.arrangementId, sourceType: "ADMIN_GRANT",
          grantedByStaffId: input.staffId, grantReason: `Received with player (${formatTransferNumber(transfer.number)})`, sourceReference: `transfer:${transfer.id}`,
        });
        await createMusicLicense(tx, {
          customerId: input.toCustomerId, arrangementId: l.arrangementId, playerId: player.id, source: "TRANSFER",
          entitlementId: entitlement.id, entitlementSourceId: source.id, originalMusicLicenseId: l.id,
          staffId: input.staffId, reason: input.reason, transferId: transfer.id,
        });
      }
      count++;
    }
    await tx.musicLicenseTransfer.update({ where: { id: transfer.id }, data: { licenseCount: count } });
    const label = `${player.playerType.name} ${player.registrationCode.slice(-4)}`;
    await recordActivity({
      tx, customerId: fromCustomerId, staffId: input.staffId, type: "player.transferred_out",
      summary: `Player ${label} transferred to another customer (${libraryPolicy === "PLAYER_AND_LIBRARY" ? `${count} arrangement${count === 1 ? "" : "s"} went with it` : "music stayed behind and is no longer active"}, ${formatTransferNumber(transfer.number)})`,
      metadata: { playerId: player.id, transferId: transfer.id, libraryPolicy, count, reason: input.reason },
    });
    await recordActivity({
      tx, customerId: input.toCustomerId, staffId: input.staffId, type: "player.transferred_in",
      summary: `Player ${label} transferred in from another customer${libraryPolicy === "PLAYER_AND_LIBRARY" ? ` with ${count} arrangement${count === 1 ? "" : "s"}` : " without music"} (${formatTransferNumber(transfer.number)})`,
      metadata: { playerId: player.id, transferId: transfer.id, libraryPolicy, count, reason: input.reason },
    });
    await audit({ type: "STAFF", staffId: input.staffId }, "player.transferred", { type: "RegisteredPlayer", id: player.id }, {
      from: fromCustomerId, to: input.toCustomerId, reason: input.reason, libraryPolicy, licenseCount: count, transferId: transfer.id,
    }, tx);
    return { transferId: transfer.id, number: formatTransferNumber(transfer.number), libraryPolicy, count };
  });
}

/** Transfer list for staff (all, one customer, or one player). */
export async function listTransfers(opts: { customerId?: string; playerId?: string; take?: number } = {}) {
  const rows = await shopDb().musicLicenseTransfer.findMany({
    where: {
      ...(opts.customerId ? { OR: [{ customerId: opts.customerId }, { newCustomerId: opts.customerId }] } : {}),
      ...(opts.playerId ? { OR: [{ fromPlayerId: opts.playerId }, { toPlayerId: opts.playerId }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts.take ?? 100,
    select: {
      id: true, number: true, type: true, mode: true, status: true, reason: true, notes: true, libraryPolicy: true, licenseCount: true, createdAt: true, completedAt: true,
      fromPlayer: { select: { id: true, friendlyName: true, registrationCode: true, playerType: { select: { name: true } } } },
      toPlayer: { select: { id: true, friendlyName: true, registrationCode: true, playerType: { select: { name: true } } } },
      customer: { select: { id: true, email: true, firstName: true, lastName: true } },
      newCustomer: { select: { id: true, email: true, firstName: true, lastName: true } },
      createdBy: { select: { displayName: true, email: true } },
    },
  });
  return rows.map((r) => ({ ...r, reference: formatTransferNumber(r.number) }));
}
