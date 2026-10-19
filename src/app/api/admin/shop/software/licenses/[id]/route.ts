import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { licensePatchSchema, licenseStatusSchema } from "@/modules/shop/schemas";
import { setLicenseStatus, updateLicense } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("software:licenses-write", async (req, { params, staff }) => {
  const { id } = await params;
  const l = await updateLicense({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, licensePatchSchema));
  return NextResponse.json({ id: l.id, maxActivations: l.maxActivations });
});

/** Suspend / revoke / reinstate, with a reason. */
export const POST = adminRoute<{ id: string }>("software:licenses-write", async (req, { params, staff }) => {
  const { id } = await params;
  const { status, reason } = await parseJson(req, licenseStatusSchema);
  const l = await setLicenseStatus({ staffId: staff.staff.id }, uuidParam(id), status, reason);
  return NextResponse.json({ id: l.id, status: l.status });
});
