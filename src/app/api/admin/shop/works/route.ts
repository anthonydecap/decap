import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { workSchema } from "@/modules/shop/schemas";
import { saveWork } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const POST = adminRoute("catalog:write", async (req, { staff }) => {
  const data = await parseJson(req, workSchema);
  return NextResponse.json(await saveWork({ staffId: staff.staff.id }, null, data), { status: 201 });
});
