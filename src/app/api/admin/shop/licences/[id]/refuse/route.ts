import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { licenseRefuseSchema } from "@/modules/shop/schemas";
import { refuseLicenseOrder } from "@/modules/shop/services/player-licenses";

export const dynamic = "force-dynamic";

export const POST = adminRoute<{ id: string }>("licences:issue", async (req, { params, staff }) => {
  const { id } = await params;
  const { reason } = await parseJson(req, licenseRefuseSchema);
  await refuseLicenseOrder({ staffId: staff.staff.id, orderId: uuidParam(id), reason });
  return NextResponse.json({ ok: true });
});
