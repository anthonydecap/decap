import Link from "next/link";
import { staffLoginUrl } from "../../auth/auth0";
import { btn } from "./primitives";

export function NoAccess({ reason, returnTo = "/admin/shop" }: { reason: "FORBIDDEN" | "MFA_REQUIRED"; returnTo?: string }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-neutral-950">
        {reason === "MFA_REQUIRED" ? "Multi-factor sign-in required" : "No access"}
      </h1>
      <p className="mt-3 text-sm text-neutral-600">
        {reason === "MFA_REQUIRED"
          ? "Staff accounts must sign in with multi-factor authentication. Sign in again to continue."
          : "Your account does not have permission to open this part of the shop administration."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {reason === "MFA_REQUIRED" ? (
          <a className={btn.primary} href={staffLoginUrl(returnTo)}>Sign in again</a>
        ) : (
          <Link className={btn.secondary} href="/admin/shop">Back to dashboard</Link>
        )}
      </div>
    </div>
  );
}
