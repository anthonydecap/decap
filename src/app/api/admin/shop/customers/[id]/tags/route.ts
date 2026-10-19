import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { setCustomerTagsSchema } from "@/modules/shop/schemas";
import { setCustomerTags } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

export const PUT = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const { tagIds } = await parseJson(req, setCustomerTagsSchema);
  await setCustomerTags({ staffId: staff.staff.id }, uuidParam(id), tagIds);
  return NextResponse.json({ ok: true });
});
