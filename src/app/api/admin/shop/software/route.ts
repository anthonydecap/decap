import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { softwareProductSchema } from "@/modules/shop/schemas";
import { listSoftwareProductsAdmin, saveSoftwareProduct } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

export const GET = adminRoute("software:read", async () => NextResponse.json(await listSoftwareProductsAdmin()));

export const POST = adminRoute("software:write", async (req, { staff }) => {
  const p = await saveSoftwareProduct({ staffId: staff.staff.id }, null, await parseJson(req, softwareProductSchema));
  return NextResponse.json({ id: p.id }, { status: 201 });
});
