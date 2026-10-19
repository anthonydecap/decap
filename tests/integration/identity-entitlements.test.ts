import { beforeEach, describe, expect, it } from "vitest";
import { shopDb } from "@/modules/shop/db";
import { checkoutReadiness, getCurrentCustomer, requireStaff, upsertCustomerFromSession } from "@/modules/shop/auth/session";
import {
  activeEntitlementArrangementIds, adminGrantEntitlement, adminRevokeEntitlementSource, customerLibrary, grantEntitlementSource,
} from "@/modules/shop/services/entitlements";
import { makeArrangement, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";

beforeEach(async () => {
  await resetDb();
  useMemoryStorage();
  signInAs(null);
});

describe("Auth0 identity mapping", () => {
  it("creates one Customer per Auth0 sub and never keys on email", async () => {
    const first = await upsertCustomerFromSession({ sub: "auth0|abc", email: "Pia@Example.test", email_verified: false });
    expect(first.email).toBe("pia@example.test");
    // Same sub, changed email + verified → same row, profile synced.
    const again = await upsertCustomerFromSession({ sub: "auth0|abc", email: "new@example.test", email_verified: true });
    expect(again.id).toBe(first.id);
    expect(again).toMatchObject({ email: "new@example.test", emailVerified: true });
    // Different sub with the old email → a different customer.
    const other = await upsertCustomerFromSession({ sub: "google-oauth2|zzz", email: "pia@example.test", email_verified: true });
    expect(other.id).not.toBe(first.id);
    expect(await shopDb().customer.count()).toBe(2);
  });

  it("resolves the current customer from the session", async () => {
    signInAs({ sub: "auth0|me", email: "me@example.test", email_verified: true });
    expect((await getCurrentCustomer())?.authSubject).toBe("auth0|me");
    signInAs(null);
    expect(await getCurrentCustomer()).toBeNull();
  });

  it("requires a verified email and current legal acceptance for checkout", async () => {
    const { customer: unverified } = await makeCustomer({ verified: false });
    expect(await checkoutReadiness(unverified)).toEqual({ ready: false, reason: "EMAIL_NOT_VERIFIED" });
    const { customer: fresh } = await makeCustomer({ onboarded: false });
    expect(await checkoutReadiness(fresh)).toEqual({ ready: false, reason: "ONBOARDING_REQUIRED" });
    const { customer: ready } = await makeCustomer();
    expect(await checkoutReadiness(ready)).toEqual({ ready: true });
  });

  it("authorizes staff from the local StaffAccount, not from the session alone", async () => {
    const { session: customerSession } = await makeCustomer();
    signInAs(customerSession);
    await expect(requireStaff()).rejects.toMatchObject({ code: "FORBIDDEN" });

    const { session, staff } = await makeStaff("CATALOG_MANAGER");
    signInAs(session);
    await expect(requireStaff("catalog:write")).resolves.toMatchObject({ staff: { id: staff.id } });
    await expect(requireStaff("orders:refund")).rejects.toMatchObject({ code: "FORBIDDEN" });

    // Both non-active statuses must deny, not just the permanent one.
    await shopDb().staffAccount.update({ where: { id: staff.id }, data: { status: "SUSPENDED" } });
    await expect(requireStaff()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await shopDb().staffAccount.update({ where: { id: staff.id }, data: { status: "DISABLED" } });
    await expect(requireStaff()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("Entitlement / EntitlementSource behaviour", () => {
  it("keeps one entitlement per customer+arrangement with many sources", async () => {
    const { customer } = await makeCustomer();
    const { arrangement } = await makeArrangement({ priceCents: 999 });
    const { staff } = await makeStaff();

    await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: arrangement.id, reason: "Competition prize" });
    await shopDb().$transaction((tx) =>
      grantEntitlementSource(tx, { customerId: customer.id, arrangementId: arrangement.id, sourceType: "LEGACY_IMPORT", sourceReference: "legacy:42" }),
    );

    const ents = await shopDb().entitlement.findMany({ where: { customerId: customer.id }, include: { sources: true } });
    expect(ents).toHaveLength(1);
    expect(ents[0]!.sources.map((s) => s.sourceType).sort()).toEqual(["ADMIN_GRANT", "LEGACY_IMPORT"]);
    // An admin grant is not a fake order.
    expect(await shopDb().order.count()).toBe(0);
  });

  it("stays ACTIVE while one valid source remains and becomes REVOKED after the last one", async () => {
    const { customer } = await makeCustomer();
    const { arrangement } = await makeArrangement({ priceCents: 999 });
    const { staff } = await makeStaff();
    const g1 = await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: arrangement.id, reason: "gift one" });
    const g2 = await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: arrangement.id, reason: "gift two" });

    const afterFirst = await adminRevokeEntitlementSource({ staffId: staff.id, sourceId: g1.source.id, reason: "mistake" });
    expect(afterFirst.status).toBe("ACTIVE");
    expect(await activeEntitlementArrangementIds(customer.id)).toEqual(new Set([arrangement.id]));

    const afterSecond = await adminRevokeEntitlementSource({ staffId: staff.id, sourceId: g2.source.id, reason: "mistake" });
    expect(afterSecond.status).toBe("REVOKED");
    expect(await customerLibrary(customer.id)).toEqual([]);

    // Re-granting reactivates the same row.
    await adminGrantEntitlement({ staffId: staff.id, customerId: customer.id, arrangementId: arrangement.id, reason: "again" });
    const lib = await customerLibrary(customer.id);
    expect(lib).toHaveLength(1);
    expect(await shopDb().auditLog.count({ where: { action: { startsWith: "entitlement." } } })).toBe(5);
  });
});
