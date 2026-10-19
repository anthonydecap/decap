import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireCustomer } from "@/modules/shop/auth/session";
import { assertSameOrigin, parseJson, route } from "@/modules/shop/http";
import { playerContextSchema } from "@/modules/shop/schemas";
import { requireCustomerMusicPlayer } from "@/modules/shop/services/music-licenses";
import { PLAYER_COOKIE } from "@/modules/shop/services/music-shop";

export const dynamic = "force-dynamic";

/**
 * Remembers which player the customer is shopping for ("Buying music for: …"). Only a
 * convenience: every page and the cart re-validate the id against the session.
 */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const customer = await requireCustomer();
  const { playerId } = await parseJson(req, playerContextSchema);
  const jar = await cookies();
  if (!playerId) {
    jar.delete(PLAYER_COOKIE);
    return NextResponse.json({ playerId: null });
  }
  const player = await requireCustomerMusicPlayer(customer.id, playerId);
  jar.set(PLAYER_COOKIE, player.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return NextResponse.json({ playerId: player.id, name: player.name });
});
