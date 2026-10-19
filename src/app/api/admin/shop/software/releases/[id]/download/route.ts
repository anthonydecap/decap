import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffReleaseDownloadUrl } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

export const GET = adminRoute<{ id: string }>("software:read", async (_req, { params, staff }) => {
  const { id } = await params;
  return NextResponse.redirect(await staffReleaseDownloadUrl({ staffId: staff.staff.id }, uuidParam(id)), 302);
});
