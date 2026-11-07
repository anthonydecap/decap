import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { licenseOrderSettingsSchema } from "@/modules/shop/schemas";
import { updateLicenseOrderSettings } from "@/modules/shop/services/player-licenses";

export const dynamic = "force-dynamic";

/** Suggested licence settings of a waiting order (the uploaded licence stays the truth). */
export const PATCH = adminRoute<{ id: string }>("licences:issue", async (req, { params, staff }) => {
  const { id } = await params;
  const body = await parseJson(req, licenseOrderSettingsSchema);
  await updateLicenseOrderSettings({ staffId: staff.staff.id, orderId: uuidParam(id), ...body });
  return NextResponse.json({ ok: true });
});
