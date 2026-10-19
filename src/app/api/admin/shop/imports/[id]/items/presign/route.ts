import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { importPresignSchema } from "@/modules/shop/schemas";
import { presignImportItems } from "@/modules/shop/services/imports";
import { RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/** Scoped, short-lived upload targets for up to 50 items per request. */
export const POST = adminRoute<{ id: string }>(
  "imports:manage",
  async (req, { params, staff }) => {
    const { id } = await params;
    const { itemIds } = await parseJson(req, importPresignSchema);
    return NextResponse.json(await presignImportItems({ staffId: staff.staff.id }, uuidParam(id), itemIds));
  },
  { rateLimit: { key: "presign", ...RATE_LIMITS.uploadPresign } },
);
