import "server-only";
import { randomBytes } from "node:crypto";
import type { Cart } from "@/generated/shop-prisma/client";
import { priceCart, type CartPricingResult, type PricingCartLine } from "../domain/cart-pricing";
import { DEFAULT_CURRENCY } from "../domain/money";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { activeEntitlementArrangementIds } from "./entitlements";
import { loadPricingCatalog } from "./pricing-loader";

/**
 * Server-authoritative cart. The browser only ever sends "add X" / "remove line Y"; all
 * prices, ownership and availability are decided here on every read.
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

export type PricedCart = {
  cartId: string | null;
  pricing: CartPricingResult;
  itemCount: number;
};

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
  if (!cart) return { cartId: null, pricing: EMPTY_PRICING(), itemCount: 0 };
  const db = shopDb();
  const items = await db.cartItem.findMany({ where: { cartId: cart.id }, orderBy: { addedAt: "asc" } });
  if (items.length === 0) return { cartId: cart.id, pricing: EMPTY_PRICING(cart.currency), itemCount: 0 };

  const lines: PricingCartLine[] = items.map((i) =>
    i.itemType === "BUNDLE"
      ? { cartItemId: i.id, type: "BUNDLE", bundleId: i.bundleId!, lastSeenPriceCents: i.lastSeenPriceCents }
      : { cartItemId: i.id, type: "ARRANGEMENT", arrangementId: i.arrangementId!, lastSeenPriceCents: i.lastSeenPriceCents },
  );
  const [{ arrangements, bundles }, owned] = await Promise.all([
    loadPricingCatalog(lines),
    identity.customerId ? activeEntitlementArrangementIds(identity.customerId) : Promise.resolve(new Set<string>()),
  ]);
  const pricing = priceCart({ currency: cart.currency, lines, arrangements, bundles, ownedArrangementIds: owned });

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
    const remaining = items.length - toRemove.length;
    return { cartId: cart.id, pricing, itemCount: remaining };
  }
  return { cartId: cart.id, pricing, itemCount: items.length };
}

export async function addToCart(
  identity: CartIdentity,
  item: { type: "ARRANGEMENT"; arrangementId: string } | { type: "BUNDLE"; bundleId: string },
) {
  const db = shopDb();
  const owned = identity.customerId ? await activeEntitlementArrangementIds(identity.customerId) : new Set<string>();

  let priceCents: number;
  if (item.type === "ARRANGEMENT") {
    const a = await db.arrangement.findFirst({ where: { id: item.arrangementId, status: "PUBLISHED" } });
    if (!a) throw new ShopError("UNAVAILABLE", "This arrangement is not available");
    if (owned.has(a.id)) throw new ShopError("ALREADY_OWNED", "You already own this arrangement");
    priceCents = a.priceCents;
  } else {
    const line: PricingCartLine = { cartItemId: "probe", type: "BUNDLE", bundleId: item.bundleId, lastSeenPriceCents: 0 };
    const { arrangements, bundles } = await loadPricingCatalog([line]);
    const priced = priceCart({ currency: DEFAULT_CURRENCY, lines: [line], arrangements, bundles, ownedArrangementIds: owned });
    const excluded = priced.excluded[0];
    if (excluded?.reason === "ALREADY_OWNED") throw new ShopError("ALREADY_OWNED", "You already own everything in this collection");
    if (excluded) throw new ShopError("UNAVAILABLE", "This collection is not available");
    priceCents = priced.lines[0]!.chargedCents;
  }

  const cart = await getOrCreateCart(identity);
  const where = item.type === "ARRANGEMENT"
    ? { cartId_arrangementId: { cartId: cart.id, arrangementId: item.arrangementId } }
    : { cartId_bundleId: { cartId: cart.id, bundleId: item.bundleId } };
  await db.cartItem.upsert({
    where,
    create: {
      cartId: cart.id,
      itemType: item.type,
      arrangementId: item.type === "ARRANGEMENT" ? item.arrangementId : null,
      bundleId: item.type === "BUNDLE" ? item.bundleId : null,
      lastSeenPriceCents: priceCents,
    },
    update: { lastSeenPriceCents: priceCents },
  });
  await db.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return cart;
}

/** Removes a line only if it belongs to the caller's cart (no IDOR). */
export async function removeFromCart(identity: CartIdentity, cartItemId: string) {
  const cart = await findCart(identity);
  if (!cart) return;
  await shopDb().cartItem.deleteMany({ where: { id: cartItemId, cartId: cart.id } });
}

/** On sign-in: move anonymous lines into the customer's cart, then drop the anonymous cart. */
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
    for (const i of anon.items) {
      try {
        await db.cartItem.create({
          data: {
            cartId: target.id, itemType: i.itemType, arrangementId: i.arrangementId, bundleId: i.bundleId,
            lastSeenPriceCents: i.lastSeenPriceCents, addedAt: i.addedAt,
          },
        });
      } catch {
        // Already in the customer's cart — keep theirs.
      }
    }
  }
  await db.cart.delete({ where: { id: anon.id } });
}

/** After fulfillment: drop lines that are now owned or were part of the order. */
export async function clearPurchasedFromCart(customerId: string, arrangementIds: string[], bundleIds: string[]) {
  const db = shopDb();
  const cart = await db.cart.findUnique({ where: { customerId } });
  if (!cart) return;
  await db.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      OR: [
        ...(arrangementIds.length ? [{ arrangementId: { in: arrangementIds } }] : []),
        ...(bundleIds.length ? [{ bundleId: { in: bundleIds } }] : []),
      ],
    },
  });
}
