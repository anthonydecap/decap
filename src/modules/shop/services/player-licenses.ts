import "server-only";
import { createHash } from "node:crypto";
import type { PlayerLicenseOrder } from "@/generated/shop-prisma/client";
import { shopDb } from "../db";
import { ShopError, notFound } from "../errors";
import { storage } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { audit } from "./audit";
import { recordActivity } from "./crm";
import { onPlayerActivated } from "./music-licenses";
import { verifyDecapLicense } from "./decap-license-file";
import { formatCustomerNumber } from "./decap-request";
import { appUrl, notify } from "./email";

/**
 * The licence queue (licence v1, contract C7 §4/§5).
 *
 * A Decap Player registered with a `.decapreq` needs a licence that lists every song it may
 * play. The shop cannot make one (it holds no signing key and no song keys, C7 rule 1/5), so
 * it keeps an order per player: WAITING while a licence is wanted, DONE once Tony uploads the
 * signed `.decaplic`, REFUSED with a reason.
 *
 * The queue is derived, not hand-kept: `syncPlayerLicenseOrder` compares the songs the player
 * has active music licences for with the songs in its last issued licence, and opens or
 * refreshes the WAITING order. It runs on registration and whenever the queue or a player
 * page is opened, so a missed hook heals itself.
 */

const LICENCE_STORE = "DELIVERIES" as const;
const DEFAULTS = { edition: "standard", midiOut: true, validUntil: null as string | null, dmiUserId: null as number | null };

type WantedSong = { arrangementId: string; songId: string };

/** Every song the player may play now: active music licences whose arrangement has a song ID. */
async function wantedSongs(playerId: string): Promise<{ songs: WantedSong[]; withoutSongId: { arrangementId: string; title: string }[] }> {
  const rows = await shopDb().musicLicense.findMany({
    where: { licensedPlayerId: playerId, status: "ACTIVE" },
    select: { arrangement: { select: { id: true, songId: true, displayTitle: true } } },
  });
  const songs = new Map<string, WantedSong>();
  const withoutSongId = new Map<string, { arrangementId: string; title: string }>();
  for (const { arrangement: a } of rows) {
    if (a.songId) songs.set(a.songId, { arrangementId: a.id, songId: a.songId });
    else withoutSongId.set(a.id, { arrangementId: a.id, title: a.displayTitle });
  }
  return { songs: [...songs.values()].sort((x, y) => x.songId.localeCompare(y.songId)), withoutSongId: [...withoutSongId.values()] };
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/**
 * Opens or refreshes the WAITING order of one player. Returns the WAITING order, or null when
 * the player needs nothing (or is not a licence v1 player).
 *
 * - no licence ever issued, or a wanted song missing from the last one -> WAITING;
 * - a WAITING order always carries the current song list;
 * - a refusal sticks until the wanted songs change.
 * Songs that are no longer wanted (refund, transfer) do not open an order: a licence that was
 * handed out cannot be taken back, and the next licence leaves them out anyway.
 */
export async function syncPlayerLicenseOrder(playerId: string): Promise<PlayerLicenseOrder | null> {
  const db = shopDb();
  const player = await db.registeredPlayer.findUnique({
    where: { id: playerId },
    select: { id: true, customerId: true, status: true, licensePlayerId: true },
  });
  if (!player?.licensePlayerId || player.status === "RETIRED") return null;

  const { songs } = await wantedSongs(player.id);
  const wanted = songs.map((s) => s.songId);
  const orders = await db.playerLicenseOrder.findMany({
    where: { playerId: player.id },
    orderBy: { createdAt: "desc" },
    include: { songs: { select: { songId: true } } },
  });
  const waiting = orders.find((o) => o.status === "WAITING");
  const lastDone = orders.find((o) => o.status === "DONE");

  if (waiting) {
    if (!sameSet(waiting.songs.map((s) => s.songId), wanted)) {
      await db.$transaction([
        db.playerLicenseOrderSong.deleteMany({ where: { orderId: waiting.id } }),
        db.playerLicenseOrderSong.createMany({ data: songs.map((s) => ({ orderId: waiting.id, ...s })) }),
        db.playerLicenseOrder.update({ where: { id: waiting.id }, data: { updatedAt: new Date() } }),
      ]);
    }
    return waiting;
  }

  const needs = !lastDone || wanted.some((id) => !lastDone.issuedSongIds.includes(id));
  if (!needs) return null;
  const latest = orders[0];
  if (latest?.status === "REFUSED" && sameSet(latest.songs.map((s) => s.songId), wanted)) return null;

  const settings = lastDone
    ? { edition: lastDone.edition, midiOut: lastDone.midiOut, validUntil: lastDone.validUntil, dmiUserId: lastDone.dmiUserId }
    : DEFAULTS;
  try {
    return await db.playerLicenseOrder.create({
      data: {
        playerId: player.id,
        customerId: player.customerId,
        reason: lastDone ? "New music for the player" : "New player",
        ...settings,
        songs: { create: songs.map((s) => ({ arrangementId: s.arrangementId, songId: s.songId })) },
      },
    });
  } catch (err) {
    // Opened at the same moment by another request: the partial unique index decides.
    if ((err as { code?: string }).code === "P2002") return db.playerLicenseOrder.findFirst({ where: { playerId: player.id, status: "WAITING" } });
    throw err;
  }
}

/** Heals the whole queue (admin queue page). Small numbers of players; one by one is fine. */
export async function syncAllPlayerLicenseOrders(): Promise<void> {
  const players = await shopDb().registeredPlayer.findMany({
    where: { licensePlayerId: { not: null }, status: { not: "RETIRED" } },
    select: { id: true },
  });
  for (const p of players) await syncPlayerLicenseOrder(p.id);
}

export async function listPlayerLicenseOrders(opts: { status?: "WAITING" | "DONE" | "REFUSED"; take?: number } = {}) {
  return shopDb().playerLicenseOrder.findMany({
    where: opts.status ? { status: opts.status } : undefined,
    orderBy: [{ createdAt: opts.status === "WAITING" ? "asc" : "desc" }],
    take: opts.take ?? 100,
    include: {
      player: { select: { id: true, friendlyName: true, licensePlayerId: true } },
      customer: { select: { id: true, customerNumber: true, email: true, firstName: true, lastName: true, companyName: true } },
      _count: { select: { songs: true } },
    },
  });
}

export async function getPlayerLicenseOrder(orderId: string) {
  const order = await shopDb().playerLicenseOrder.findUnique({
    where: { id: orderId },
    include: {
      player: { select: { id: true, friendlyName: true, status: true, licensePlayerId: true, licensePublicKey: true, licenseRequestAt: true } },
      customer: { select: { id: true, customerNumber: true, email: true, firstName: true, lastName: true, companyName: true } },
      processedBy: { select: { displayName: true, email: true } },
      songs: { include: { arrangement: { select: { id: true, displayTitle: true, sku: true } } }, orderBy: { songId: "asc" } },
    },
  });
  if (!order) throw notFound("Licence order");
  const { withoutSongId } = await wantedSongs(order.playerId);
  return { ...order, customerNumberText: formatCustomerNumber(order.customer.customerNumber), withoutSongId };
}

// ─── What Tony needs offline ─────────────────────────────────────────────────

type OrderForFiles = {
  edition: string;
  midiOut: boolean;
  validUntil: string | null;
  dmiUserId: number | null;
  player: { licensePlayerId: string | null; licensePublicKey: string | null };
  customer: { customerNumber: number };
  songs: { songId: string }[];
};

function requirePlayerKey(o: OrderForFiles) {
  const { licensePlayerId: id, licensePublicKey: key } = o.player;
  if (!id || !key) throw new ShopError("INVALID_STATE", "This player has no activation request (.decapreq) on file");
  return { id, key };
}

/** The player's `.decapreq`, rebuilt from the public data (same format the player writes). */
export function licenseRequestFile(o: OrderForFiles): { filename: string; text: string } {
  const { id, key } = requirePlayerKey(o);
  const text = [
    "{",
    '  "format": "decap-request",',
    '  "formatVersion": 1,',
    `  "player": { "id": "${id}", "publicKey": "${key}" },`,
    '  "app": "Decap webshop",',
    `  "created": "${new Date().toISOString().slice(0, 10)}"`,
    "}",
    "",
  ].join("\n");
  return { filename: `${id}.decapreq`, text };
}

/** The song IDs for `decaplic issue --nummers`, one per line. */
export function licenseSongsFile(o: OrderForFiles): { filename: string; text: string } {
  const { id } = requirePlayerKey(o);
  return { filename: `${id}_songs.txt`, text: o.songs.map((s) => s.songId).join("\n") + (o.songs.length ? "\n" : "") };
}

/** The command line, with placeholders for the two files that never leave the vault. */
export function decaplicCommand(o: OrderForFiles): string {
  const { id } = requirePlayerKey(o);
  return [
    "decaplic issue <decap-2026-1.sec>", `${id}.decapreq`, formatCustomerNumber(o.customer.customerNumber), "<nummers.txt>", `${id}.decaplic`,
    o.songs.length ? `--nummers ${id}_songs.txt` : "--geen",
    `--edition ${o.edition}`, `--midiout ${o.midiOut ? "ja" : "nee"}`,
    ...(o.validUntil ? [`--tot ${o.validUntil}`] : []),
    ...(o.dmiUserId ? [`--dmiuser ${o.dmiUserId}`] : []),
  ].join(" ");
}

// ─── Staff actions ────────────────────────────────────────────────────────────

export async function updateLicenseOrderSettings(input: {
  staffId: string;
  orderId: string;
  edition: "standard" | "pro";
  midiOut: boolean;
  validUntil: string | null;
  dmiUserId: number | null;
}) {
  const order = await shopDb().playerLicenseOrder.findUnique({ where: { id: input.orderId }, select: { id: true, status: true } });
  if (!order) throw notFound("Licence order");
  if (order.status !== "WAITING") throw new ShopError("INVALID_STATE", "Only a waiting order can be changed");
  const { staffId, orderId, ...data } = input;
  await shopDb().playerLicenseOrder.update({ where: { id: orderId }, data });
  await audit({ type: "STAFF", staffId }, "player_license.settings", { type: "PlayerLicenseOrder", id: orderId }, data);
}

/**
 * Tony uploads the `.decaplic` he made offline. It must be genuine (signature), for exactly
 * this player and customer, and hold every wanted song. Only then is it stored (private
 * store) and the customer told.
 */
export async function uploadIssuedLicense(input: { staffId: string; orderId: string; fileText: string }) {
  const db = shopDb();
  const order = await db.playerLicenseOrder.findUnique({
    where: { id: input.orderId },
    include: {
      player: { select: { id: true, friendlyName: true, licensePlayerId: true, licensePublicKey: true, status: true } },
      customer: { select: { id: true, customerNumber: true, email: true, preferredLanguage: true } },
      songs: { select: { songId: true } },
    },
  });
  if (!order) throw notFound("Licence order");
  if (order.status !== "WAITING") throw new ShopError("INVALID_STATE", "This order is not waiting for a licence any more");

  const lic = verifyDecapLicense(input.fileText);
  if (lic.playerId !== order.player.licensePlayerId || lic.publicKey !== order.player.licensePublicKey) {
    throw new ShopError("VALIDATION_FAILED", `This licence is for another player (${lic.playerId}), not for ${order.player.licensePlayerId}.`);
  }
  const customerNumber = formatCustomerNumber(order.customer.customerNumber);
  if (lic.customer !== customerNumber) {
    throw new ShopError("VALIDATION_FAILED", `This licence names customer ${lic.customer}; this customer is ${customerNumber}.`);
  }
  const missing = order.songs.map((s) => s.songId).filter((id) => !lic.songIds.includes(id));
  if (missing.length) {
    throw new ShopError("VALIDATION_FAILED", `The licence is missing ${missing.length} song(s) the player has bought: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? ", ..." : ""}`);
  }
  if (await db.playerLicenseOrder.findUnique({ where: { licenseId: lic.licenseId }, select: { id: true } })) {
    throw new ShopError("CONFLICT", "This licence file was uploaded before (same licence ID)");
  }

  const bytes = Buffer.from(input.fileText, "utf8");
  const fileSha256 = createHash("sha256").update(bytes).digest("hex");
  const storageKey = generateObjectKey(LICENCE_STORE, "player-licences", "decaplic");
  await storage().write({ store: LICENCE_STORE, key: storageKey }, new Uint8Array(bytes), "application/octet-stream");

  const now = new Date();
  const done = await db.playerLicenseOrder.update({
    where: { id: order.id },
    data: {
      status: "DONE",
      licenseId: lic.licenseId,
      signerKeyId: lic.signerKeyId,
      issued: lic.issued,
      edition: lic.edition,
      midiOut: lic.midiOut,
      validUntil: lic.validUntil,
      dmiUserId: lic.dmiUserId,
      issuedSongIds: lic.songIds,
      fileSha256,
      storageKey,
      processedByStaffId: input.staffId,
      processedAt: now,
    },
  });

  await audit({ type: "STAFF", staffId: input.staffId }, "player_license.issued", { type: "PlayerLicenseOrder", id: order.id }, {
    playerId: order.player.id, licenseId: lic.licenseId, fileSha256, songs: lic.songIds.length, edition: lic.edition,
  });
  await recordActivity({
    customerId: order.customer.id,
    type: "player.license_issued",
    summary: `Licence for player ${order.player.friendlyName ?? lic.playerId} is ready (${lic.songIds.length} song(s))`,
    staffId: input.staffId,
    metadata: { playerId: order.player.id, orderId: order.id, licenseId: lic.licenseId },
  });
  await notify({
    to: order.customer.email,
    subject: "Your Decap Player licence is ready",
    text: `The licence for your player ${order.player.friendlyName ?? ""} is ready. Download it from your account and install it in the player with Help > Install License File.`.replace("  ", " "),
    actionUrl: appUrl(`/${order.customer.preferredLanguage ?? "en"}/shop/account/players/${order.player.id}`),
    actionLabel: "Download the licence",
  });
  // The first licence is Decap approving the player: it becomes ACTIVE (music can be bought for
  // it; waiting music and the starter collection land, which may open the next order at once).
  if (order.player.status === "PENDING") {
    await db.registeredPlayer.update({ where: { id: order.player.id }, data: { status: "ACTIVE", activatedAt: now, updatedByStaffId: input.staffId } });
    await audit({ type: "STAFF", staffId: input.staffId }, "player.updated", { type: "RegisteredPlayer", id: order.player.id }, { status: "ACTIVE", by: "first licence" });
    await onPlayerActivated(order.player.id, input.staffId);
    await syncPlayerLicenseOrder(order.player.id);
  }
  return done;
}

export async function refuseLicenseOrder(input: { staffId: string; orderId: string; reason: string }) {
  const reason = input.reason.trim();
  if (reason.length < 3) throw new ShopError("VALIDATION_FAILED", "Give a reason");
  const order = await shopDb().playerLicenseOrder.findUnique({ where: { id: input.orderId }, select: { id: true, status: true, customerId: true, playerId: true } });
  if (!order) throw notFound("Licence order");
  if (order.status !== "WAITING") throw new ShopError("INVALID_STATE", "Only a waiting order can be refused");
  await shopDb().playerLicenseOrder.update({
    where: { id: order.id },
    data: { status: "REFUSED", refusedReason: reason, processedByStaffId: input.staffId, processedAt: new Date() },
  });
  await audit({ type: "STAFF", staffId: input.staffId }, "player_license.refused", { type: "PlayerLicenseOrder", id: order.id }, { playerId: order.playerId, reason });
}

// ─── Customer ─────────────────────────────────────────────────────────────────

/** What the customer sees on a player page: the latest order, and whether a licence is ready. */
export async function customerPlayerLicenseState(customerId: string, playerId: string) {
  const player = await shopDb().registeredPlayer.findFirst({ where: { id: playerId, customerId }, select: { id: true, licensePlayerId: true } });
  if (!player?.licensePlayerId) return null;
  await syncPlayerLicenseOrder(player.id);
  const [waiting, lastDone] = await Promise.all([
    shopDb().playerLicenseOrder.findFirst({ where: { playerId: player.id, status: "WAITING" }, select: { createdAt: true } }),
    shopDb().playerLicenseOrder.findFirst({
      where: { playerId: player.id, status: "DONE" },
      orderBy: { processedAt: "desc" },
      select: { id: true, issued: true, edition: true, issuedSongIds: true, validUntil: true },
    }),
  ]);
  return {
    waitingSince: waiting?.createdAt ?? null,
    ready: lastDone ? { issued: lastDone.issued, edition: lastDone.edition, songs: lastDone.issuedSongIds.length, validUntil: lastDone.validUntil } : null,
  };
}

/** The newest licence of the customer's own player, as bytes. The caller has checked the session. */
export async function customerLicenseFile(customerId: string, playerId: string): Promise<{ filename: string; bytes: Uint8Array }> {
  const order = await shopDb().playerLicenseOrder.findFirst({
    where: { playerId, customerId, status: "DONE", player: { customerId } },
    orderBy: { processedAt: "desc" },
    select: { id: true, storageKey: true, player: { select: { licensePlayerId: true } } },
  });
  if (!order?.storageKey) throw new ShopError("NOT_FOUND", "No licence is ready for this player yet");
  const stream = await storage().openRead({ store: LICENCE_STORE, key: order.storageKey });
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  await audit({ type: "CUSTOMER", customerId }, "player_license.downloaded", { type: "PlayerLicenseOrder", id: order.id }, {});
  return { filename: `${order.player.licensePlayerId}.decaplic`, bytes };
}
