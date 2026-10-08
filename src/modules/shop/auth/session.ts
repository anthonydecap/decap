import "server-only";
import type { Customer, StaffAccount, StaffRole } from "@/generated/shop-prisma/client";
import { shopConfig } from "../config";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { auth0, type SessionUser } from "./auth0";

/**
 * Identity bridge: Auth0 session → local business records.
 * The Auth0 `sub` is the only key; email/name are profile data copied for convenience.
 */

type SessionResolver = () => Promise<SessionUser | null>;

let resolver: SessionResolver = async () => {
  const session = await auth0().getSession();
  return (session?.user as SessionUser | undefined) ?? null;
};

/** Tests (and only tests) swap in a fake session. */
export function setSessionResolverForTests(r: SessionResolver | null) {
  if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
    throw new Error("Session resolver override is test-only");
  }
  resolver = r ?? (async () => {
    const session = await auth0().getSession();
    return (session?.user as SessionUser | undefined) ?? null;
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const user = await resolver();
    return user?.sub ? user : null;
  } catch {
    return null;
  }
}

/** Finds or creates the local Customer for the Auth0 subject; syncs profile fields if changed. */
export async function upsertCustomerFromSession(user: SessionUser): Promise<Customer> {
  const db = shopDb();
  const email = (user.email ?? "").trim().toLowerCase();
  const emailVerified = user.email_verified === true;
  const existing = await db.customer.findUnique({ where: { authSubject: user.sub } });
  if (!existing) {
    try {
      return await db.customer.create({
        data: {
          authSubject: user.sub,
          email,
          emailVerified,
          firstName: user.given_name ?? null,
          lastName: user.family_name ?? null,
        },
      });
    } catch {
      // Concurrent first request created it; read it back.
      return db.customer.findUniqueOrThrow({ where: { authSubject: user.sub } });
    }
  }
  if ((email && existing.email !== email) || existing.emailVerified !== emailVerified) {
    return db.customer.update({
      where: { id: existing.id },
      data: { ...(email ? { email } : {}), emailVerified },
    });
  }
  return existing;
}

export async function getCurrentCustomer(): Promise<Customer | null> {
  const user = await getSessionUser();
  return user ? upsertCustomerFromSession(user) : null;
}

export async function requireCustomer(): Promise<Customer> {
  const customer = await getCurrentCustomer();
  if (!customer) throw new ShopError("UNAUTHENTICATED", "Sign in to continue");
  return customer;
}

export type CheckoutReadiness =
  | { ready: true }
  | { ready: false; reason: "EMAIL_NOT_VERIFIED" | "ONBOARDING_REQUIRED" };

/** Checkout requires a verified email plus acceptance of the current Terms + Privacy versions. */
export async function checkoutReadiness(customer: Customer): Promise<CheckoutReadiness> {
  if (!customer.emailVerified) return { ready: false, reason: "EMAIL_NOT_VERIFIED" };
  if (!(await hasCurrentLegalAcceptance(customer.id)) || !customer.onboardingCompletedAt) {
    return { ready: false, reason: "ONBOARDING_REQUIRED" };
  }
  return { ready: true };
}

export async function hasCurrentLegalAcceptance(customerId: string): Promise<boolean> {
  const v = shopConfig.legalVersions;
  const count = await shopDb().legalAcceptance.count({
    where: {
      customerId,
      OR: [
        { documentType: "TERMS", documentVersion: v.TERMS },
        { documentType: "PRIVACY", documentVersion: v.PRIVACY },
      ],
    },
  });
  return count >= 2;
}

export async function requireCheckoutReadyCustomer(): Promise<Customer> {
  const customer = await requireCustomer();
  const readiness = await checkoutReadiness(customer);
  if (!readiness.ready) {
    throw new ShopError(
      readiness.reason,
      readiness.reason === "EMAIL_NOT_VERIFIED"
        ? "Verify your email address before checking out"
        : "Complete your account setup before checking out",
    );
  }
  return customer;
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export type StaffPermission =
  | "catalog:write"
  | "assets:upload"
  | "assets:download-master"
  | "imports:manage"
  | "orders:read"
  | "orders:refund"
  | "customers:read"
  | "customers:write"
  | "crm:write"
  | "players:read"
  | "players:write"
  | "players:activation-key"
  | "players:transfer"
  | "support:read"
  | "support:reply"
  | "support:assign"
  | "entitlements:grant"
  | "royalties:read"
  | "staff:read"
  | "staff:manage"
  | "audit:read"
  | "settings:write";

/**
 * Every capability, in the order the admin navigation reads them. Exported so there is one
 * list rather than a copy per caller — a permission added here cannot be forgotten in the nav.
 */
export const ALL_PERMISSIONS: readonly StaffPermission[] = [
  "catalog:write", "assets:upload", "assets:download-master", "imports:manage",
  "orders:read", "orders:refund",
  "customers:read", "customers:write", "crm:write",
  "players:read", "players:write", "players:activation-key", "players:transfer",
  "support:read", "support:reply", "support:assign",
  "entitlements:grant", "royalties:read",
  "staff:read", "staff:manage",
  "audit:read", "settings:write",
] as const;

/**
 * Roles are coarse; capabilities are what the server checks. Three deliberate limits:
 *
 *  - only SUPER_ADMIN manages staff or moves a player to another customer, because both
 *    hand out or move access;
 *  - CATALOG_MANAGER and FINANCE never get `players:activation-key`, which is the one
 *    capability that reveals a secret a customer could use;
 *  - SUPPORT may read orders but never refund them.
 */
const ROLE_PERMISSIONS: Record<StaffRole, ReadonlySet<StaffPermission>> = {
  SUPER_ADMIN: new Set<StaffPermission>(ALL_PERMISSIONS),
  ADMIN: new Set<StaffPermission>([
    "catalog:write", "assets:upload", "assets:download-master", "imports:manage", "orders:read",
    "orders:refund", "customers:read", "customers:write", "crm:write",
    "players:read", "players:write", "players:activation-key",
    "support:read", "support:reply", "support:assign",
    "entitlements:grant", "royalties:read", "staff:read", "audit:read", "settings:write",
  ]),
  SUPPORT: new Set<StaffPermission>([
    "customers:read", "customers:write", "crm:write",
    "players:read", "players:write", "players:activation-key",
    "support:read", "support:reply", "support:assign",
    "orders:read",
  ]),
  CATALOG_MANAGER: new Set<StaffPermission>(["catalog:write", "assets:upload", "imports:manage"]),
  FINANCE: new Set<StaffPermission>(["orders:read", "orders:refund", "customers:read", "royalties:read"]),
};

export function roleHasPermission(role: StaffRole, permission: StaffPermission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export type StaffContext = { staff: StaffAccount; user: SessionUser };

/** Server-side staff authorization. Hidden UI is never the check. */
export async function requireStaff(permission?: StaffPermission): Promise<StaffContext> {
  const user = await getSessionUser();
  if (!user) throw new ShopError("UNAUTHENTICATED", "Staff sign-in required");
  const staff = await shopDb().staffAccount.findUnique({ where: { authSubject: user.sub } });
  // SUSPENDED and DISABLED both deny immediately: revoking access must take effect on the
  // next request, not at the end of the session.
  if (!staff || staff.status !== "ACTIVE") throw new ShopError("FORBIDDEN", "Not a staff account");
  if (shopConfig.requireStaffMfa && !(user.amr ?? []).includes("mfa")) {
    throw new ShopError("MFA_REQUIRED", "Sign in again with multi-factor authentication");
  }
  if (permission && !roleHasPermission(staff.role, permission)) {
    throw new ShopError("FORBIDDEN", "Your role does not allow this action");
  }
  return { staff, user };
}

export async function getStaffOrNull(): Promise<StaffAccount | null> {
  try {
    return (await requireStaff()).staff;
  } catch {
    return null;
  }
}
