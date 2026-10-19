import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route, uuidParam } from "@/modules/shop/http";
import { activationRespondSchema } from "@/modules/shop/schemas";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { cancelActivation, respondToActivation } from "@/modules/shop/services/software-licensing";

export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("action", [
  activationRespondSchema.extend({ action: z.literal("respond") }),
  z.object({ action: z.literal("cancel") }),
]);

/** Customer answers an information request, or cancels their own open request. */
export const POST = route<{ id: string }>(async (req, { params }) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`activation-respond:${customer.id}`, 20, 3600);
  const { id } = await params;
  const body = await parseJson(req, schema);
  if (body.action === "cancel") await cancelActivation(customer, uuidParam(id));
  else await respondToActivation(customer, uuidParam(id), body);
  return NextResponse.json({ ok: true });
});
