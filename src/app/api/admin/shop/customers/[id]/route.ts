import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { crmCustomerSchema } from "@/modules/shop/schemas";
import { updateCustomerCrm } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

/** CRM status / source and, optionally, the customer's contact + billing profile. */
export const PATCH = adminRoute<{ id: string }>("customers:write", async (req, { params, staff }) => {
  const { id } = await params;
  await updateCustomerCrm({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, crmCustomerSchema));
  return NextResponse.json({ ok: true });
});
