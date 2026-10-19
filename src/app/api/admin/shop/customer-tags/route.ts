import { NextResponse } from "next/server";
import { parseJson } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { customerTagSchema } from "@/modules/shop/schemas";
import { listCustomerTags, saveCustomerTag } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

export const GET = adminRoute("customers:read", async () => NextResponse.json(await listCustomerTags()));

export const POST = adminRoute("crm:write", async (req, { staff }) => {
  const tag = await saveCustomerTag({ staffId: staff.staff.id }, null, await parseJson(req, customerTagSchema));
  return NextResponse.json(tag, { status: 201 });
});
