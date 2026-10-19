import Stripe from "stripe";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as preparePOST } from "@/app/api/shop/checkout/prepare/route";
import { POST as webhookPOST } from "@/app/api/stripe/webhook/route";
import { GET as orderGET } from "@/app/api/shop/orders/[id]/route";
import { shopDb } from "@/modules/shop/db";
import { addToCart, getPricedCart } from "@/modules/shop/services/cart";
import { prepareCheckout } from "@/modules/shop/services/checkout";
import { activeEntitlementArrangementIds, adminGrantEntitlement } from "@/modules/shop/services/entitlements";
import { fulfillPaymentIntent } from "@/modules/shop/services/fulfillment";
import {
  fakeStripe, makeArrangement, makeBundle, makeBuyer, makeStaff, resetDb, signInAs, succeededEvent, useMemoryStorage,
} from "../helpers/fixtures";

const stripeLib = new Stripe("sk_test_dummy_for_tests");

function signedWebhook(body: object, secret = "whsec_test_secret") {
  const payload = JSON.stringify(body);
  const header = stripeLib.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("http://localhost:3000/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": header, "content-type": "application/json" },
    body: payload,
  });
}

const prepareReq = () => new Request("http://localhost:3000/api/shop/checkout/prepare", { method: "POST", body: "{}" });
const ctx = <P,>(params: P) => ({ params: Promise.resolve(params) });

let stripeFake: ReturnType<typeof fakeStripe>;

beforeEach(async () => {
  await resetDb();
  useMemoryStorage();
  stripeFake = fakeStripe();
  signInAs(null);
});

describe("checkout preparation", () => {
  it("requires Auth0 sign-in, a verified email and onboarding", async () => {
    expect((await preparePOST(prepareReq(), ctx({}))).status).toBe(401);

    const unverified = await makeBuyer({ verified: false });
    signInAs(unverified.session);
    const r1 = await preparePOST(prepareReq(), ctx({}));
    expect(r1.status).toBe(403);
    expect((await r1.json()).error.code).toBe("EMAIL_NOT_VERIFIED");

    const fresh = await makeBuyer({ onboarded: false });
    signInAs(fresh.session);
    const r2 = await preparePOST(prepareReq(), ctx({}));
    expect((await r2.json()).error.code).toBe("ONBOARDING_REQUIRED");
  });

  it("reprices server-side, snapshots the order and reuses it for identical carts", async () => {
    const { customer, session } = await makeBuyer();
    const { arrangement } = await makeArrangement({ priceCents: 1299 });
    await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "ARRANGEMENT", arrangementId: arrangement.id });
    // A stale client-side price never matters: change the catalog price after adding.
    await shopDb().arrangement.update({ where: { id: arrangement.id }, data: { priceCents: 1499 } });

    signInAs(session);
    const res = await preparePOST(prepareReq(), ctx({}));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.clientSecret).toMatch(/_secret_/);
    expect(body.pricing.totalCents).toBe(1499);

    const order = await shopDb().order.findUniqueOrThrow({ where: { id: body.orderId }, include: { allocations: true } });
    expect(order).toMatchObject({ status: "PENDING_PAYMENT", totalCents: 1499, currency: "EUR" });
    expect(order.allocations).toHaveLength(1);
    expect(order.allocations[0]).toMatchObject({ allocatedCents: 1499, royaltyRateBps: 2500, royaltyCents: 374 });
    const createCall = stripeFake.calls.find((c) => c.method === "paymentIntents.create")!;
    expect(createCall.args[0]).toMatchObject({ amount: 1499, currency: "eur", metadata: { orderId: order.id, customerId: customer.id } });

    // Same cart → same order + intent.
    const again = await (await preparePOST(prepareReq(), ctx({}))).json();
    expect(again.orderId).toBe(body.orderId);
    expect(stripeFake.calls.filter((c) => c.method === "paymentIntents.create")).toHaveLength(1);
  });

  it("refuses an empty cart and a cart whose items are all owned", async () => {
    const { customer, session } = await makeBuyer();
    signInAs(session);
    expect((await (await preparePOST(prepareReq(), ctx({}))).json()).error.code).toBe("CART_EMPTY");

    const { arrangement } = await makeArrangement({ priceCents: 500 });
    await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const { staff } = await makeStaff();
    await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: arrangement.id, reason: "gift" });
    expect((await (await preparePOST(prepareReq(), ctx({}))).json()).error.code).toBe("CART_EMPTY");
  });
});

describe("Stripe webhook", () => {
  it("rejects missing or invalid signatures", async () => {
    const noSig = new Request("http://localhost:3000/api/stripe/webhook", { method: "POST", body: "{}" });
    expect((await webhookPOST(noSig)).status).toBe(400);
    expect((await webhookPOST(signedWebhook({ id: "evt_x", type: "ping" }, "whsec_wrong"))).status).toBe(400);
  });

  it("fulfills a paid order exactly once and the success API only reads state", async () => {
    const { customer, session } = await makeBuyer();
    const a = await makeArrangement({ priceCents: 1000 });
    const b = await makeArrangement({ priceCents: 2000 });
    const bundle = await makeBundle({ priceCents: 2400, arrangementIds: [a.arrangement.id, b.arrangement.id] });
    await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "BUNDLE", bundleId: bundle.id });
    const prepared = await prepareCheckout(customer);
    const pi = [...stripeFake.intents.values()][0]!;

    // Before the webhook: browser return pages see a pending order, nothing granted.
    signInAs(session);
    const before = await (await orderGET(new Request("http://x"), ctx({ id: prepared.orderId }))).json();
    expect(before.fulfilled).toBe(false);
    expect(await activeEntitlementArrangementIds(customer.id)).toEqual(new Set());

    const event = succeededEvent(pi);
    const r1 = await webhookPOST(signedWebhook(event));
    expect(await r1.json()).toEqual({ received: true, duplicate: false });
    const r2 = await webhookPOST(signedWebhook(event)); // replay
    expect(await r2.json()).toEqual({ received: true, duplicate: true });
    // Same payment, new event id: still idempotent.
    await webhookPOST(signedWebhook(succeededEvent(pi)));

    const order = await shopDb().order.findUniqueOrThrow({ where: { id: prepared.orderId } });
    expect(order.status).toBe("FULFILLED");
    const sources = await shopDb().entitlementSource.findMany({ include: { entitlement: true } });
    expect(sources).toHaveLength(2);
    expect(sources.every((s) => s.sourceType === "BUNDLE")).toBe(true);
    expect(await shopDb().royaltyLedgerEntry.count()).toBe(2);
    expect(await shopDb().stripeEvent.count()).toBe(2);
    expect(await activeEntitlementArrangementIds(customer.id)).toEqual(new Set([a.arrangement.id, b.arrangement.id]));

    const after = await (await orderGET(new Request("http://x"), ctx({ id: prepared.orderId }))).json();
    expect(after.fulfilled).toBe(true);
    // Cart was cleared of what was bought.
    expect((await getPricedCart({ customerId: customer.id, anonymousToken: null })).itemCount).toBe(0);
  });

  it("charges only the missing items when completing a partly-owned collection", async () => {
    const { customer } = await makeBuyer();
    const { staff } = await makeStaff();
    const items = await Promise.all([1000, 1500, 2500].map((p) => makeArrangement({ priceCents: p })));
    const ids = items.map((i) => i.arrangement.id);
    const bundle = await makeBundle({ priceCents: 3000, arrangementIds: ids });
    await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: ids[2]!, reason: "already had it" });

    await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "BUNDLE", bundleId: bundle.id });
    const prepared = await prepareCheckout(customer);
    expect(prepared.pricing.totalCents).toBe(1500); // 600 + 900

    const pi = [...stripeFake.intents.values()][0]!;
    await fulfillPaymentIntent({ ...pi, amount_received: pi.amount, latest_charge: "ch_1", status: "succeeded" } as never);
    const order = await shopDb().order.findUniqueOrThrow({
      where: { id: prepared.orderId },
      include: { items: true, allocations: true },
    });
    expect(order.items[0]).toMatchObject({ bundlePriceCents: 3000, bundleRetailTotalCents: 5000, excludedArrangementIds: [ids[2]] });
    expect(order.allocations.map((a) => a.allocatedCents).sort((x, y) => x - y)).toEqual([600, 900]);

    // Later bundle edits never change the historical snapshot.
    await shopDb().bundle.update({ where: { id: bundle.id }, data: { priceCents: 100 } });
    const again = await shopDb().orderItemAllocation.findMany({ where: { orderId: prepared.orderId } });
    expect(again.map((a) => a.allocatedCents).sort((x, y) => x - y)).toEqual([600, 900]);
  });

  it("never grants when the paid amount does not match the snapshot", async () => {
    const { customer } = await makeBuyer();
    const { arrangement } = await makeArrangement({ priceCents: 1000 });
    await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "ARRANGEMENT", arrangementId: arrangement.id });
    await prepareCheckout(customer);
    const pi = [...stripeFake.intents.values()][0]!;
    const result = await fulfillPaymentIntent({ ...pi, amount_received: 1, latest_charge: null, status: "succeeded" } as never);
    expect(result).toMatchObject({ fulfilled: false, reason: "AMOUNT_MISMATCH" });
    expect(await shopDb().entitlement.count()).toBe(0);
    expect(await shopDb().auditLog.count({ where: { action: "order.fulfillment_blocked" } })).toBe(1);
  });

  it("does not let one customer read another customer's order", async () => {
    const owner = await makeBuyer();
    const { arrangement } = await makeArrangement({ priceCents: 1000 });
    await addToCart({ customerId: owner.customer.id, anonymousToken: null }, { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const prepared = await prepareCheckout(owner.customer);

    const intruder = await makeBuyer();
    signInAs(intruder.session);
    const res = await orderGET(new Request("http://x"), ctx({ id: prepared.orderId }));
    expect(res.status).toBe(404);
  });
});
