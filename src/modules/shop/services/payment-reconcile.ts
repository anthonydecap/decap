import "server-only";
import { shopDb } from "../db";
import { audit } from "./audit";
import { fulfillPaymentIntent } from "./fulfillment";
import { stripe } from "./stripe";

export type ReconcileResult = "FULFILLED" | "PROCESSING" | "UNPAID" | "SKIPPED";

/**
 * Asks Stripe (server to server, never the browser) whether an unfinished order was paid,
 * and fulfills it if so. The webhook stays the normal path; this is the safety net for a
 * missed or delayed webhook, so a paid order is never left pending or cancelled.
 * Idempotent: fulfillment itself is keyed on the order and its allocations.
 */
export async function reconcileOrderPayment(orderId: string): Promise<ReconcileResult> {
  const db = shopDb();
  const order = await db.order.findUnique({ where: { id: orderId }, select: { id: true, status: true, stripePaymentIntentId: true } });
  if (!order?.stripePaymentIntentId || !["PENDING_PAYMENT", "CANCELED"].includes(order.status)) return "SKIPPED";
  const pi = await stripe().paymentIntents.retrieve(order.stripePaymentIntentId);
  if (pi.status === "processing") return "PROCESSING";
  if (pi.status !== "succeeded") return "UNPAID";
  if (order.status === "CANCELED") {
    // Cancelled locally while Stripe had already taken the money: the payment wins.
    await db.order.update({ where: { id: order.id }, data: { status: "PENDING_PAYMENT", canceledAt: null } });
  }
  await fulfillPaymentIntent({ ...pi, metadata: { ...pi.metadata, orderId: order.id } });
  await audit({ type: "SYSTEM" }, "payment.reconciled", { type: "Order", id: order.id }, { paymentIntentId: pi.id, wasCanceled: order.status === "CANCELED" });
  return "FULFILLED";
}

/** Reconciles every unfinished order of a customer that has a PaymentIntent. */
export async function reconcileCustomerOrders(customerId: string) {
  const orders = await shopDb().order.findMany({
    where: { customerId, status: { in: ["PENDING_PAYMENT", "CANCELED"] }, stripePaymentIntentId: { not: null }, paidAt: null },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const results = new Map<string, ReconcileResult | "ERROR">();
  for (const o of orders) results.set(o.id, await reconcileOrderPayment(o.id).catch(() => "ERROR" as const));
  return results;
}
