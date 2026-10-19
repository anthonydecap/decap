import { NextResponse } from "next/server";
import { parseMultipart, uuidParam } from "@/modules/shop/http";
import { adminRoute } from "@/modules/shop/http-admin";
import { staffTicketMessageSchema } from "@/modules/shop/schemas";
import { staffMessage } from "@/modules/shop/services/support";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Reply to the customer (PUBLIC) or add an internal note (INTERNAL, never shown to the customer). */
export const POST = adminRoute<{ id: string }>("support:reply", async (req, { params, staff }) => {
  const { id } = await params;
  const { data, files } = await parseMultipart(req, staffTicketMessageSchema);
  await staffMessage({ staffId: staff.staff.id }, uuidParam(id), data, files);
  return NextResponse.json({ ok: true }, { status: 201 });
});
