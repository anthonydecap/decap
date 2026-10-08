import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { presignAssetSchema } from "@/modules/shop/schemas";
import { presignAssetUpload } from "@/modules/shop/services/assets";
import { RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/** Bundle artwork upload (COVER_IMAGE only). */
export const POST = adminRoute<{ id: string }>(
  "assets:upload",
  async (req, { params, staff }) => {
    const { id } = await params;
    const input = await parseJson(req, presignAssetSchema);
    const result = await presignAssetUpload({ staffId: staff.staff.id, owner: { bundleId: uuidParam(id) }, ...input });
    return NextResponse.json(result, { status: 201 });
  },
  { rateLimit: { key: "presign", ...RATE_LIMITS.uploadPresign } },
);
