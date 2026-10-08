import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffRoleSchema, staffStatusSchema } from "@/modules/shop/schemas";
import { changeStaffRole, changeStaffStatus } from "@/modules/shop/services/staff";

export const dynamic = "force-dynamic";

/**
 * Role change. The service refuses self-changes and refuses to demote the last active
 * super admin; both are checked inside the service, not here, so the API and any future
 * caller get the same guarantee.
 */
export const PATCH = adminRoute<{ id: string }>("staff:manage", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, staffRoleSchema);
  const updated = await changeStaffRole({ actorStaffId: staff.staff.id, staffId: uuidParam(id), role: input.role });
  return NextResponse.json({ staffId: updated.id, role: updated.role });
});

/** Suspend, disable or reinstate. Takes effect on the staff member's next request. */
export const PUT = adminRoute<{ id: string }>("staff:manage", async (req, { params, staff }) => {
  const { id } = await params;
  const input = await parseJson(req, staffStatusSchema);
  const updated = await changeStaffStatus({
    actorStaffId: staff.staff.id,
    staffId: uuidParam(id),
    status: input.status,
    reason: input.reason,
  });
  return NextResponse.json({ staffId: updated.id, status: updated.status });
});
