import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { bundleSchema } from "@/modules/shop/schemas";
import { saveBundle } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("catalog:write", async (req, { params, staff }) => {
  const { id } = await params;
  const data = await parseJson(req, bundleSchema);
  return NextResponse.json(await saveBundle({ staffId: staff.staff.id }, uuidParam(id), data));
});
