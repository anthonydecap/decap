import { beforeEach, describe, expect, it } from "vitest";
import { shopDb } from "@/modules/shop/db";
import { requireStaff, roleHasPermission } from "@/modules/shop/auth/session";
import {
  changeStaffRole,
  changeStaffStatus,
  listStaff,
  promoteToStaff,
  searchPromotionCandidates,
} from "@/modules/shop/services/staff";
import { makeCustomer, makeStaff, resetDb, signInAs } from "../helpers/fixtures";

beforeEach(async () => {
  await resetDb();
  signInAs(null);
});

describe("Promoting a customer to staff", () => {
  it("grants access without touching the customer record", async () => {
    const { staff: superAdmin } = await makeStaff("SUPER_ADMIN");
    const { customer } = await makeCustomer({ email: "pia@example.test" });

    const created = await promoteToStaff({
      actorStaffId: superAdmin.id,
      authSubject: customer.authSubject,
      role: "SUPPORT",
    });

    expect(created).toMatchObject({ role: "SUPPORT", status: "ACTIVE", createdByStaffId: superAdmin.id });
    // The same person, both records, one identity.
    expect(created.authSubject).toBe(customer.authSubject);
    const after = await shopDb().customer.findUniqueOrThrow({ where: { id: customer.id } });
    expect(after).toMatchObject({ email: "pia@example.test", authSubject: customer.authSubject });
    expect(await shopDb().customer.count()).toBe(1);
  });

  it("refuses a second staff account for the same identity", async () => {
    const { staff: superAdmin } = await makeStaff("SUPER_ADMIN");
    const { customer } = await makeCustomer();
    await promoteToStaff({ actorStaffId: superAdmin.id, authSubject: customer.authSubject, role: "ADMIN" });
    await expect(
      promoteToStaff({ actorStaffId: superAdmin.id, authSubject: customer.authSubject, role: "SUPPORT" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("leaves people who are already staff out of the candidate search", async () => {
    const { staff: superAdmin } = await makeStaff("SUPER_ADMIN");
    const { customer: a } = await makeCustomer({ email: "ada@example.test" });
    const { customer: b } = await makeCustomer({ email: "adam@example.test" });
    expect((await searchPromotionCandidates("ad")).map((c) => c.id).sort()).toEqual([a.id, b.id].sort());

    await promoteToStaff({ actorStaffId: superAdmin.id, authSubject: a.authSubject, role: "SUPPORT" });
    expect((await searchPromotionCandidates("ad")).map((c) => c.id)).toEqual([b.id]);
  });

  it("records who granted the access", async () => {
    const { staff: superAdmin } = await makeStaff("SUPER_ADMIN");
    const { customer } = await makeCustomer();
    await promoteToStaff({ actorStaffId: superAdmin.id, authSubject: customer.authSubject, role: "ADMIN" });
    const rows = await listStaff();
    const promoted = rows.find((r) => r.authSubject === customer.authSubject);
    expect(promoted?.createdByName).toBe(superAdmin.email);
    const entry = await shopDb().auditLog.findFirst({ where: { action: "staff.promoted" } });
    expect(entry).toMatchObject({ actorType: "STAFF", actorStaffId: superAdmin.id });
  });
});

describe("Changing a staff account", () => {
  it("refuses to change your own role or access", async () => {
    const { staff } = await makeStaff("SUPER_ADMIN");
    await expect(changeStaffRole({ actorStaffId: staff.id, staffId: staff.id, role: "SUPPORT" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      changeStaffStatus({ actorStaffId: staff.id, staffId: staff.id, status: "DISABLED" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps at least one active super admin", async () => {
    const { staff: first } = await makeStaff("SUPER_ADMIN");
    const { staff: second } = await makeStaff("SUPER_ADMIN");
    // Two active super admins: demoting one is allowed.
    await changeStaffRole({ actorStaffId: first.id, staffId: second.id, role: "ADMIN" });

    // Now `first` is the only one left, and nobody may demote or suspend them.
    const { staff: admin } = await makeStaff("ADMIN");
    await expect(changeStaffRole({ actorStaffId: admin.id, staffId: first.id, role: "ADMIN" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    await expect(
      changeStaffStatus({ actorStaffId: admin.id, staffId: first.id, status: "SUSPENDED" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });

    const unchanged = await shopDb().staffAccount.findUniqueOrThrow({ where: { id: first.id } });
    expect(unchanged).toMatchObject({ role: "SUPER_ADMIN", status: "ACTIVE" });
  });

  it("suspends and reinstates, and denies admin access while suspended", async () => {
    const { staff: superAdmin } = await makeStaff("SUPER_ADMIN");
    const { staff: target, session } = await makeStaff("ADMIN");

    signInAs(session);
    await expect(requireStaff("orders:read")).resolves.toMatchObject({ staff: { id: target.id } });

    await changeStaffStatus({ actorStaffId: superAdmin.id, staffId: target.id, status: "SUSPENDED", reason: "Leave" });
    await expect(requireStaff()).rejects.toMatchObject({ code: "FORBIDDEN" });

    await changeStaffStatus({ actorStaffId: superAdmin.id, staffId: target.id, status: "ACTIVE" });
    await expect(requireStaff()).resolves.toMatchObject({ staff: { id: target.id } });

    const entries = await shopDb().auditLog.findMany({ where: { action: "staff.status_changed" }, orderBy: { createdAt: "asc" } });
    expect(entries).toHaveLength(2);
    expect(entries[0]?.metadata).toMatchObject({ from: "ACTIVE", to: "SUSPENDED", reason: "Leave" });
  });
});

describe("Role capabilities", () => {
  it("gives SUPER_ADMIN everything and keeps staff management to them alone", () => {
    expect(roleHasPermission("SUPER_ADMIN", "staff:manage")).toBe(true);
    expect(roleHasPermission("SUPER_ADMIN", "players:transfer")).toBe(true);
    for (const role of ["ADMIN", "SUPPORT", "CATALOG_MANAGER", "FINANCE"] as const) {
      expect(roleHasPermission(role, "staff:manage")).toBe(false);
      expect(roleHasPermission(role, "players:transfer")).toBe(false);
    }
  });

  it("never hands an activation key to catalog or finance", () => {
    expect(roleHasPermission("CATALOG_MANAGER", "players:activation-key")).toBe(false);
    expect(roleHasPermission("FINANCE", "players:activation-key")).toBe(false);
    expect(roleHasPermission("SUPPORT", "players:activation-key")).toBe(true);
    expect(roleHasPermission("ADMIN", "players:activation-key")).toBe(true);
  });

  it("lets support read orders but never refund them", () => {
    expect(roleHasPermission("SUPPORT", "orders:read")).toBe(true);
    expect(roleHasPermission("SUPPORT", "orders:refund")).toBe(false);
    expect(roleHasPermission("SUPPORT", "catalog:write")).toBe(false);
  });
});
