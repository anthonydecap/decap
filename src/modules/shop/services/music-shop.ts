import "server-only";
import { additionalPlayerPriceCents } from "../domain/music-policy";
import type { CartPricingResult, PricingCartLine } from "../domain/cart-pricing";
import { DEFAULT_CURRENCY } from "../domain/money";
import { shopDb } from "../db";
import { priceLines, type CartPlayer } from "./cart";
import { compatibleArrangementIds, eligibleMusicPlayers, LIVE_LICENSE_STATUSES, type MusicPlayer } from "./music-licenses";
import { getMusicPolicy } from "./music-policy";

/**
 * The storefront's player context: "Buying music for: Living Room Piano". Resolved on the
 * server for every page from the signed-in customer plus the remembered selection (cookie
 * or `?player=`), and re-validated each time, so a stale or forged id simply falls back.
 * Prices shown here are previews; the cart reprices everything authoritatively.
 */

export const PLAYER_COOKIE = "dmi_player";

export type ShopPlayerContext = {
  customerId: string;
  players: CartPlayer[];
  /** Null when the customer has several players and has not chosen one yet, or has none. */
  selectedPlayerId: string | null;
  selectedPlayer: CartPlayer | null;
  assignLaterAllowed: boolean;
  /** Arrangements on the selected player (no player: bought for later). */
  licensedOnSelected: ReadonlySet<string>;
  /** arrangementId → the customer's players that have it. */
  licensedOn: ReadonlyMap<string, { id: string; name: string }[]>;
  /** Any live or unassigned license of the customer. */
  licensedAnywhere: ReadonlySet<string>;
  additionalPriceCents: (retailCents: number) => number;
  additionalPricingActive: boolean;
};

const toCartPlayer = (p: MusicPlayer): CartPlayer => ({ id: p.id, name: p.name, typeName: p.typeName, maskedRegistration: p.maskedRegistration });

export async function shopPlayerContext(customerId: string, requestedPlayerId?: string | null): Promise<ShopPlayerContext> {
  const [players, policy, licenses] = await Promise.all([
    eligibleMusicPlayers(customerId),
    getMusicPolicy(),
    shopDb().musicLicense.findMany({
      where: { customerId, status: { in: [...LIVE_LICENSE_STATUSES, "UNASSIGNED"] } },
      select: { arrangementId: true, licensedPlayerId: true, status: true },
    }),
  ]);
  const selected = players.find((p) => p.id === requestedPlayerId) ?? (players.length === 1 ? players[0]! : null);
  const names = new Map(players.map((p) => [p.id, p.name]));
  const licensedOn = new Map<string, { id: string; name: string }[]>();
  const licensedOnSelected = new Set<string>();
  const licensedAnywhere = new Set<string>();
  for (const l of licenses) {
    licensedAnywhere.add(l.arrangementId);
    if (l.status === "UNASSIGNED") {
      if (players.length === 0) licensedOnSelected.add(l.arrangementId);
      continue;
    }
    if (selected && l.licensedPlayerId === selected.id) licensedOnSelected.add(l.arrangementId);
    const name = (l.licensedPlayerId && names.get(l.licensedPlayerId)) ?? null;
    if (name) licensedOn.set(l.arrangementId, [...(licensedOn.get(l.arrangementId) ?? []), { id: l.licensedPlayerId!, name }]);
  }
  return {
    customerId,
    players: players.map(toCartPlayer),
    selectedPlayerId: selected?.id ?? null,
    selectedPlayer: selected ? toCartPlayer(selected) : null,
    assignLaterAllowed: policy.allowAssignLater && players.length === 0,
    licensedOnSelected,
    licensedOn,
    licensedAnywhere,
    additionalPriceCents: (c) => additionalPlayerPriceCents(c, policy.additionalPlayer),
    additionalPricingActive: policy.additionalPlayer.strategy !== "NO_DISCOUNT",
  };
}

export type ArrangementPlayerState = {
  /** LICENSED: on the selected player. ADDITIONAL: on another player, not this one. */
  state: "LICENSED" | "AVAILABLE" | "ADDITIONAL" | "CHOOSE_PLAYER" | "INCOMPATIBLE";
  priceCents: number;
  /** Names of the customer's players that already have it. */
  licensedOn: string[];
};

/** Card / product-page state of one arrangement for the context's selected player. */
export function arrangementPlayerState(ctx: ShopPlayerContext | null, arrangement: { id: string; priceCents: number }, incompatible = false): ArrangementPlayerState {
  if (!ctx) return { state: "AVAILABLE", priceCents: arrangement.priceCents, licensedOn: [] };
  const licensedOn = (ctx.licensedOn.get(arrangement.id) ?? []).map((p) => p.name);
  if (ctx.licensedOnSelected.has(arrangement.id)) return { state: "LICENSED", priceCents: arrangement.priceCents, licensedOn };
  if (incompatible) return { state: "INCOMPATIBLE", priceCents: arrangement.priceCents, licensedOn };
  if (!ctx.selectedPlayerId && ctx.players.length > 1) return { state: "CHOOSE_PLAYER", priceCents: arrangement.priceCents, licensedOn };
  if (ctx.licensedAnywhere.has(arrangement.id)) {
    return { state: "ADDITIONAL", priceCents: ctx.additionalPriceCents(arrangement.priceCents), licensedOn };
  }
  return { state: "AVAILABLE", priceCents: arrangement.priceCents, licensedOn };
}

/** Per-player view of one arrangement for the product page's "For: ▼" selector. */
export async function arrangementStateByPlayer(ctx: ShopPlayerContext, arrangement: { id: string; priceCents: number }) {
  const db = shopDb();
  const rows = await db.registeredPlayer.findMany({ where: { id: { in: ctx.players.map((p) => p.id) } }, select: { id: true, playerTypeId: true } });
  return Promise.all(ctx.players.map(async (p) => {
    const typeId = rows.find((r) => r.id === p.id)!.playerTypeId;
    const compat = await compatibleArrangementIds(typeId, [arrangement.id]);
    const licensedHere = (ctx.licensedOn.get(arrangement.id) ?? []).some((x) => x.id === p.id);
    const incompatible = compat !== null && !compat.has(arrangement.id);
    return {
      player: p,
      state: licensedHere ? "LICENSED" as const : incompatible ? "INCOMPATIBLE" as const : ctx.licensedAnywhere.has(arrangement.id) ? "ADDITIONAL" as const : "AVAILABLE" as const,
      priceCents: !licensedHere && ctx.licensedAnywhere.has(arrangement.id) ? ctx.additionalPriceCents(arrangement.priceCents) : arrangement.priceCents,
    };
  }));
}

export type BundleQuote = {
  playerId: string | null;
  available: boolean;
  reason: "ALREADY_OWNED" | "INCOMPATIBLE" | "UNAVAILABLE" | "PLAYER_REQUIRED" | null;
  chargedCents: number;
  retailValueCents: number;
  itemCount: number;
  alreadyLicensed: number;
  willAdd: number;
  incompatible: number;
  additionalPlayer: number;
  /** arrangementId → what this player pays for it inside the collection. */
  allocations: Record<string, number>;
  pricing: CartPricingResult;
};

/**
 * "Complete this collection for Living Room Piano": the server-side price of a bundle for
 * one target, computed by the same pricing as the cart.
 */
export async function bundleQuoteForPlayer(customerId: string, bundleId: string, playerId: string | null): Promise<BundleQuote> {
  const line: PricingCartLine = { cartItemId: "quote", type: "BUNDLE", bundleId, lastSeenPriceCents: 0, targetPlayerId: playerId };
  const { pricing } = await priceLines(customerId, DEFAULT_CURRENCY, [line]);
  const priced = pricing.lines[0];
  const excluded = pricing.excluded[0];
  return {
    playerId,
    available: !!priced,
    reason: priced ? null : excluded?.reason === "ALREADY_OWNED" || excluded?.reason === "INCOMPATIBLE" || excluded?.reason === "PLAYER_REQUIRED" ? excluded.reason : "UNAVAILABLE",
    chargedCents: priced?.chargedCents ?? 0,
    retailValueCents: priced?.retailValueCents ?? 0,
    itemCount: priced?.bundle?.itemCount ?? 0,
    alreadyLicensed: priced?.bundle?.ownedCount ?? 0,
    willAdd: priced?.allocations.length ?? 0,
    incompatible: priced?.bundle?.incompatibleCount ?? 0,
    additionalPlayer: priced?.bundle?.additionalPlayerCount ?? 0,
    allocations: Object.fromEntries((priced?.allocations ?? []).map((a) => [a.arrangementId, a.allocatedCents])),
    pricing,
  };
}
