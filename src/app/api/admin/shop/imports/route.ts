import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { importCreateSchema } from "@/modules/shop/schemas";
import { createImportBatch, listImportBatches } from "@/modules/shop/services/imports";

export const dynamic = "force-dynamic";

export const GET = adminRoute("imports:manage", async () => NextResponse.json(await listImportBatches()));

/** Creates an ImportBatch and parses the optional metadata CSV into auditable staging rows. */
export const POST = adminRoute("imports:manage", async (req, { staff }) => {
  const input = await parseJson(req, importCreateSchema, 6 * 1024 * 1024);
  const result = await createImportBatch({ staffId: staff.staff.id }, input);
  return NextResponse.json({ id: result.batch.id, rowCount: result.rowCount, csvErrors: result.csvErrors }, { status: 201 });
});
