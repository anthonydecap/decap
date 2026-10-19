import { NextResponse } from "next/server";
import { parseJson, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { communicationSchema } from "@/modules/shop/schemas";
import { logCommunication } from "@/modules/shop/services/crm-admin";

export const dynamic = "force-dynamic";

/** Records contact that happened outside the ticket system (call, email, WhatsApp, visit). */
export const POST = adminRoute<{ id: string }>("crm:write", async (req, { params, staff }) => {
  const { id } = await params;
  const entry = await logCommunication({ staffId: staff.staff.id }, uuidParam(id), await parseJson(req, communicationSchema));
  return NextResponse.json({ id: entry.id }, { status: 201 });
});
