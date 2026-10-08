import { beforeEach, describe, expect, it } from "vitest";
import { POST as refundPOST } from "@/app/api/admin/shop/orders/[id]/refund/route";
import { shopDb } from "@/modules/shop/db";
import { addToCart } from "@/modules/shop/services/cart";
import { prepareCheckout } from "@/modules/shop/services/checkout";
import { activeEntitlementArrangementIds, adminGrantEntitlement } from "@/modules/shop/services/entitlements";
import { fulfillPaymentIntent } from "@/modules/shop/services/fulfillment";
import { createRefund } from "@/modules/shop/services/refunds";
import { fakeStripe, makeArrangement, makeBundle, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";

let stripeFake: ReturnType<typeof fakeStripe>;

beforeEach(async () => {
  await resetDb();
  useMemoryStorage();
  stripeFake = fakeStripe();
  signInAs(null);
});

async function paidBundleOrder() {
  const { customer } = await makeCustomer();
  const a = await makeArrangement({ priceCents: 1000, royaltyRateBps: 3000 });
  const b = await makeArrangement({ priceCents: 1000, royaltyRateBps: 3000 });
  const bundle = await makeBundle({ priceCents: 1600, arrangementIds: [a.arrangement.id, b.arrangement.id] });
  await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "BUNDLE", bundleId: bundle.id });
  const prepared = await prepareCheckout(customer);
  const pi = [...stripeFake.intents.values()].at(-1)!;
  await fulfillPaymentIntent({ ...pi, amount_received: pi.amount, latest_charge: "ch_1", status: "succeeded" } as never);
  return { customer, a: a.arrangement, b: b.arrangement, orderId: prepared.orderId };
}

describe("refunds", () => {
  it("revokes only the refunded allocation's source and books negative royalties", async () => {
    const { customer, a, b, orderId } = await paidBundleOrder();
    const { staff } = await makeStaff("FINANCE");
    const allocA = await shopDb().orderItemAllocation.findFirstOrThrow({ where: { orderId, arrangementId: a.id } });

    const refund = await createRefund({ staffId: staff.id, orderId, allocationIds: [allocA.id], reason: "Wrong title" });
    expect(refund).toMatchObject({ status: "SUCCEEDED", amountCents: 800 });

    expect(await activeEntitlementArrangementIds(customer.id)).toEqual(new Set([b.id]));
    const order = await shopDb().order.findUniqueOrThrow({ where: { id: orderId } });
    expect(order).toMatchObject({ status: "PARTIALLY_REFUNDED", refundedCents: 800 });

    const ledger = await shopDb().royaltyLedgerEntry.findMany({ where: { allocationId: allocA.id }, orderBy: { occurredAt: "asc" } });
    expect(ledger.map((l) => [l.entryType, l.amountCents])).toEqual([["SALE", 240], ["REFUND", -240]]);

    // History is never deleted.
    expect(await shopDb().orderItemAllocation.count({ where: { orderId } })).toBe(2);
    expect(stripeFake.calls.find((c) => c.method === "refunds.create")!.args[0]).toMatchObject({ amount: 800 });
  });

  it("keeps an entitlement ACTIVE when another valid source remains", async () => {
    const { customer, a, orderId } = await paidBundleOrder();
    const { staff } = await makeStaff("ADMIN");
    await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: a.id, reason: "Promotional copy" });

    await createRefund({ staffId: staff.id, orderId, reason: "Full refund requested" });
    expect(await activeEntitlementArrangementIds(customer.id)).toEqual(new Set([a.id]));
    const order = await shopDb().order.findUniqueOrThrow({ where: { id: orderId } });
    expect(order).toMatchObject({ status: "REFUNDED", refundedCents: 1600 });
    // Nothing left to refund.
    await expect(createRefund({ staffId: staff.id, orderId, reason: "again" })).rejects.toMatchObject({ code: "INVALID_STATE" });
  });

  it("only staff with the refund permission can refund through the API", async () => {
    const { orderId } = await paidBundleOrder();
    const req = () => new Request(`http://localhost:3000/api/admin/shop/orders/${orderId}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason: "customer asked" }),
    });
    const params = { params: Promise.resolve({ id: orderId }) };

    const catalogManager = await makeStaff("CATALOG_MANAGER");
    signInAs(catalogManager.session);
    expect((await refundPOST(req(), params)).status).toBe(403);

    const { session: customerSession } = await makeCustomer();
    signInAs(customerSession);
    expect((await refundPOST(req(), params)).status).toBe(403);

    const finance = await makeStaff("FINANCE");
    signInAs(finance.session);
    const ok = await refundPOST(req(), params);
    expect(ok.status).toBe(200);
    expect((await ok.json()).status).toBe("SUCCEEDED");
  });
});
