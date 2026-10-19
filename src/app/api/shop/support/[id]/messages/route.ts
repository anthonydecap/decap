import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseMultipart, route, uuidParam } from "@/modules/shop/http";
import { ticketReplySchema } from "@/modules/shop/schemas";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { customerReply } from "@/modules/shop/services/support";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = route<{ id: string }>(async (req, { params }) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`support-reply:${customer.id}`, 30, 3600);
  const { id } = await params;
  const { data, files } = await parseMultipart(req, ticketReplySchema);
  await customerReply(customer, uuidParam(id), data.message, files);
  return NextResponse.json({ ok: true }, { status: 201 });
});
