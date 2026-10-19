import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { documentDownloadUrl } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

/** Audited, 2-minute signed download. */
export const GET = adminRoute<{ id: string }>("crm:write", async (_req, { params, staff }) => {
  const { id } = await params;
  return NextResponse.redirect(await documentDownloadUrl({ staffId: staff.staff.id }, uuidParam(id)), 302);
});
