import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route } from "@/modules/shop/http";
import { playerRequestSchema } from "@/modules/shop/schemas";
import { formatCustomerNumber } from "@/modules/shop/services/decap-request";
import { registerPlayerFromRequest } from "@/modules/shop/services/players";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { ShopError } from "@/modules/shop/errors";

export const dynamic = "force-dynamic";

/**
 * Licence v1 (contract C7 §5.1): the signed-in customer registers a player by uploading its
 * `.decapreq`. The customer always comes from the session, never from the body.
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  // A verified email first: a player that is claimed can only be moved back by DMI.
  if (!customer.emailVerified) throw new ShopError("EMAIL_NOT_VERIFIED", "Verify your email address before registering a player.");
  await rateLimit(`player-request:${customer.id}`, 10, 60);
  const body = await parseJson(req, playerRequestSchema);
  const { player, created, customerNumber } = await registerPlayerFromRequest({
    customerId: customer.id,
    requestText: body.request,
    friendlyName: body.friendlyName ?? null,
  });
  return NextResponse.json({ playerId: player.id, created, customerNumber: formatCustomerNumber(customerNumber) }, { status: created ? 201 : 200 });
});
