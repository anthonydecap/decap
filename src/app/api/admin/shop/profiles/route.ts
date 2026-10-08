import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { systemProfileSchema } from "@/modules/shop/schemas";
import { saveSystemProfile } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

export const POST = adminRoute("catalog:write", async (req, { staff }) => {
  const data = await parseJson(req, systemProfileSchema);
  return NextResponse.json(await saveSystemProfile({ staffId: staff.staff.id }, null, data), { status: 201 });
});
