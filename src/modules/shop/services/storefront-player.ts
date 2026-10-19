import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { PLAYER_COOKIE, shopPlayerContext, type ShopPlayerContext } from "./music-shop";

/**
 * Storefront pages resolve "Buying music for" the same way: an explicit `?player=` (from an
 * "Add Music" link on a player page) wins, then the remembered choice (cookie). The id is
 * re-validated by `shopPlayerContext`, so a stale or forged value simply falls back.
 * Cached per request so the layout and the page share one lookup.
 */
const contextFor = cache((customerId: string, playerId: string | null) => shopPlayerContext(customerId, playerId));

export async function storefrontPlayerContext(customerId: string, playerParam?: string | string[] | null): Promise<ShopPlayerContext> {
  const param = Array.isArray(playerParam) ? playerParam[0] : playerParam;
  const requested = param && /^[0-9a-f-]{36}$/i.test(param) ? param : (await cookies()).get(PLAYER_COOKIE)?.value ?? null;
  return contextFor(customerId, requested);
}
