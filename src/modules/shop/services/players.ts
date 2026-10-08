import "server-only";
import type { PlayerStatus, Prisma, RegisteredPlayer } from "@/generated/shop-prisma/client";
import { shopDb } from "../db";
import { ShopError, notFound } from "../errors";
import { encryptActivationKey, decryptActivationKey } from "./activation-key";
import { audit } from "./audit";
import { recordActivity } from "./crm";

/**
 * Registered players.
 *
 * Activation stays offline and manual: the player prints a registration code, a member of
 * staff runs it through the proprietary EXE, and types the resulting activation key back
 * in here. Nothing in this file reproduces that algorithm or calls the EXE.
 *
 * Two fields look alike and are not:
 *  - `registrationCode` is what the customer reads off the player and gives to us;
 *  - `registrationIdentifier` is what the future Player API will authenticate on. It
 *    starts out equal to the code, but stays separate so online validation never comes to
 *    depend on the activation key.
 *
 * `activationKeyEncrypted` is never selected by a list query. It leaves the database only
 * through `revealActivationKey`, which audits every read.
 */

/** Everything except the secret. Any list or page may use this. */
export const PLAYER_PUBLIC_SELECT = {
  id: true,
  customerId: true,
  playerTypeId: true,
  registrationCode: true,
  registrationIdentifier: true,
  serialNumber: true,
  adminLabel: true,
  status: true,
  purchaseDate: true,
  warrantyUntil: true,
  dealerName: true,
  registeredAt: true,
  activatedAt: true,
  suspendedAt: true,
  retiredAt: true,
  createdAt: true,
  updatedAt: true,
  playerType: { select: { id: true, code: true, name: true } },
} satisfies Prisma.RegisteredPlayerSelect;

export type PlayerView = Prisma.RegisteredPlayerGetPayload<{ select: typeof PLAYER_PUBLIC_SELECT }> & {
  hasActivationKey: boolean;
};

function withKeyFlag<T extends { activationKeyEncrypted?: string | null }>(row: T) {
  const { activationKeyEncrypted, ...rest } = row;
  return { ...rest, hasActivationKey: !!activationKeyEncrypted };
}

export async function listCustomerPlayers(customerId: string): Promise<PlayerView[]> {
  const rows = await shopDb().registeredPlayer.findMany({
    where: { customerId },
    select: { ...PLAYER_PUBLIC_SELECT, activationKeyEncrypted: true },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(withKeyFlag);
}

export async function getPlayer(playerId: string): Promise<PlayerView> {
  const row = await shopDb().registeredPlayer.findUnique({
    where: { id: playerId },
    select: { ...PLAYER_PUBLIC_SELECT, activationKeyEncrypted: true },
  });
  if (!row) throw notFound("Player");
  return withKeyFlag(row);
}

/**
 * Codes are read aloud, written on paper and retyped, so the separators are presentation,
 * not part of the value. Storing only letters and digits means `A8F2-73KD-91PL`,
 * `a8f2 73kd 91pl` and `A8F273KD91PL` are one registration rather than three, which is
 * what makes the uniqueness rule hold in practice. Use `formatRegistrationCode` to show it.
 */
export function normaliseCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Groups of four, the way the code is printed on the player. */
export function formatRegistrationCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}

export type PlayerInput = {
  playerTypeId: string;
  registrationCode: string;
  registrationIdentifier?: string | null;
  serialNumber?: string | null;
  adminLabel?: string | null;
  dealerName?: string | null;
  purchaseDate?: Date | null;
  warrantyUntil?: Date | null;
  status?: PlayerStatus;
  activationKey?: string | null;
};

export async function createPlayer(input: PlayerInput & { actorStaffId: string; customerId: string }): Promise<RegisteredPlayer> {
  const db = shopDb();
  const code = normaliseCode(input.registrationCode);
  const identifier = normaliseCode(input.registrationIdentifier || input.registrationCode);

  const customer = await db.customer.findUnique({ where: { id: input.customerId }, select: { id: true } });
  if (!customer) throw notFound("Customer");
  const type = await db.playerType.findUnique({ where: { id: input.playerTypeId }, select: { id: true, active: true } });
  if (!type) throw notFound("Player type");
  if (!type.active) throw new ShopError("VALIDATION_FAILED", "That player type is deactivated. Choose an active one.");

  const clash = await db.registeredPlayer.findFirst({
    where: { OR: [{ registrationCode: code }, { registrationIdentifier: identifier }] },
    select: { id: true, customerId: true },
  });
  if (clash) {
    throw new ShopError("CONFLICT", "That registration is already on another player. Open the existing record instead of creating a second one.");
  }

  const status = input.status ?? (input.activationKey ? "ACTIVE" : "PENDING");
  const now = new Date();
  const player = await db.registeredPlayer.create({
    data: {
      customerId: input.customerId,
      playerTypeId: input.playerTypeId,
      registrationCode: code,
      registrationIdentifier: identifier,
      activationKeyEncrypted: input.activationKey ? encryptActivationKey(input.activationKey) : null,
      serialNumber: input.serialNumber?.trim() || null,
      adminLabel: input.adminLabel?.trim() || null,
      dealerName: input.dealerName?.trim() || null,
      purchaseDate: input.purchaseDate ?? null,
      warrantyUntil: input.warrantyUntil ?? null,
      status,
      registeredAt: now,
      activatedAt: status === "ACTIVE" ? now : null,
      createdByStaffId: input.actorStaffId,
      updatedByStaffId: input.actorStaffId,
    },
  });

  // The code itself is fine in the log; the activation key never is.
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "player.created", { type: "RegisteredPlayer", id: player.id }, {
    customerId: input.customerId,
    registrationCode: code,
    status,
    withActivationKey: !!input.activationKey,
  });
  await recordActivity({
    customerId: input.customerId,
    type: "player.created",
    summary: `Player ${code} registered`,
    staffId: input.actorStaffId,
    metadata: { playerId: player.id, status },
  });
  return player;
}

export async function updatePlayer(input: {
  actorStaffId: string;
  playerId: string;
  patch: Partial<Omit<PlayerInput, "registrationCode">> & { registrationCode?: string };
}): Promise<RegisteredPlayer> {
  const db = shopDb();
  const existing = await db.registeredPlayer.findUnique({ where: { id: input.playerId } });
  if (!existing) throw notFound("Player");

  const data: Prisma.RegisteredPlayerUpdateInput = { updatedByStaff: { connect: { id: input.actorStaffId } } };
  const changed: Record<string, unknown> = {};

  if (input.patch.registrationCode !== undefined) {
    const code = normaliseCode(input.patch.registrationCode);
    if (code !== existing.registrationCode) {
      const clash = await db.registeredPlayer.findFirst({ where: { registrationCode: code, id: { not: existing.id } } });
      if (clash) throw new ShopError("CONFLICT", "Another player already uses that registration code");
      data.registrationCode = code;
      changed.registrationCode = code;
    }
  }
  if (input.patch.registrationIdentifier !== undefined && input.patch.registrationIdentifier !== null) {
    const identifier = normaliseCode(input.patch.registrationIdentifier);
    if (identifier !== existing.registrationIdentifier) {
      const clash = await db.registeredPlayer.findFirst({ where: { registrationIdentifier: identifier, id: { not: existing.id } } });
      if (clash) throw new ShopError("CONFLICT", "Another player already uses that registration identifier");
      data.registrationIdentifier = identifier;
      changed.registrationIdentifier = identifier;
    }
  }
  if (input.patch.playerTypeId !== undefined) {
    data.playerType = { connect: { id: input.patch.playerTypeId } };
    changed.playerTypeId = input.patch.playerTypeId;
  }
  for (const field of ["serialNumber", "adminLabel", "dealerName"] as const) {
    const value = input.patch[field];
    if (value !== undefined) {
      data[field] = value?.trim() || null;
      changed[field] = value?.trim() || null;
    }
  }
  for (const field of ["purchaseDate", "warrantyUntil"] as const) {
    if (input.patch[field] !== undefined) {
      data[field] = input.patch[field] ?? null;
      changed[field] = input.patch[field]?.toISOString() ?? null;
    }
  }
  if (input.patch.activationKey !== undefined) {
    data.activationKeyEncrypted = input.patch.activationKey ? encryptActivationKey(input.patch.activationKey) : null;
    changed.activationKey = input.patch.activationKey ? "[set]" : "[cleared]";
  }
  if (input.patch.status !== undefined && input.patch.status !== existing.status) {
    data.status = input.patch.status;
    changed.status = input.patch.status;
    const now = new Date();
    if (input.patch.status === "ACTIVE") data.activatedAt = existing.activatedAt ?? now;
    if (input.patch.status === "SUSPENDED") data.suspendedAt = now;
    if (input.patch.status === "RETIRED") data.retiredAt = now;
  }

  const updated = await db.registeredPlayer.update({ where: { id: existing.id }, data });
  if (Object.keys(changed).length) {
    await audit({ type: "STAFF", staffId: input.actorStaffId }, "player.updated", { type: "RegisteredPlayer", id: existing.id }, changed);
    if (changed.status) {
      await recordActivity({
        customerId: existing.customerId,
        type: `player.${String(changed.status).toLowerCase()}`,
        summary: `Player ${updated.registrationCode} is now ${String(changed.status).toLowerCase()}`,
        staffId: input.actorStaffId,
        metadata: { playerId: existing.id },
      });
    }
  }
  return updated;
}

/**
 * The one path that returns a key in clear text. Requires `players:activation-key`, which
 * the caller checks, and writes an audit entry per reveal so a leak can be traced to a
 * person and a moment. The key itself never reaches the audit metadata.
 */
export async function revealActivationKey(input: { actorStaffId: string; playerId: string }): Promise<string> {
  const row = await shopDb().registeredPlayer.findUnique({
    where: { id: input.playerId },
    select: { id: true, customerId: true, registrationCode: true, activationKeyEncrypted: true },
  });
  if (!row) throw notFound("Player");
  if (!row.activationKeyEncrypted) throw new ShopError("NOT_FOUND", "No activation key is stored for this player yet");
  const plain = decryptActivationKey(row.activationKeyEncrypted);
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "player.activation_key_revealed", { type: "RegisteredPlayer", id: row.id }, {
    customerId: row.customerId,
    registrationCode: row.registrationCode,
  });
  return plain;
}

/**
 * Moving a player to another customer. Restricted to SUPER_ADMIN by its capability, needs
 * a reason, and is recorded on both customers' timelines — never a quiet edit of
 * `customerId`, because it moves who may use the machine.
 */
export async function transferPlayer(input: {
  actorStaffId: string;
  playerId: string;
  toCustomerId: string;
  reason: string;
}): Promise<RegisteredPlayer> {
  const db = shopDb();
  const player = await db.registeredPlayer.findUnique({ where: { id: input.playerId } });
  if (!player) throw notFound("Player");
  if (player.customerId === input.toCustomerId) throw new ShopError("VALIDATION_FAILED", "The player already belongs to that customer");
  const target = await db.customer.findUnique({ where: { id: input.toCustomerId }, select: { id: true } });
  if (!target) throw notFound("Customer");

  const moved = await db.registeredPlayer.update({
    where: { id: player.id },
    data: { customerId: input.toCustomerId, updatedByStaffId: input.actorStaffId },
  });
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "player.transferred", { type: "RegisteredPlayer", id: player.id }, {
    from: player.customerId,
    to: input.toCustomerId,
    reason: input.reason,
  });
  await recordActivity({
    customerId: player.customerId,
    type: "player.transferred_out",
    summary: `Player ${player.registrationCode} moved to another customer`,
    staffId: input.actorStaffId,
    metadata: { playerId: player.id, reason: input.reason },
  });
  await recordActivity({
    customerId: input.toCustomerId,
    type: "player.transferred_in",
    summary: `Player ${player.registrationCode} moved in from another customer`,
    staffId: input.actorStaffId,
    metadata: { playerId: player.id, reason: input.reason },
  });
  return moved;
}

// ─── Player types ─────────────────────────────────────────────────────────────

export async function listPlayerTypes(opts: { activeOnly?: boolean } = {}) {
  const db = shopDb();
  const types = await db.playerType.findMany({
    where: opts.activeOnly ? { active: true } : undefined,
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  const counts = await db.registeredPlayer.groupBy({ by: ["playerTypeId"], _count: { _all: true } });
  const byType = new Map(counts.map((c) => [c.playerTypeId, c._count._all]));
  return types.map((t) => ({ ...t, playerCount: byType.get(t.id) ?? 0 }));
}

export async function createPlayerType(input: { actorStaffId: string; code: string; name: string; description?: string | null }) {
  const code = input.code.trim().toUpperCase().replace(/\s+/g, "_");
  const existing = await shopDb().playerType.findUnique({ where: { code } });
  if (existing) throw new ShopError("CONFLICT", `A player type with code ${code} already exists`);
  const type = await shopDb().playerType.create({
    data: { code, name: input.name.trim(), description: input.description?.trim() || null },
  });
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "player_type.created", { type: "PlayerType", id: type.id }, { code });
  return type;
}

/**
 * Types are never deleted, only deactivated: a deleted type would orphan every player that
 * referenced it, and the service history of a machine matters more than a tidy list.
 */
export async function updatePlayerType(input: {
  actorStaffId: string;
  typeId: string;
  patch: { name?: string; description?: string | null; active?: boolean };
}) {
  const db = shopDb();
  const existing = await db.playerType.findUnique({ where: { id: input.typeId } });
  if (!existing) throw notFound("Player type");
  const updated = await db.playerType.update({
    where: { id: existing.id },
    data: {
      ...(input.patch.name !== undefined ? { name: input.patch.name.trim() } : {}),
      ...(input.patch.description !== undefined ? { description: input.patch.description?.trim() || null } : {}),
      ...(input.patch.active !== undefined ? { active: input.patch.active } : {}),
    },
  });
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "player_type.updated", { type: "PlayerType", id: existing.id }, {
    ...input.patch,
  });
  return updated;
}

/**
 * Finding a customer from something printed on a machine. Registration codes get read over
 * the phone, so the search is case- and space-insensitive and matches partially.
 */
export async function findPlayersByReference(reference: string, limit = 20): Promise<PlayerView[]> {
  const q = reference.trim();
  if (q.length < 3) return [];
  const normalised = normaliseCode(q);
  const rows = await shopDb().registeredPlayer.findMany({
    where: {
      OR: [
        { registrationCode: { contains: normalised } },
        { registrationIdentifier: { contains: normalised } },
        { serialNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { ...PLAYER_PUBLIC_SELECT, activationKeyEncrypted: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(withKeyFlag);
}
