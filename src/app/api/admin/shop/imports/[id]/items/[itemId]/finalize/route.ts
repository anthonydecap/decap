import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { finalizeImportItem } from "@/modules/shop/services/imports";
import { RATE_LIMITS } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const bodySchema = z.object({ sha256: z.string().regex(/^[0-9a-f]{64}$/i).optional().nullable() });

/** Verifies one uploaded file. A failure here never affects other items in the batch. */
export const POST = adminRoute<{ id: string; itemId: string }>(
  "imports:manage",
  async (req, { params, staff }) => {
    const { id, itemId } = await params;
    const { sha256 } = await parseJson(req, bodySchema);
    const item = await finalizeImportItem({ staffId: staff.staff.id }, uuidParam(id), uuidParam(itemId), sha256);
    return NextResponse.json({
      id: item.id,
      status: item.status,
      errors: item.validationErrors ?? [],
      warnings: item.validationWarnings ?? [],
    });
  },
  { rateLimit: { key: "finalize", ...RATE_LIMITS.uploadFinalize } },
);
