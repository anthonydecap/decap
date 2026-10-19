import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { softwareProductSchema } from "@/modules/shop/schemas";
import { saveSoftwareProduct } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("software:write", async (req, { params, staff }) => {
  const { id } = await params;
  const p = await saveSoftwareProduct({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, softwareProductSchema));
  return NextResponse.json({ id: p.id });
});
