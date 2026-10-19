import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { adminLicenseSchema } from "@/modules/shop/schemas";
import { adminCreateLicense } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

/** Manual / promotional / legacy license. Never creates a fake order. */
export const POST = adminRoute("software:licenses-write", async (req, { staff }) => {
  const lic = await adminCreateLicense({ staffId: staff.staff.id }, await parseJson(req, adminLicenseSchema));
  return NextResponse.json({ id: lic.id, number: lic.number }, { status: 201 });
});
