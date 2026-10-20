import "server-only";
import { createHash } from "node:crypto";
import type { Customer, Prisma } from "@/generated/shop-prisma/client";
import { canonicalPricingString, type CartPricingResult } from "../domain/cart-pricing";
import { computeRoyaltyCents, resolveRoyaltyTerms } from "../domain/royalty";
import { shopConfig } from "../config";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { audit } from "./audit";
import { getPricedCart } from "./cart";
import { reconcileCustomerOrders } from "./payment-reconcile";
import { requireCustomerMusicPlayer } from "./music-licenses";
import { writeBillingSnapshot } from "./profile";
import { stripe } from "./stripe";

/**
 * Checkout preparation. Every call reprices the cart from the database, snapshots an
 * immutable pending Order (items + per-arrangement allocations + royalty terms) and returns
 * a PaymentIntent client secret for the embedded Payment Element. Nothing is fulfilled here
 * — only the Stripe webhook fulfills.
 */

const REUSABLE_PI_STATUSES = new Set(["requires_payment_method", "requires_confirmation", "requires_action"]);

export function formatOrderNumber(n: number) {
  return `DMI-${String(n).padStart(6, "0")}`;
}

export function pricingHash(pricing: CartPricingResult): string {
  return createHash("sha256").update(canonicalPricingString(pricing)).digest("hex");
}

export type PreparedCheckout = {
  orderId: string;
  orderNumber: string;
  /** Empty for a free order, which is fulfilled immediately without Stripe. */
  clientSecret: string;
  pricing: CartPricingResult;
  free?: boolean;
};

export async function prepareCheckout(customer: Customer): Promise<PreparedCheckout> {
  const db = shopDb();
  // Never cancel an order Stripe already took money for (or is still processing): ask Stripe
  // first, fulfill what was paid, and keep anything we could not check out of the clean-up.
  const checked = await reconcileCustomerOrders(customer.id);
  const keep = new Set([...checked].filter(([, r]) => r !== "UNPAID" && r !== "SKIPPED").map(([id]) => id));
  const { pricing } = await getPricedCart({ customerId: customer.id, anonymousToken: null });
  // No checkout surprises: every music line must say which player receives it.
  const unresolved = pricing.excluded.filter((e) => e.reason === "PLAYER_REQUIRED");
  if (unresolved.length) {
    throw new ShopError("PLAYER_REQUIRED", "Choose which player each item in your cart is for", { cartItemIds: unresolved.map((e) => e.cartItemId) });
  }
  if (pricing.lines.length === 0) {
    throw new ShopError("CART_EMPTY", "There is nothing payable in your cart", { excluded: pricing.excluded });
  }
  if (pricing.totalCents < 0) {
    throw new ShopError("INVALID_STATE", "Order total cannot be negative");
  }
  const hash = pricingHash(pricing);

  // Serialise prepares per customer so concurrent clicks reuse one order.
  const order = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`checkout:${customer.id}`}))`;
    const pending = await tx.order.findMany({
      where: { customerId: customer.id, status: "PENDING_PAYMENT", id: { notIn: [...keep] } },
      orderBy: { createdAt: "desc" },
    });
    const reusable = pending.find((o) => o.pricingHash === hash && o.createdAt.getTime() > Date.now() - 23 * 3600 * 1000);
    const stale = pending.filter((o) => o !== reusable);
    if (stale.length) {
      await tx.order.updateMany({
        where: { id: { in: stale.map((o) => o.id) }, status: "PENDING_PAYMENT" },
        data: { status: "CANCELED", canceledAt: new Date() },
      });
    }
    if (reusable) return { order: reusable, staleIntentIds: stale.map((o) => o.stripePaymentIntentId).filter(Boolean) as string[] };

    const created = await createOrderSnapshot(tx, customer, pricing, hash);
    return { order: created, staleIntentIds: stale.map((o) => o.stripePaymentIntentId).filter(Boolean) as string[] };
  });

  // Best-effort cancel of superseded PaymentIntents (outside the DB transaction).
  await Promise.all(
    order.staleIntentIds.map((id) => stripe().paymentIntents.cancel(id).catch(() => undefined)),
  );

  // Free music still creates licenses for the chosen player, through the same fulfillment
  // path as a paid order, just without a payment provider.
  if (pricing.totalCents === 0) {
    const { fulfillFreeOrder } = await import("./fulfillment");
    await fulfillFreeOrder(order.order.id);
    await audit({ type: "CUSTOMER", customerId: customer.id }, "checkout.free", { type: "Order", id: order.order.id }, { lineCount: pricing.lines.length });
    return { orderId: order.order.id, orderNumber: formatOrderNumber(order.order.number), clientSecret: "", pricing, free: true };
  }

  const clientSecret = await ensurePaymentIntent(order.order.id, customer);
  await audit({ type: "CUSTOMER", customerId: customer.id }, "checkout.prepare", { type: "Order", id: order.order.id }, {
    totalCents: pricing.totalCents, lineCount: pricing.lines.length,
  });
  return {
    orderId: order.order.id,
    orderNumber: formatOrderNumber(order.order.number),
    clientSecret,
    pricing,
  };
}

async function createOrderSnapshot(
  tx: Prisma.TransactionClient,
  customer: Customer,
  pricing: CartPricingResult,
  hash: string,
) {
  const arrangementIds = [...new Set(pricing.lines.flatMap((l) => l.allocations.map((a) => a.arrangementId)))];
  const arrangements = await tx.arrangement.findMany({
    where: { id: { in: arrangementIds } },
    select: {
      id: true, status: true, arrangerId: true, royaltyBasis: true, royaltyRateBps: true, royaltyFixedCents: true,
      arranger: { select: { defaultRoyaltyBasis: true, defaultRoyaltyRateBps: true, defaultRoyaltyFixedCents: true } },
    },
  });
  const byId = new Map(arrangements.map((a) => [a.id, a]));
  for (const id of arrangementIds) {
    if (byId.get(id)?.status !== "PUBLISHED") throw new ShopError("UNAVAILABLE", "An item in your cart is no longer available");
  }
  // Final server-side check of every target player (ownership, ACTIVE, music-capable).
  const targetIds = [...new Set(pricing.lines.map((l) => l.targetPlayerId).filter(Boolean) as string[])];
  const targets = new Map<string, { name: string; masked: string }>();
  for (const id of targetIds) {
    const p = await requireCustomerMusicPlayer(customer.id, id, tx);
    targets.set(id, { name: p.name, masked: p.maskedRegistration });
  }
  const softwareIds = pricing.lines.filter((l) => l.type === "SOFTWARE_LICENSE").map((l) => l.refId);
  if (softwareIds.length) {
    const ok = await tx.softwareProduct.count({ where: { id: { in: softwareIds }, status: "ACTIVE" } });
    if (ok !== new Set(softwareIds).size) throw new ShopError("UNAVAILABLE", "A software license in your cart is no longer on sale");
  }

  const order = await tx.order.create({
    data: {
      customerId: customer.id,
      currency: pricing.currency,
      retailTotalCents: pricing.retailTotalCents,
      discountCents: pricing.discountCents,
      totalCents: pricing.totalCents,
      pricingHash: hash,
      pricingSnapshot: JSON.parse(JSON.stringify(pricing)) as Prisma.InputJsonValue,
      customerEmailSnapshot: customer.email,
    },
  });
  await writeBillingSnapshot(tx, order.id, customer);

  for (const [position, line] of pricing.lines.entries()) {
    const item = await tx.orderItem.create({
      data: {
        orderId: order.id,
        position,
        itemType: line.type,
        arrangementId: line.type === "ARRANGEMENT" ? line.refId : null,
        bundleId: line.type === "BUNDLE" ? line.refId : null,
        softwareProductId: line.type === "SOFTWARE_LICENSE" ? line.refId : null,
        skuSnapshot: line.sku,
        titleSnapshot: line.title,
        retailValueCents: line.retailValueCents,
        chargedCents: line.chargedCents,
        bundlePriceCents: line.bundle?.priceCents ?? null,
        bundleRetailTotalCents: line.bundle?.retailTotalCents ?? null,
        bundleItemCount: line.bundle?.itemCount ?? null,
        excludedArrangementIds: line.bundle?.excludedArrangementIds ?? [],
        targetPlayerId: line.targetPlayerId ?? null,
        targetPlayerNameSnapshot: line.targetPlayerId ? targets.get(line.targetPlayerId)!.name : null,
        targetRegistrationMaskedSnapshot: line.targetPlayerId ? targets.get(line.targetPlayerId)!.masked : null,
      },
    });
    if (!line.allocations.length) continue;
    await tx.orderItemAllocation.createMany({
      data: line.allocations.map((a) => {
        const arr = byId.get(a.arrangementId)!;
        const terms = resolveRoyaltyTerms(arr, arr.arranger);
        return {
          orderId: order.id,
          orderItemId: item.id,
          arrangementId: a.arrangementId,
          arrangerId: arr.arrangerId,
          skuSnapshot: a.sku,
          titleSnapshot: a.title,
          retailValueCents: a.retailValueCents,
          allocatedCents: a.allocatedCents,
          royaltyBasis: terms.basis,
          royaltyRateBps: terms.rateBps,
          royaltyFixedCents: terms.fixedCents,
          // Royalty on what was actually paid for this copy (additional-player price included).
          royaltyCents: computeRoyaltyCents(a.allocatedCents, terms),
          additionalPlayer: a.additionalPlayer ?? false,
        };
      }),
    });
  }
  return order;
}

/** Creates (or recovers) the order's PaymentIntent. Idempotent per order. */
async function ensurePaymentIntent(orderId: string, customer: Customer): Promise<string> {
  const db = shopDb();
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });

  if (order.stripePaymentIntentId) {
    const existing = await stripe().paymentIntents.retrieve(order.stripePaymentIntentId);
    if (REUSABLE_PI_STATUSES.has(existing.status) && existing.amount === order.totalCents && existing.client_secret) {
      return existing.client_secret;
    }
    if (existing.status === "succeeded" || existing.status === "processing") {
      throw new ShopError("CONFLICT", "This order is already being paid. Check your library in a moment.");
    }
  }

  const stripeCustomerId = await ensureStripeCustomer(customer);
  let intent;
  try {
    intent = await stripe().paymentIntents.create(
      {
        amount: order.totalCents,
        currency: order.currency.toLowerCase(),
        customer: stripeCustomerId,
        automatic_payment_methods: { enabled: true },
        receipt_email: customer.email || undefined,
        description: `DMI Music Shop order ${formatOrderNumber(order.number)}`,
        metadata: {
          shop: "dmi",
          orderId: order.id,
          orderNumber: formatOrderNumber(order.number),
          customerId: customer.id,
        },
      },
      // A replacement intent (previous one canceled/failed) gets its own key.
      { idempotencyKey: `dmi-order-${order.id}-pi-${order.stripePaymentIntentId ?? "initial"}` },
    );
  } catch (e) {
    throw new ShopError("PAYMENT_PROVIDER_ERROR", "Payment could not be initialised. Please try again.", {
      provider: e instanceof Error ? e.name : "unknown",
    });
  }
  await db.order.update({ where: { id: order.id }, data: { stripePaymentIntentId: intent.id } });
  if (!intent.client_secret) throw new ShopError("PAYMENT_PROVIDER_ERROR", "Payment provider returned no client secret");
  return intent.client_secret;
}

async function ensureStripeCustomer(customer: Customer): Promise<string> {
  if (customer.stripeCustomerId) return customer.stripeCustomerId;
  const created = await stripe().customers.create(
    {
      email: customer.email || undefined,
      name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || undefined,
      metadata: { shopCustomerId: customer.id },
    },
    { idempotencyKey: `dmi-customer-${customer.id}` },
  );
  const updated = await shopDb().customer.updateMany({
    where: { id: customer.id, stripeCustomerId: null },
    data: { stripeCustomerId: created.id },
  });
  if (updated.count === 0) {
    const fresh = await shopDb().customer.findUniqueOrThrow({ where: { id: customer.id } });
    return fresh.stripeCustomerId ?? created.id;
  }
  return created.id;
}

/** Customer-facing order status (success page). Reads server state only. */
export async function getOrderForCustomer(orderId: string, customerId: string) {
  const order = await shopDb().order.findFirst({
    where: { id: orderId, customerId },
    select: {
      id: true, number: true, status: true, currency: true, totalCents: true, retailTotalCents: true,
      discountCents: true, refundedCents: true, createdAt: true, paidAt: true, fulfilledAt: true,
      items: {
        orderBy: { position: "asc" },
        select: {
          id: true, itemType: true, titleSnapshot: true, skuSnapshot: true, chargedCents: true, retailValueCents: true,
          bundleItemCount: true, excludedArrangementIds: true, softwareProductId: true,
          targetPlayerId: true, targetPlayerNameSnapshot: true, targetRegistrationMaskedSnapshot: true,
          softwareProduct: { select: { name: true, slug: true } },
          softwareLicense: { select: { id: true, number: true, status: true } },
          allocations: { select: { arrangementId: true, titleSnapshot: true, allocatedCents: true, refundedCents: true, additionalPlayer: true } },
        },
      },
    },
  });
  return order ? { ...order, orderNumber: formatOrderNumber(order.number) } : null;
}

export async function listOrdersForCustomer(customerId: string) {
  const rows = await shopDb().order.findMany({
    where: { customerId, status: { in: ["PAID", "FULFILLED", "PARTIALLY_REFUNDED", "REFUNDED"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, number: true, status: true, currency: true, totalCents: true, refundedCents: true, createdAt: true,
      _count: { select: { allocations: true, items: { where: { itemType: "SOFTWARE_LICENSE" } } } },
    },
  });
  return rows.map((r) => ({
    ...r,
    orderNumber: formatOrderNumber(r.number),
    arrangementCount: r._count.allocations,
    softwareLicenseCount: r._count.items,
  }));
}

export const checkoutConfig = {
  get publishableKey() {
    return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  },
  get returnUrlBase() {
    return shopConfig.appBaseUrl;
  },
};
