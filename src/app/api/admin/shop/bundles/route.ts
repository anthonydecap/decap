import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { bundleSchema } from "@/modules/shop/schemas";
import { saveBundle } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const POST = adminRoute("catalog:write", async (req, { staff }) => {
  const data = await parseJson(req, bundleSchema);
  return NextResponse.json(await saveBundle({ staffId: staff.staff.id }, null, data), { status: 201 });
});
