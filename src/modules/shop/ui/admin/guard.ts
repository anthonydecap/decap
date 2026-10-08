import "server-only";
import { redirect } from "next/navigation";
import { requireStaff, type StaffContext, type StaffPermission } from "../../auth/session";
import { staffLoginUrl } from "../../auth/auth0";
import { ShopError } from "../../errors";

export type StaffPageResult =
  | { ok: true; ctx: StaffContext }
  | { ok: false; reason: "FORBIDDEN" | "MFA_REQUIRED" };

/**
 * Server-side guard for every admin page (layouts don't re-run on client navigation, so
 * pages check too). Unauthenticated → Auth0 staff login; wrong role → "no access".
 */
export async function guardStaffPage(permission: StaffPermission | undefined, returnTo: string): Promise<StaffPageResult> {
  try {
    return { ok: true, ctx: await requireStaff(permission) };
  } catch (e) {
    if (e instanceof ShopError) {
      if (e.code === "UNAUTHENTICATED") redirect(staffLoginUrl(returnTo));
      if (e.code === "MFA_REQUIRED") return { ok: false, reason: "MFA_REQUIRED" };
      return { ok: false, reason: "FORBIDDEN" };
    }
    throw e;
  }
}
