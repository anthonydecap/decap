import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { arrangerSchema } from "@/modules/shop/schemas";
import { saveArranger } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const POST = adminRoute("catalog:write", async (req, { staff }) => {
  const data = await parseJson(req, arrangerSchema);
  return NextResponse.json(await saveArranger({ staffId: staff.staff.id }, null, data), { status: 201 });
});
