import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { softwareProductStatusSchema } from "@/modules/shop/schemas";
import { setSoftwareProductStatus } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>("software:release-publish", async (req, { params, staff }) => {
  const { id } = await params;
  const { status } = await parseJson(req, softwareProductStatusSchema);
  const p = await setSoftwareProductStatus({ staffId: staff.staff.id }, uuidParam(id), status);
  return NextResponse.json({ id: p.id, status: p.status });
});
