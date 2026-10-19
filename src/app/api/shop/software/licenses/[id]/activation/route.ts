import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route, uuidParam } from "@/modules/shop/http";
import { activationSubmitSchema } from "@/modules/shop/schemas";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { submitActivation } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

/** The customer submits the registration code shown by their installed software. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`activation-submit:${customer.id}`, 10, 3600);
  const { id } = await params;
  const r = await submitActivation(customer, uuidParam(id), await parseJson(req, activationSubmitSchema));
  return NextResponse.json({ id: r.id, number: r.number, status: r.status }, { status: 201 });
});
