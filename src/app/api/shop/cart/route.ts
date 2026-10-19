import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, cartIdentity, clientIp, parseJson, route } from "@/modules/shop/http";
import { cartAddSchema, cartRemoveSchema, cartTargetSchema } from "@/modules/shop/schemas";
import { addToCart, CART_COOKIE, getPricedCart, mergeAnonymousCart, removeFromCart, setCartItemTarget } from "@/modules/shop/services/cart";
import { rateLimit, RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/** Signed-in customers absorb any anonymous cart from before they logged in. */
async function identity(create: boolean) {
  const customer = await getCurrentCustomer();
  if (customer) {
    const jar = await cookies();
    const anon = jar.get(CART_COOKIE)?.value;
    if (anon) {
      await mergeAnonymousCart(anon, customer.id);
      jar.delete(CART_COOKIE);
    }
  }
  return { customer, identity: await cartIdentity(customer?.id ?? null, { create }) };
}

export const GET = route(async () => {
  const { identity: id } = await identity(false);
  const cart = await getPricedCart(id);
  return NextResponse.json(cart);
});

export const POST = route(async (req) => {
  assertSameOrigin(req);
  const body = await parseJson(req, cartAddSchema);
  const { customer, identity: id } = await identity(true);
  const { limit, windowSeconds } = RATE_LIMITS.cartMutation;
  await rateLimit(`cart:${customer?.id ?? clientIp(req)}`, limit, windowSeconds);
  await addToCart(id, body);
  return NextResponse.json(await getPricedCart(id));
});

export const DELETE = route(async (req) => {
  assertSameOrigin(req);
  const body = await parseJson(req, cartRemoveSchema);
  const { identity: id } = await identity(false);
  await removeFromCart(id, body.cartItemId);
  return NextResponse.json(await getPricedCart(id));
});

/** "This line is for player P": changes a music line's target while it is still in the cart. */
export const PATCH = route(async (req) => {
  assertSameOrigin(req);
  const body = await parseJson(req, cartTargetSchema);
  const { identity: id } = await identity(false);
  await setCartItemTarget(id, body.cartItemId, body.playerId);
  return NextResponse.json(await getPricedCart(id));
});
