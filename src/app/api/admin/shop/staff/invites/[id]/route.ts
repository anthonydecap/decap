import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { revokeStaffInvite } from "@/modules/shop/services/staff";

export const dynamic = "force-dynamic";

export const DELETE = adminRoute<{ id: string }>("staff:manage", async (_req, { params, staff }) => {
  const { id } = await params;
  await revokeStaffInvite({ actorStaffId: staff.staff.id, inviteId: uuidParam(id) });
  return NextResponse.json({ ok: true });
});
