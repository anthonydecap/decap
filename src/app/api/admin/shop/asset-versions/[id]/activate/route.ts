import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { activateAssetVersion } from "@/modules/shop/services/assets";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>("assets:upload", async (_req, { params, staff }) => {
  const { id } = await params;
  const v = await activateAssetVersion({ staffId: staff.staff.id, assetVersionId: uuidParam(id) });
  return NextResponse.json({ id: v.id, active: true });
});
