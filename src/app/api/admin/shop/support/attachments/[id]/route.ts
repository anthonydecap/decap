import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffAttachmentUrl } from "@/modules/shop/services/support";

export const dynamic = "force-dynamic";

export const GET = adminRoute<{ id: string }>("support:read", async (_req, { params, staff }) => {
  const { id } = await params;
  return NextResponse.redirect(await staffAttachmentUrl({ staffId: staff.staff.id }, uuidParam(id)), 302);
});
