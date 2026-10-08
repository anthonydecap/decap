import "server-only";
import { requireStaff, type StaffContext, type StaffPermission } from "./auth/session";
import { assertSameOrigin, route } from "./http";
import { rateLimit } from "./services/rate-limit";

/**
 * Admin route wrapper: server-side staff + permission check on every request, same-origin
 * check on mutations, optional per-staff rate limit.
 */
export function adminRoute<P = Record<string, string>>(
  permission: StaffPermission,
  handler: (req: Request, ctx: { params: Promise<P>; staff: StaffContext }) => Promise<Response>,
  opts: { rateLimit?: { key: string; limit: number; windowSeconds: number } } = {},
) {
  return route<P>(async (req, ctx) => {
    if (req.method !== "GET" && req.method !== "HEAD") assertSameOrigin(req);
    const staff = await requireStaff(permission);
    if (opts.rateLimit) {
      await rateLimit(`${opts.rateLimit.key}:${staff.staff.id}`, opts.rateLimit.limit, opts.rateLimit.windowSeconds);
    }
    return handler(req, { params: ctx.params, staff });
  });
}
