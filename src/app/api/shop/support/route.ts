import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseMultipart, route } from "@/modules/shop/http";
import { newTicketSchema } from "@/modules/shop/schemas";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { createTicket, ticketNumber } from "@/modules/shop/services/support";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** New support request. Linked player / order / arrangement ownership is verified server-side. */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`support-create:${customer.id}`, 10, 3600);
  const { data, files } = await parseMultipart(req, newTicketSchema);
  const t = await createTicket(customer, data, files);
  return NextResponse.json({ id: t.id, ticketNumber: ticketNumber(t.number), status: t.status }, { status: 201 });
});
