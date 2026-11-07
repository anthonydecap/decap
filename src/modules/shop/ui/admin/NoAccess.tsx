import Link from "next/link";
import { loginUrl } from "../../auth/auth0";
import { btn } from "./primitives";

/** Signed in, but not as active staff with the right role. */
export function NoAccess({ returnTo = "/admin/shop" }: { reason?: "FORBIDDEN"; returnTo?: string }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="font-display text-2xl font-bold text-neutral-950">No access</h1>
      <p className="mt-3 text-sm text-neutral-600">Your account does not have permission to open this part of the shop administration.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link className={btn.secondary} href="/admin/shop">Back to dashboard</Link>
        <a className={btn.ghost} href={loginUrl(returnTo, { prompt: "login" })}>Sign in with another account</a>
      </div>
    </div>
  );
}
