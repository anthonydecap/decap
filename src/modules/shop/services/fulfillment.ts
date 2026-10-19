import "server-only";
import type Stripe from "stripe";
import { shopConfig } from "../config";
import { shopDb, type ShopTx } from "../db";
import { audit } from "./audit";
import { clearPurchasedFromCart } from "./cart";
import { formatOrderNumber } from "./checkout";
import { recordActivity } from "./crm";
import { createLicensesForOrder, notifyLicensesPurchased } from "./software-licensing";
import { grantEntitlementSource } from "./entitlements";
import { createLicenseForAllocation } from "./music-licenses";
import { getMailer } from "./mailer";
import { applyRefund, syncRefundFromStripe } from "./refunds";

/**
 * Stripe webhook processing. The webhook is the only authority for paid fulfillment;
 * browser redirects never grant anything.
 *
 * Idempotency: every event id is recorded in StripeEvent; an event that was already
 * processed is acknowledged without side effects. Fulfillment itself is also idempotent
 * (order row lock + status check + unique EntitlementSource per allocation + unique ledger
 * idempotency keys), so a replay under a *new* event id is harmless too.
 */
export async function handleStripeEvent(event: Stripe.Event): Promise<{ duplicate: boolean }> {
  const db = shopDb();
  const existing = await db.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing?.processedAt) return { duplicate: true };
  if (!existing) {
    try {
      await db.stripeEvent.create({ data: { id: event.id, type: event.type, livemode: event.livemode } });
    } catch {
      // Another delivery of the same event raced us; let that one finish.
      const again = await db.stripeEvent.findUnique({ where: { id: event.id } });
      if (again?.processedAt) return { duplicate: true };
    }
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await fulfillPaymentIntent(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const orderId = pi.metadata?.orderId;
        if (orderId) {
          await audit({ type: "STRIPE" }, "payment.failed", { type: "Order", id: orderId }, {
            code: pi.last_payment_error?.code ?? null,
          });
        }
        break; // Order stays PENDING_PAYMENT so the customer can retry with another method.
      }
      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await db.order.updateMany({
          where: { stripePaymentIntentId: pi.id, status: "PENDING_PAYMENT" },
          data: { status: "CANCELED", canceledAt: new Date() },
        });
        break;
      }
      case "refund.created":
      case "refund.updated":
      case "refund.failed":
        await syncRefundFromStripe(event.data.object as Stripe.Refund);
        break;
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        for (const r of charge.refunds?.data ?? []) await syncRefundFromStripe(r);
        break;
      }
      default:
        break;
    }
    await db.stripeEvent.update({ where: { id: event.id }, data: { processedAt: new Date(), errorMessage: null } });
    return { duplicate: false };
  } catch (e) {
    await db.stripeEvent.update({
      where: { id: event.id },
      data: { errorMessage: (e instanceof Error ? e.message : "unknown").slice(0, 500) },
    }).catch(() => undefined);
    throw e;
  }
}

type LockedOrder = { id: string; number: number; status: string; totalCents: number; currency: string; customerId: string };
const orderNumber = (o: LockedOrder) => o.number;

export async function fulfillPaymentIntent(pi: Pick<Stripe.PaymentIntent, "id" | "amount_received" | "currency" | "metadata" | "latest_charge" | "status">) {
  const db = shopDb();
  const orderId = pi.metadata?.orderId
    ?? (await db.order.findUnique({ where: { stripePaymentIntentId: pi.id }, select: { id: true } }))?.id;
  if (!orderId) {
    await audit({ type: "STRIPE" }, "payment.unmatched", { type: "PaymentIntent", id: pi.id });
    return { fulfilled: false as const, reason: "UNMATCHED" };
  }

  const result = await db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<LockedOrder[]>`
      SELECT "id", "number", "status"::text AS "status", "totalCents", "currency", "customerId"
      FROM "Order" WHERE "id" = ${orderId}::uuid FOR UPDATE`;
    const order = rows[0];
    if (!order) return { fulfilled: false as const, reason: "ORDER_NOT_FOUND" };
    if (["FULFILLED", "PARTIALLY_REFUNDED", "REFUNDED"].includes(order.status)) {
      return { fulfilled: false as const, reason: "ALREADY_FULFILLED" };
    }

    const chargeId = typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id ?? null;
    if (pi.amount_received !== order.totalCents || pi.currency.toUpperCase() !== order.currency) {
      // Money was taken but does not match the snapshot: never auto-grant; flag for staff.
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: pi.id, stripeChargeId: chargeId },
      });
      await audit({ type: "STRIPE" }, "order.fulfillment_blocked", { type: "Order", id: order.id }, {
        reason: "AMOUNT_MISMATCH", expected: order.totalCents, received: pi.amount_received,
      }, tx);
      return { fulfilled: false as const, reason: "AMOUNT_MISMATCH" };
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: pi.id, stripeChargeId: chargeId },
    });
    return fulfillLockedOrder(tx, order, { paymentIntentId: pi.id });
  });

  await afterFulfillment(orderId, result);
  return result;
}

/** A zero-total order (free music): same fulfillment, no payment provider involved. */
export async function fulfillFreeOrder(orderId: string) {
  const result = await shopDb().$transaction(async (tx) => {
    const rows = await tx.$queryRaw<LockedOrder[]>`
      SELECT "id", "number", "status"::text AS "status", "totalCents", "currency", "customerId"
      FROM "Order" WHERE "id" = ${orderId}::uuid FOR UPDATE`;
    const order = rows[0];
    if (!order) return { fulfilled: false as const, reason: "ORDER_NOT_FOUND" };
    if (order.status !== "PENDING_PAYMENT") return { fulfilled: false as const, reason: "ALREADY_FULFILLED" };
    if (order.totalCents !== 0) throw new Error("fulfillFreeOrder called for a paid order");
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID", paidAt: new Date() } });
    return fulfillLockedOrder(tx, order, { paymentIntentId: null });
  });
  await afterFulfillment(orderId, result);
  return result;
}

/**
 * Grants everything a paid order bought, inside the caller's transaction with the order row
 * locked: EntitlementSource (acquisition history) + MusicLicense for the target player (the
 * playback right) per allocation, royalty ledger, software licenses, timeline. Idempotent:
 * every write is keyed on the allocation / order line.
 */
async function fulfillLockedOrder(tx: ShopTx, order: LockedOrder, meta: { paymentIntentId: string | null }) {
    const allocations = await tx.orderItemAllocation.findMany({
      where: { orderId: order.id },
      include: { orderItem: { select: { itemType: true, bundleId: true, arrangementId: true, targetPlayerId: true, targetPlayerNameSnapshot: true } } },
    });

    for (const a of allocations) {
      const { entitlement, source } = await grantEntitlementSource(tx, {
        customerId: order.customerId,
        arrangementId: a.arrangementId,
        sourceType: a.orderItem.itemType === "BUNDLE" ? "BUNDLE" : "PURCHASE",
        orderAllocationId: a.id,
        sourceReference: a.orderItem.bundleId ? `bundle:${a.orderItem.bundleId}` : null,
      });
      await createLicenseForAllocation(tx, {
        customerId: order.customerId,
        currency: order.currency,
        orderId: order.id,
        allocation: a,
        orderItem: a.orderItem,
        entitlementId: entitlement.id,
        entitlementSourceId: source.id,
      });
    }

    await tx.royaltyLedgerEntry.createMany({
      data: allocations.map((a) => ({
        arrangerId: a.arrangerId,
        arrangementId: a.arrangementId,
        orderId: order.id,
        allocationId: a.id,
        entryType: "SALE" as const,
        amountCents: a.royaltyCents,
        netRevenueCents: a.allocatedCents,
        currency: order.currency,
        basisSnapshot: a.royaltyBasis,
        rateBpsSnapshot: a.royaltyRateBps,
        idempotencyKey: `sale:${a.id}`,
      })),
      skipDuplicates: true,
    });

    const licenses = await createLicensesForOrder(tx, order);
    await tx.order.update({ where: { id: order.id }, data: { status: "FULFILLED", fulfilledAt: new Date() } });
    await tx.customer.updateMany({
      where: { id: order.customerId, crmStatus: { in: ["PROSPECT", "CUSTOMER", "INACTIVE"] } },
      data: { crmStatus: "ACTIVE" },
    });
    // "Music purchased for Living Room Piano": one readable line per order.
    const players = [...new Set(allocations.map((a) => a.orderItem.targetPlayerNameSnapshot ?? "a player chosen later"))];
    await recordActivity({
      tx,
      customerId: order.customerId,
      type: "order.paid",
      summary: `${order.totalCents === 0 ? "Claimed free" : "Paid"} order ${formatOrderNumber(Number(orderNumber(order)))}${allocations.length ? ` (${allocations.length} arrangement${allocations.length === 1 ? "" : "s"} for ${players.join(", ")})` : ""}`,
      metadata: { orderId: order.id, totalCents: order.totalCents, currency: order.currency },
    });
    await audit({ type: meta.paymentIntentId ? "STRIPE" : "SYSTEM" }, "order.fulfilled", { type: "Order", id: order.id }, {
      paymentIntentId: meta.paymentIntentId, allocationCount: allocations.length,
    }, tx);

    const items = await tx.orderItem.findMany({
      where: { orderId: order.id },
      select: { arrangementId: true, bundleId: true, softwareProductId: true, targetPlayerId: true },
    });
    return {
      fulfilled: true as const,
      customerId: order.customerId,
      purchased: items,
      licenses,
    };
}

async function afterFulfillment(
  orderId: string,
  result: { fulfilled: true; customerId: string; purchased: Parameters<typeof clearPurchasedFromCart>[1]; licenses: Awaited<ReturnType<typeof createLicensesForOrder>> } | { fulfilled: false; reason: string },
) {
  if (result.fulfilled) {
    await clearPurchasedFromCart(result.customerId, result.purchased).catch(() => undefined);
    await notifyLicensesPurchased(result.customerId, result.licenses).catch(() => undefined);
    await sendReceipt(orderId).catch(() => undefined);
  }
}

async function sendReceipt(orderId: string) {
  const db = shopDb();
  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { orderBy: { position: "asc" } } },
  });
  if (order.receiptSentAt) return;
  await getMailer().sendOrderReceipt({
    to: order.customerEmailSnapshot,
    orderNumber: formatOrderNumber(order.number),
    totalCents: order.totalCents,
    currency: order.currency,
    items: order.items.map((i) => ({
      title: i.targetPlayerNameSnapshot ? `${i.titleSnapshot} (for ${i.targetPlayerNameSnapshot})` : i.titleSnapshot,
      chargedCents: i.chargedCents,
    })),
    libraryUrl: `${shopConfig.appBaseUrl}/en/shop/account/music`,
  });
  await db.order.update({ where: { id: orderId }, data: { receiptSentAt: new Date() } });
}

export { applyRefund };
