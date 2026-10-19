import "server-only";
import { shopDb } from "../db";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { onPlayerActivated } from "./music-licenses";

/**
 * A DMI player is software: a copy of a player product (DMI Player, Virtual Orchestrion…)
 * activated on a computer. Music is licensed to that player.
 *
 * Software activation (SoftwareInstallation) and music licensing (RegisteredPlayer as the
 * license target) are kept in step here, so customers and staff only ever deal with one
 * thing called "player":
 *
 *  - an installation of a product that a music-capable PlayerType points at becomes a
 *    player automatically when it is activated (same registration code, linked both ways);
 *  - suspending / retiring / reactivating the installation does the same to the player;
 *  - an approved computer replacement moves the old player's music to the new one.
 *
 * Products without such a PlayerType (MIDI Mapper) are tools, never players.
 */

/** The music-capable player type for a software product, if the product is a player. */
export async function playerTypeForProduct(softwareProductId: string) {
  return shopDb().playerType.findFirst({
    where: { softwareProductId, supportsMusicLibrary: true, active: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
}

/**
 * Makes sure an ACTIVE installation of a player product has its player. Idempotent. Returns
 * the player id, or null for tools / conflicts (a registration owned by another customer is
 * left for staff, never moved silently).
 */
export async function ensurePlayerForInstallation(installationId: string, staffId: string | null): Promise<string | null> {
  const db = shopDb();
  const inst = await db.softwareInstallation.findUnique({
    where: { id: installationId },
    select: {
      id: true, customerId: true, softwareProductId: true, registrationCode: true, registrationIdentifier: true,
      label: true, status: true, registeredPlayerId: true, product: { select: { name: true } },
    },
  });
  if (!inst || inst.status !== "ACTIVE") return null;
  const type = await playerTypeForProduct(inst.softwareProductId);
  if (!type) return null;

  let playerId = inst.registeredPlayerId;
  let created = false;
  if (!playerId) {
    const existing = await db.registeredPlayer.findFirst({
      where: { OR: [{ registrationCode: inst.registrationCode }, { registrationIdentifier: inst.registrationIdentifier }] },
      select: { id: true, customerId: true },
    });
    if (existing && existing.customerId !== inst.customerId) {
      await audit({ type: "SYSTEM" }, "player.sync_conflict", { type: "SoftwareInstallation", id: inst.id }, { playerId: existing.id });
      return null;
    }
    if (existing) {
      playerId = existing.id;
    } else {
      const now = new Date();
      const player = await db.registeredPlayer.create({
        data: {
          customerId: inst.customerId, playerTypeId: type.id,
          registrationCode: inst.registrationCode, registrationIdentifier: inst.registrationIdentifier,
          friendlyName: inst.label?.trim() || null,
          status: "ACTIVE", registeredAt: now, activatedAt: now,
          createdByStaffId: staffId, updatedByStaffId: staffId,
        },
      });
      playerId = player.id;
      created = true;
    }
    await db.softwareInstallation.update({ where: { id: inst.id }, data: { registeredPlayerId: playerId } });
  }

  const player = await db.registeredPlayer.findUniqueOrThrow({ where: { id: playerId }, select: { status: true } });
  if (player.status !== "ACTIVE") {
    await db.registeredPlayer.update({ where: { id: playerId }, data: { status: "ACTIVE", activatedAt: new Date(), suspendedAt: null, updatedByStaffId: staffId } });
  }
  if (created) {
    await recordActivity({
      customerId: inst.customerId, staffId, type: "player.created",
      summary: `${inst.product.name} activated: new player ready for music`,
      metadata: { playerId, softwareInstallationId: inst.id },
    });
    await audit(staffId ? { type: "STAFF", staffId } : { type: "SYSTEM" }, "player.created_from_installation", { type: "RegisteredPlayer", id: playerId }, { softwareInstallationId: inst.id });
  }
  await onPlayerActivated(playerId, staffId);
  return playerId;
}

/** Mirrors an installation status change onto its player. */
export async function syncPlayerStatusFromInstallation(installationId: string, staffId: string | null) {
  const db = shopDb();
  const inst = await db.softwareInstallation.findUnique({ where: { id: installationId }, select: { status: true, registeredPlayerId: true } });
  if (!inst?.registeredPlayerId) return;
  const now = new Date();
  // DEACTIVATED (license revoked / refunded) only suspends: reinstating brings the music back.
  const status = inst.status === "ACTIVE" ? "ACTIVE" : inst.status === "RETIRED" ? "RETIRED" : "SUSPENDED";
  await db.registeredPlayer.updateMany({
    where: { id: inst.registeredPlayerId, status: { not: status } },
    data: {
      status,
      updatedByStaffId: staffId,
      ...(status === "ACTIVE" ? { suspendedAt: null } : status === "SUSPENDED" ? { suspendedAt: now } : { retiredAt: now }),
    },
  });
  if (status === "ACTIVE") await onPlayerActivated(inst.registeredPlayerId, staffId);
}

/**
 * An approved activation that replaced an earlier installation (new computer): the old
 * player's music moves to the new player, through the normal audited replacement workflow.
 */
export async function moveLibraryForReplacement(oldInstallationId: string, newInstallationId: string, staffId: string, reference: string) {
  const db = shopDb();
  const [oldInst, newInst] = await Promise.all([
    db.softwareInstallation.findUnique({ where: { id: oldInstallationId }, select: { registeredPlayerId: true } }),
    db.softwareInstallation.findUnique({ where: { id: newInstallationId }, select: { registeredPlayerId: true } }),
  ]);
  const from = oldInst?.registeredPlayerId;
  const to = newInst?.registeredPlayerId;
  if (!from || !to || from === to) return null;
  const fromPlayer = await db.registeredPlayer.findUnique({ where: { id: from }, select: { status: true, friendlyName: true } });
  if (!fromPlayer) return null;
  // Keep the customer's name for the machine on the replacement.
  if (fromPlayer.friendlyName) {
    await db.registeredPlayer.updateMany({ where: { id: to, friendlyName: null }, data: { friendlyName: fromPlayer.friendlyName } });
  }
  if (fromPlayer.status === "RETIRED") {
    // Already retired by the installation sync: move the library without re-retiring.
    const { transferLibrary } = await import("./music-transfers");
    return transferLibrary({ staffId, fromPlayerId: from, toPlayerId: to, mode: "MOVE", type: "COMPUTER_REPLACEMENT", reason: `Computer replaced (${reference})` });
  }
  const { replacePlayer } = await import("./music-transfers");
  return replacePlayer({ staffId, oldPlayerId: from, newPlayerId: to, type: "COMPUTER_REPLACEMENT", reason: `Computer replaced (${reference})` });
}

/** One-off / repair: create players for every ACTIVE installation of a player product. */
export async function backfillPlayersFromInstallations(staffId: string | null) {
  const db = shopDb();
  const types = await db.playerType.findMany({ where: { supportsMusicLibrary: true, active: true, softwareProductId: { not: null } }, select: { softwareProductId: true } });
  const productIds = types.map((t) => t.softwareProductId!);
  if (!productIds.length) return 0;
  const installs = await db.softwareInstallation.findMany({ where: { softwareProductId: { in: productIds }, status: "ACTIVE", registeredPlayerId: null }, select: { id: true } });
  let n = 0;
  for (const i of installs) if (await ensurePlayerForInstallation(i.id, staffId)) n++;
  return n;
}
