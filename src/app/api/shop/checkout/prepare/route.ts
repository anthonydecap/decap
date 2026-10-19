import { NextResponse } from "next/server";
import { requireCheckoutReadyCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, route } from "@/modules/shop/http";
import { prepareCheckout } from "@/modules/shop/services/checkout";
import { rateLimit, RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Authenticated (Auth0) + verified email + current legal acceptance → reprice the cart on
 * the server, snapshot a pending Order, return the PaymentIntent client secret.
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCheckoutReadyCustomer();
  const { limit, windowSeconds } = RATE_LIMITS.checkoutPrepare;
  await rateLimit(`checkout:${customer.id}`, limit, windowSeconds);
  const prepared = await prepareCheckout(customer);
  return NextResponse.json({
    orderId: prepared.orderId,
    orderNumber: prepared.orderNumber,
    clientSecret: prepared.clientSecret,
    pricing: prepared.pricing,
    // Zero total: already fulfilled on the server, no payment step.
    free: prepared.free ?? false,
  });
});
