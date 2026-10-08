import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { importDryRunSchema } from "@/modules/shop/schemas";
import { dryRunImport } from "@/modules/shop/services/imports";

export const dynamic = "force-dynamic";

/** Mapping/validation plan. Mutates staging rows only — never the catalog. */
export const POST = adminRoute<{ id: string }>("imports:manage", async (req, { params, staff }) => {
  const { id } = await params;
  const { files } = await parseJson(req, importDryRunSchema, 4 * 1024 * 1024);
  return NextResponse.json(await dryRunImport({ staffId: staff.staff.id }, uuidParam(id), files));
});
