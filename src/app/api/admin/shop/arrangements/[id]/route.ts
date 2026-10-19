import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { arrangementSchema } from "@/modules/shop/schemas";
import { saveArrangement } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("catalog:write", async (req, { params, staff }) => {
  const { id } = await params;
  const data = await parseJson(req, arrangementSchema);
  return NextResponse.json(await saveArrangement({ staffId: staff.staff.id }, uuidParam(id), data));
});
