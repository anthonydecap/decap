import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route } from "@/modules/shop/http";
import { assignMusicSchema } from "@/modules/shop/schemas";
import { assignLicenses } from "@/modules/shop/services/music-licenses";
import { rateLimit } from "@/modules/shop/services/rate-limit";

export const dynamic = "force-dynamic";

/**
 * First placement of music bought "for later" onto one of the customer's own players.
 * Once placed it is locked: moving it afterwards is a DMI Support transfer.
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  await rateLimit(`music-assign:${customer.id}`, 20, 60);
  const input = await parseJson(req, assignMusicSchema);
  const result = await assignLicenses({ actor: { type: "CUSTOMER", customerId: customer.id }, licenseIds: input.licenseIds, playerId: input.playerId });
  return NextResponse.json(result);
});
