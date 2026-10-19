import "server-only";
import { randomBytes } from "node:crypto";
import type { Cart } from "@/generated/shop-prisma/client";
import { priceCart, type CartPricingResult, type PricingCartLine } from "../domain/cart-pricing";
import { DEFAULT_CURRENCY } from "../domain/money";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { eligibleMusicPlayers, loadPricingTargets, requireCustomerMusicPlayer, type MusicPlayer } from "./music-licenses";
import { getMusicPolicy } from "./music-policy";
import { loadPricingCatalog } from "./pricing-loader";

/**
 * Server-authoritative cart. The browser only ever sends "add X for player P" / "remove
 * line Y" / "line Y is for player P"; all prices, licensing and availability are decided
 * here on every read.
 *
 * Music lines carry a target player. Signed-in customers with one eligible player get it
 * automatically; with several they must choose; with none they may "assign later" when the
 * music policy allows it. Anonymous lines have no target until sign-in.
 */

export const CART_COOKIE = "dmi_cart";

export type CartIdentity = { customerId: string | null; anonymousToken: string | null };

export function newAnonymousToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function findCart(identity: CartIdentity): Promise<Cart | null> {
  const db = shopDb();
  if (identity.customerId) return db.cart.findUnique({ where: { customerId: identity.customerId } });
  if (identity.anonymousToken) return db.cart.findUnique({ where: { anonymousToken: identity.anonymousToken } });
  return null;
}

async function getOrCreateCart(identity: CartIdentity): Promise<Cart> {
  const db = shopDb();
  if (identity.customerId) {
    return db.cart.upsert({
      where: { customerId: identity.customerId },
      create: { customerId: identity.customerId, currency: DEFAULT_CURRENCY },
      update: {},
    });
  }
  if (!identity.anonymousToken) throw new ShopError("INVALID_STATE", "Missing cart identity");
  return db.cart.upsert({
    where: { anonymousToken: identity.anonymousToken },
    create: { anonymousToken: identity.anonymousToken, currency: DEFAULT_CURRENCY },
    update: {},
  });
}

export type CartPlayer = Pick<MusicPlayer, "id" | "name" | "typeName" | "maskedRegistration">;

export type PricedCart = {
  cartId: string | null;
  pricing: CartPricingResult;
  itemCount: number;
  /** The customer's eligible players (empty for anonymous carts). */
  players: CartPlayer[];
  /** Music may be bought now and assigned to a player later. */
  assignLaterAllowed: boolean;
};

const cartPlayer = (p: MusicPlayer): CartPlayer => ({ id: p.id, name: p.name, typeName: p.typeName, maskedRegistration: p.maskedRegistration });

function toPricingLine(i: { id: string; itemType: string; arrangementId: string | null; bundleId: string | null; softwareProductId: string | null; lastSeenPriceCents: number; targetPlayerId: string | null }): PricingCartLine {
  return i.itemType === "BUNDLE"
    ? { cartItemId: i.id, type: "BUNDLE", bundleId: i.bundleId!, lastSeenPriceCents: i.lastSeenPriceCents, targetPlayerId: i.targetPlayerId }
    : i.itemType === "SOFTWARE_LICENSE"
      ? { cartItemId: i.id, type: "SOFTWARE_LICENSE", softwareProductId: i.softwareProductId!, lastSeenPriceCents: i.lastSeenPriceCents }
      : { cartItemId: i.id, type: "ARRANGEMENT", arrangementId: i.arrangementId!, lastSeenPriceCents: i.lastSeenPriceCents, targetPlayerId: i.targetPlayerId };
}

/** Prices lines for a signed-in customer (per player) or an anonymous visitor (no targets). */
export async function priceLines(customerId: string | null, currency: string, lines: PricingCartLine[]) {
  const catalog = await loadPricingCatalog(lines);
  if (!customerId) {
    return {
      pricing: priceCart({ currency, lines, ...catalog, ownedArrangementIds: new Set() }),
      players: [] as MusicPlayer[],
      assignLaterAllowed: false,
    };
  }
  const ctx = await loadPricingTargets(customerId, lines, catalog.bundles);
  return {
    pricing: priceCart({
      currency, lines, ...catalog, ownedArrangementIds: new Set(),
      targets: ctx.targets, customerLicensedArrangementIds: ctx.customerLicensedArrangementIds, additionalPriceCents: ctx.additionalPriceCents,
    }),
    players: ctx.eligiblePlayers,
    assignLaterAllowed: ctx.targets.get("unassigned")?.eligible ?? false,
  };
}

const EMPTY_PRICING = (currency = DEFAULT_CURRENCY): CartPricingResult => ({
  currency, lines: [], excluded: [], notices: [], retailTotalCents: 0, totalCents: 0, discountCents: 0,
});

/**
 * Reprices the cart from the database. Lines that are owned / unavailable are removed from
 * the stored cart (and reported once in `excluded`); price-change notices are acknowledged
 * by updating `lastSeenPriceCents`.
 */
export async function getPricedCart(identity: CartIdentity, opts: { persist?: boolean } = {}): Promise<PricedCart> {
  const persist = opts.persist ?? true;
  const cart = await findCart(identity);
  const players = identity.customerId ? (await eligibleMusicPlayers(identity.customerId)).map(cartPlayer) : [];
  if (!cart) return { cartId: null, pricing: EMPTY_PRICING(), itemCount: 0, players, assignLaterAllowed: false };
  const db = shopDb();
  const items = await db.cartItem.findMany({ where: { cartId: cart.id }, orderBy: { addedAt: "asc" } });
  if (items.length === 0) return { cartId: cart.id, pricing: EMPTY_PRICING(cart.currency), itemCount: 0, players, assignLaterAllowed: false };

  const lines = items.map(toPricingLine);
  const priced = await priceLines(identity.customerId, cart.currency, lines);
  const { pricing } = priced;
  const result = { cartId: cart.id, pricing, players: priced.players.map(cartPlayer), assignLaterAllowed: priced.assignLaterAllowed };

  if (persist) {
    const toRemove = pricing.excluded.filter((e) => e.removeFromCart).map((e) => e.cartItemId);
    const priceUpdates = pricing.notices.filter((n) => n.code === "PRICE_CHANGED");
    if (toRemove.length || priceUpdates.length) {
      await db.$transaction([
        ...(toRemove.length ? [db.cartItem.deleteMany({ where: { id: { in: toRemove }, cartId: cart.id } })] : []),
        ...priceUpdates.map((n) =>
          db.cartItem.updateMany({ where: { id: n.cartItemId, cartId: cart.id }, data: { lastSeenPriceCents: n.currentCents } }),
        ),
      ]);
    }
    return { ...result, itemCount: items.length - toRemove.length };
  }
  return { ...result, itemCount: items.length };
}

export type CartAddItem =
  | { type: "ARRANGEMENT"; arrangementId: string; targetPlayerId?: string | null }
  | { type: "BUNDLE"; bundleId: string; targetPlayerId?: string | null }
  | { type: "SOFTWARE_LICENSE"; softwareProductId: string };

/**
 * Which player a new music line is for. An explicit id is checked against the signed-in
 * customer (never trusted); otherwise one eligible player is used automatically, several
 * require a choice, none means "assign later" when the policy allows it.
 */
export async function resolveTargetPlayer(customerId: string | null, requested: string | null | undefined): Promise<string | null> {
  // Music is licensed to a player, so it can only be bought signed in.
  if (!customerId) throw new ShopError("UNAUTHENTICATED", "Sign in to buy music");
  if (requested) return (await requireCustomerMusicPlayer(customerId, requested)).id;
  const players = await eligibleMusicPlayers(customerId);
  if (players.length === 1) return players[0]!.id;
  if (players.length > 1) {
    throw new ShopError("PLAYER_REQUIRED", "Choose which player this music is for", { players: players.map(cartPlayer) });
  }
  if (!(await getMusicPolicy()).allowAssignLater) {
    throw new ShopError("PLAYER_REQUIRED", "You need a registered DMI Player before music can be activated", { players: [] });
  }
  return null;
}

export async function addToCart(identity: CartIdentity, item: CartAddItem) {
  const db = shopDb();
  let priceCents: number;
  let targetPlayerId: string | null = null;
  if (item.type === "SOFTWARE_LICENSE") {
    const p = await db.softwareProduct.findFirst({ where: { id: item.softwareProductId, status: "ACTIVE" } });
    if (!p || p.defaultLicensePriceCents == null || p.defaultLicensePriceCents <= 0) throw new ShopError("UNAVAILABLE", "A license for this software is not on sale");
    priceCents = p.defaultLicensePriceCents;
  } else {
    targetPlayerId = await resolveTargetPlayer(identity.customerId, item.targetPlayerId);
    const line: PricingCartLine = item.type === "ARRANGEMENT"
      ? { cartItemId: "probe", type: "ARRANGEMENT", arrangementId: item.arrangementId, lastSeenPriceCents: 0, targetPlayerId }
      : { cartItemId: "probe", type: "BUNDLE", bundleId: item.bundleId, lastSeenPriceCents: 0, targetPlayerId };
    const { pricing, players } = await priceLines(identity.customerId, DEFAULT_CURRENCY, [line]);
    const excluded = pricing.excluded[0];
    const playerName = players.find((p) => p.id === targetPlayerId)?.name;
    if (excluded?.reason === "ALREADY_OWNED") {
      throw new ShopError("ALREADY_OWNED", item.type === "BUNDLE"
        ? `${playerName ?? "This player"} already has everything in this collection`
        : playerName ? `Already licensed for ${playerName}` : "You already have this arrangement");
    }
    if (excluded?.reason === "INCOMPATIBLE") throw new ShopError("UNAVAILABLE", `This ${item.type === "BUNDLE" ? "collection" : "arrangement"} is not available for ${playerName ?? "this player"}`);
    if (excluded?.reason === "PLAYER_REQUIRED" || excluded?.reason === "PLAYER_UNAVAILABLE") throw new ShopError("PLAYER_REQUIRED", "Choose which player this music is for");
    if (excluded) throw new ShopError("UNAVAILABLE", `This ${item.type === "BUNDLE" ? "collection" : "arrangement"} is not available`);
    priceCents = pricing.lines[0]!.chargedCents;
  }

  const cart = await getOrCreateCart(identity);
  if (item.type === "SOFTWARE_LICENSE") {
    await db.cartItem.upsert({
      where: { cartId_softwareProductId: { cartId: cart.id, softwareProductId: item.softwareProductId } },
      create: { cartId: cart.id, itemType: item.type, softwareProductId: item.softwareProductId, lastSeenPriceCents: priceCents },
      update: { lastSeenPriceCents: priceCents },
    });
  } else {
    const ref = item.type === "ARRANGEMENT" ? { arrangementId: item.arrangementId } : { bundleId: item.bundleId };
    const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, ...ref, targetPlayerId } });
    if (existing) {
      await db.cartItem.update({ where: { id: existing.id }, data: { lastSeenPriceCents: priceCents } });
    } else {
      try {
        await db.cartItem.create({ data: { cartId: cart.id, itemType: item.type, ...ref, targetPlayerId, lastSeenPriceCents: priceCents } });
      } catch {
        // A concurrent add of the same line won the race: same outcome.
      }
    }
  }
  await db.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return cart;
}

/**
 * Changes which player a music line is for (only while it is in the cart; after purchase
 * the license is locked to its player). If the cart already has the same item for that
 * player, the two lines merge.
 */
export async function setCartItemTarget(identity: CartIdentity, cartItemId: string, playerId: string) {
  if (!identity.customerId) throw new ShopError("UNAUTHENTICATED", "Sign in to choose a player");
  const db = shopDb();
  const cart = await findCart(identity);
  const item = cart ? await db.cartItem.findFirst({ where: { id: cartItemId, cartId: cart.id } }) : null;
  if (!cart || !item || item.itemType === "SOFTWARE_LICENSE") throw new ShopError("NOT_FOUND", "Cart line not found");
  const player = await requireCustomerMusicPlayer(identity.customerId, playerId);
  if (item.targetPlayerId === player.id) return;
  const duplicate = await db.cartItem.findFirst({
    where: { cartId: cart.id, targetPlayerId: player.id, ...(item.arrangementId ? { arrangementId: item.arrangementId } : { bundleId: item.bundleId }) },
  });
  if (duplicate) await db.cartItem.delete({ where: { id: item.id } });
  else await db.cartItem.update({ where: { id: item.id }, data: { targetPlayerId: player.id } });
}

/** Removes a line only if it belongs to the caller's cart (no IDOR). */
export async function removeFromCart(identity: CartIdentity, cartItemId: string) {
  const cart = await findCart(identity);
  if (!cart) return;
  await shopDb().cartItem.deleteMany({ where: { id: cartItemId, cartId: cart.id } });
}

/**
 * On sign-in: move anonymous lines into the customer's cart, then drop the anonymous cart.
 * A customer with exactly one eligible player gets the lines targeted at it; otherwise they
 * stay untargeted and the cart asks which player they are for.
 */
export async function mergeAnonymousCart(anonymousToken: string, customerId: string) {
  const db = shopDb();
  const anon = await db.cart.findUnique({ where: { anonymousToken }, include: { items: true } });
  if (!anon) return;
  if (anon.items.length > 0) {
    const target = await db.cart.upsert({
      where: { customerId },
      create: { customerId, currency: anon.currency },
      update: {},
    });
    const players = await eligibleMusicPlayers(customerId);
    const autoTarget = players.length === 1 ? players[0]!.id : null;
    for (const i of anon.items) {
      const targetPlayerId = i.itemType === "SOFTWARE_LICENSE" ? null : autoTarget;
      if (i.itemType !== "SOFTWARE_LICENSE") {
        const dup = await db.cartItem.findFirst({
          where: { cartId: target.id, targetPlayerId, ...(i.arrangementId ? { arrangementId: i.arrangementId } : { bundleId: i.bundleId }) },
        });
        if (dup) continue;
      }
      try {
        await db.cartItem.create({
          data: {
            cartId: target.id, itemType: i.itemType, arrangementId: i.arrangementId, bundleId: i.bundleId, softwareProductId: i.softwareProductId,
            targetPlayerId, lastSeenPriceCents: i.lastSeenPriceCents, addedAt: i.addedAt,
          },
        });
      } catch {
        // Already in the customer's cart — keep theirs.
      }
    }
  }
  await db.cart.delete({ where: { id: anon.id } });
}

/** After fulfillment: drop the cart lines this order bought (same item AND same player). */
export async function clearPurchasedFromCart(
  customerId: string,
  purchased: { arrangementId?: string | null; bundleId?: string | null; softwareProductId?: string | null; targetPlayerId?: string | null }[],
) {
  const db = shopDb();
  const cart = await db.cart.findUnique({ where: { customerId } });
  if (!cart || !purchased.length) return;
  await db.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      OR: purchased.map((p) =>
        p.softwareProductId
          ? { softwareProductId: p.softwareProductId }
          : { ...(p.arrangementId ? { arrangementId: p.arrangementId } : { bundleId: p.bundleId }), targetPlayerId: p.targetPlayerId ?? null },
      ),
    },
  });
}
