import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, route, uuidParam } from "@/modules/shop/http";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { customerRevealKey } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

/** Explicit reveal of the owner's own activation key. POST (never cached / prefetched), audited. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`key-reveal:${customer.id}`, 30, 3600);
  const { id } = await params;
  const activationKey = await customerRevealKey(customer, uuidParam(id));
  return NextResponse.json({ activationKey }, { headers: { "cache-control": "no-store, private" } });
});
