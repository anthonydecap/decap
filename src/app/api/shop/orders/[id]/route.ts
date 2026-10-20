import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { notFound } from "@/modules/shop/errors";
import { route, uuidParam } from "@/modules/shop/http";
import { getOrderForCustomer } from "@/modules/shop/services/checkout";
import { reconcileOrderPayment } from "@/modules/shop/services/payment-reconcile";

export const dynamic = "force-dynamic";

/** Order status for the success page. Scoped to the signed-in customer (no IDOR). */
export const GET = route<{ id: string }>(async (_req, { params }) => {
  const customer = await requireCustomer();
  const { id } = await params;
  let order = await getOrderForCustomer(uuidParam(id), customer.id);
  if (!order) throw notFound("Order");
  // Back from payment but no webhook yet: ask Stripe directly (server side) instead of waiting.
  if (order.status === "PENDING_PAYMENT") {
    const r = await reconcileOrderPayment(order.id).catch(() => "SKIPPED");
    if (r === "FULFILLED") order = await getOrderForCustomer(order.id, customer.id);
  }
  if (!order) throw notFound("Order");
  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalCents: order.totalCents,
    currency: order.currency,
    fulfilled: order.status === "FULFILLED" || order.status === "PARTIALLY_REFUNDED",
  });
});
