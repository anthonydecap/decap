import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { statusChangeSchema } from "@/modules/shop/schemas";
import { setArrangementStatus } from "@/modules/shop/services/admin-catalog";

export const dynamic = "force-dynamic";

/** Publishing always runs the publish validator server-side. */
export const POST = adminRoute<{ id: string }>("catalog:write", async (req, { params, staff }) => {
  const { id } = await params;
  const { status } = await parseJson(req, statusChangeSchema);
  return NextResponse.json(await setArrangementStatus({ staffId: staff.staff.id }, uuidParam(id), status));
});
