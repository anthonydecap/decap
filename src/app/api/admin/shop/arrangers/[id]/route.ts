import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { arrangerSchema } from "@/modules/shop/schemas";
import { saveArranger } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("catalog:write", async (req, { params, staff }) => {
  const { id } = await params;
  const data = await parseJson(req, arrangerSchema);
  return NextResponse.json(await saveArranger({ staffId: staff.staff.id }, uuidParam(id), data));
});
