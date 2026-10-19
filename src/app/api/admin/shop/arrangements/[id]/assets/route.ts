import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { presignAssetSchema } from "@/modules/shop/schemas";
import { listArrangementAssets, presignAssetUpload } from "@/modules/shop/services/assets";
import { RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

export const GET = adminRoute<{ id: string }>("catalog:write", async (_req, { params }) => {
  const { id } = await params;
  return NextResponse.json(await listArrangementAssets(uuidParam(id)));
});

/** Presign: creates an UPLOADING AssetVersion + a short-lived single-path upload target. */
export const POST = adminRoute<{ id: string }>(
  "assets:upload",
  async (req, { params, staff }) => {
    const { id } = await params;
    const input = await parseJson(req, presignAssetSchema);
    const result = await presignAssetUpload({ staffId: staff.staff.id, owner: { arrangementId: uuidParam(id) }, ...input });
    return NextResponse.json(result, { status: 201 });
  },
  { rateLimit: { key: "presign", ...RATE_LIMITS.uploadPresign } },
);
