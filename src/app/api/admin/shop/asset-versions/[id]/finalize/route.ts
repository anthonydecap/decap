import { NextResponse } from "next/server";
import { uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { finalizeAssetVersion } from "@/modules/shop/services/assets";
import { RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export const POST = adminRoute<{ id: string }>(
  "assets:upload",
  async (_req, { params, staff }) => {
    const { id } = await params;
    const v = await finalizeAssetVersion({ staffId: staff.staff.id, assetVersionId: uuidParam(id) });
    return NextResponse.json({
      id: v.id,
      status: v.status,
      errors: v.validationErrors ?? [],
      warnings: v.validationWarnings ?? [],
      technicalMetadata: v.technicalMetadata ?? null,
    });
  },
  { rateLimit: { key: "finalize", ...RATE_LIMITS.uploadFinalize } },
);
