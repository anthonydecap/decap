import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { customerTagSchema } from "@/modules/shop/schemas";
import { deleteCustomerTag, saveCustomerTag } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  return NextResponse.json(await saveCustomerTag({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, customerTagSchema)));
});

export const DELETE = adminRoute<{ id: string }>("crm:write", async (_req, { params, staff }) => {
  const { id } = await params;
  await deleteCustomerTag({ staffId: staff.staff.id }, uuidParam(id));
  return NextResponse.json({ ok: true });
});
