import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { arrangementSchema } from "@/modules/shop/schemas";
import { saveArrangement } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const POST = adminRoute("catalog:write", async (req, { staff }) => {
  const data = await parseJson(req, arrangementSchema);
  return NextResponse.json(await saveArrangement({ staffId: staff.staff.id }, null, data), { status: 201 });
});
