import "server-only";
import type { StaffAccount, StaffRole, StaffStatus } from "@/generated/shop-prisma/client";
import { shopDb } from "../db";
import { ShopError, notFound } from "../errors";
import { audit } from "./audit";

/**
 * Staff administration.
 *
 * Authentication stays with Auth0; this file only decides what an already-authenticated
 * person may do here. Three rules are enforced in the database transaction rather than in
 * the UI, because a hidden button is not a check:
 *
 *  1. The last active SUPER_ADMIN cannot be demoted, suspended or disabled. Losing it would
 *     lock everyone out of staff management with no way back except the CLI.
 *  2. Nobody changes their own role or status. Self-demotion is almost always a misclick,
 *     and self-promotion would make every other check pointless.
 *  3. A promotion never touches the person's Customer record. An employee who also buys
 *     music keeps their orders, entitlements and library.
 */

export type StaffListRow = StaffAccount & { createdByName: string | null };

export async function listStaff(): Promise<StaffListRow[]> {
  const db = shopDb();
  const rows = await db.staffAccount.findMany({ orderBy: [{ status: "asc" }, { role: "asc" }, { createdAt: "asc" }] });
  const creatorIds = [...new Set(rows.map((r) => r.createdByStaffId).filter((v): v is string => !!v))];
  const creators = creatorIds.length
    ? await db.staffAccount.findMany({ where: { id: { in: creatorIds } }, select: { id: true, displayName: true, email: true } })
    : [];
  const byId = new Map(creators.map((c) => [c.id, c.displayName ?? c.email ?? null]));
  return rows.map((r) => ({ ...r, createdByName: r.createdByStaffId ? (byId.get(r.createdByStaffId) ?? null) : null }));
}

/** Active SUPER_ADMINs other than the one being changed. Zero means "this is the last one". */
async function otherActiveSuperAdmins(excludeStaffId: string): Promise<number> {
  return shopDb().staffAccount.count({
    where: { role: "SUPER_ADMIN", status: "ACTIVE", id: { not: excludeStaffId } },
  });
}

/**
 * Candidates for promotion: people who already signed in at least once, so their Auth0
 * subject is known. Staff are never created from a typed-in e-mail address — the subject
 * is the only identity key, and an e-mail can be re-used by a different person.
 */
export async function searchPromotionCandidates(query: string, limit = 20) {
  const q = query.trim();
  if (q.length < 2) return [];
  const db = shopDb();
  const existing = await db.staffAccount.findMany({ select: { authSubject: true } });
  const taken = new Set(existing.map((s) => s.authSubject));
  const customers = await db.customer.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, authSubject: true, email: true, firstName: true, lastName: true },
    orderBy: { createdAt: "desc" },
    take: limit + taken.size,
  });
  return customers.filter((c) => !taken.has(c.authSubject)).slice(0, limit);
}

export async function promoteToStaff(input: {
  actorStaffId: string;
  authSubject: string;
  role: StaffRole;
  displayName?: string | null;
  email?: string | null;
}): Promise<StaffAccount> {
  const db = shopDb();
  const existing = await db.staffAccount.findUnique({ where: { authSubject: input.authSubject } });
  if (existing) throw new ShopError("CONFLICT", "That person already has a staff account");

  // Copy the profile fields from the Customer record if we have one, so the staff list is
  // readable without a second lookup. The Customer row itself is left untouched.
  const customer = await db.customer.findUnique({ where: { authSubject: input.authSubject } });
  const staff = await db.staffAccount.create({
    data: {
      authSubject: input.authSubject,
      role: input.role,
      status: "ACTIVE",
      email: input.email ?? customer?.email ?? null,
      displayName:
        input.displayName ??
        [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim() ??
        null,
      createdByStaffId: input.actorStaffId,
    },
  });
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "staff.promoted", { type: "StaffAccount", id: staff.id }, {
    role: input.role,
    hadCustomerRecord: !!customer,
  });
  return staff;
}

export async function changeStaffRole(input: { actorStaffId: string; staffId: string; role: StaffRole }): Promise<StaffAccount> {
  const db = shopDb();
  if (input.actorStaffId === input.staffId) {
    throw new ShopError("FORBIDDEN", "You cannot change your own role. Ask another super admin.");
  }
  const staff = await db.staffAccount.findUnique({ where: { id: input.staffId } });
  if (!staff) throw notFound("Staff account");
  if (staff.role === input.role) return staff;
  if (staff.role === "SUPER_ADMIN" && (await otherActiveSuperAdmins(staff.id)) === 0) {
    throw new ShopError("CONFLICT", "This is the last active super admin. Promote someone else first.");
  }
  const updated = await db.staffAccount.update({ where: { id: staff.id }, data: { role: input.role } });
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "staff.role_changed", { type: "StaffAccount", id: staff.id }, {
    from: staff.role,
    to: input.role,
  });
  return updated;
}

export async function changeStaffStatus(input: {
  actorStaffId: string;
  staffId: string;
  status: StaffStatus;
  reason?: string | null;
}): Promise<StaffAccount> {
  const db = shopDb();
  if (input.actorStaffId === input.staffId) {
    throw new ShopError("FORBIDDEN", "You cannot change your own access. Ask another super admin.");
  }
  const staff = await db.staffAccount.findUnique({ where: { id: input.staffId } });
  if (!staff) throw notFound("Staff account");
  if (staff.status === input.status) return staff;
  if (staff.role === "SUPER_ADMIN" && input.status !== "ACTIVE" && (await otherActiveSuperAdmins(staff.id)) === 0) {
    throw new ShopError("CONFLICT", "This is the last active super admin. Promote someone else first.");
  }
  const updated = await db.staffAccount.update({ where: { id: staff.id }, data: { status: input.status } });
  await audit({ type: "STAFF", staffId: input.actorStaffId }, "staff.status_changed", { type: "StaffAccount", id: staff.id }, {
    from: staff.status,
    to: input.status,
    reason: input.reason ?? null,
  });
  return updated;
}
