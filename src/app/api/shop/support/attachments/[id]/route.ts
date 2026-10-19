import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { route, uuidParam } from "@/modules/shop/http";
import { customerAttachmentUrl } from "@/modules/shop/services/support";

export const dynamic = "force-dynamic";

/** Own ticket, customer-visible message only; then a 2-minute signed link. */
export const GET = route<{ id: string }>(async (_req, { params }) => {
  const customer = await requireCustomer();
  const { id } = await params;
  return NextResponse.redirect(await customerAttachmentUrl(customer.id, uuidParam(id)), 302);
});
