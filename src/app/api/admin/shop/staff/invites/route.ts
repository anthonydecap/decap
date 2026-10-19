import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffInviteSchema } from "@/modules/shop/schemas";
import { createStaffInvite, listStaffInvites } from "@/modules/shop/services/staff";

export const dynamic = "force-dynamic";

export const GET = adminRoute("staff:manage", async () => NextResponse.json(await listStaffInvites()));

/** SUPER_ADMIN only (staff:manage). Returns the link once, for when no email provider is set up. */
export const POST = adminRoute("staff:manage", async (req, { staff }) => {
  const input = await parseJson(req, staffInviteSchema);
  const { invite, link, emailed } = await createStaffInvite({ actorStaffId: staff.staff.id, ...input });
  return NextResponse.json({ id: invite.id, link, emailed, expiresAt: invite.expiresAt }, { status: 201 });
}, { rateLimit: { key: "staff-invite", limit: 20, windowSeconds: 3600 } });
