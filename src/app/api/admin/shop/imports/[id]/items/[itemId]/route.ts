import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { importItemPatchSchema } from "@/modules/shop/schemas";
import { patchImportItem } from "@/modules/shop/services/imports";

export const dynamic = "force-dynamic";

/** Remap (SKU / asset kind), skip, unskip or retry one item. */
export const PATCH = adminRoute<{ id: string; itemId: string }>("imports:manage", async (req, { params, staff }) => {
  const { id, itemId } = await params;
  const patch = await parseJson(req, importItemPatchSchema);
  const item = await patchImportItem({ staffId: staff.staff.id }, uuidParam(id), uuidParam(itemId), patch);
  return NextResponse.json({
    id: item.id,
    status: item.status,
    targetSku: item.targetSku,
    kind: item.detectedAssetKind,
    errors: item.validationErrors ?? [],
    warnings: item.validationWarnings ?? [],
  });
});
