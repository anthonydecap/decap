import { describe, expect, it } from "vitest";
import { priceCart, type PricingCatalogArrangement, type PricingCatalogBundle, type PricingTarget } from "@/modules/shop/domain/cart-pricing";
import { additionalPlayerPriceCents, DEFAULT_MUSIC_POLICY, normaliseMusicPolicy } from "@/modules/shop/domain/music-policy";

const arr = (id: string, priceCents: number): PricingCatalogArrangement => ({ id, sku: id.toUpperCase(), title: id, published: true, priceCents, currency: "EUR" });
const target = (playerId: string | null, licensed: string[] = [], compatible: string[] | null = null, eligible = true): PricingTarget => ({
  playerId, label: playerId ?? "later", eligible, licensedArrangementIds: new Set(licensed), compatibleArrangementIds: compatible ? new Set(compatible) : null,
});

describe("additional-player price", () => {
  it("never exceeds the normal price and rounds to the cent", () => {
    expect(additionalPlayerPriceCents(895, { strategy: "NO_DISCOUNT", percentageBps: 5000, fixedPriceCents: 395 })).toBe(895);
    expect(additionalPlayerPriceCents(895, { strategy: "ADDITIONAL_PERCENTAGE", percentageBps: 5000, fixedPriceCents: 0 })).toBe(448);
    expect(additionalPlayerPriceCents(895, { strategy: "ADDITIONAL_FIXED_PRICE", percentageBps: 0, fixedPriceCents: 395 })).toBe(395);
    expect(additionalPlayerPriceCents(200, { strategy: "ADDITIONAL_FIXED_PRICE", percentageBps: 0, fixedPriceCents: 395 })).toBe(200);
  });

  it("normalises stored policies onto safe defaults", () => {
    expect(normaliseMusicPolicy(null)).toEqual(DEFAULT_MUSIC_POLICY);
    const p = normaliseMusicPolicy({ resalePolicy: "NONSENSE", additionalPlayer: { strategy: "ADDITIONAL_PERCENTAGE", percentageBps: 99999 } });
    expect(p.resalePolicy).toBe("ADMIN_DECIDES");
    expect(p.additionalPlayer).toEqual({ strategy: "ADDITIONAL_PERCENTAGE", percentageBps: 5000, fixedPriceCents: 395 });
  });
});

describe("player-aware cart pricing", () => {
  const arrangements = new Map([["a", arr("a", 1000)], ["b", arr("b", 2000)], ["c", arr("c", 3000)]]);
  const bundle: PricingCatalogBundle = {
    id: "bun", sku: "BUN", title: "Collection", published: true, priceCents: 3000, currency: "EUR",
    items: [{ arrangementId: "a", sku: "A", title: "a", retailCents: 1000 }, { arrangementId: "b", sku: "B", title: "b", retailCents: 2000 }, { arrangementId: "c", sku: "C", title: "c", retailCents: 3000 }],
  };
  const bundles = new Map([["bun", bundle]]);
  const half = (c: number) => Math.round(c / 2);

  it("excludes what the target already has, discounts what another player has, refuses incompatible items", () => {
    const r = priceCart({
      currency: "EUR", arrangements, bundles, ownedArrangementIds: new Set(),
      lines: [
        { cartItemId: "1", type: "ARRANGEMENT", arrangementId: "a", lastSeenPriceCents: 1000, targetPlayerId: "p1" },
        { cartItemId: "2", type: "ARRANGEMENT", arrangementId: "b", lastSeenPriceCents: 2000, targetPlayerId: "p1" },
        { cartItemId: "3", type: "ARRANGEMENT", arrangementId: "c", lastSeenPriceCents: 3000, targetPlayerId: "p1" },
      ],
      targets: new Map([["p1", target("p1", ["a"], ["a", "b"])]]),
      customerLicensedArrangementIds: new Set(["a", "b"]),
      additionalPriceCents: half,
    });
    expect(r.excluded.map((e) => [e.cartItemId, e.reason])).toEqual([["1", "ALREADY_OWNED"], ["3", "INCOMPATIBLE"]]);
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0]).toMatchObject({ refId: "b", targetPlayerId: "p1", chargedCents: 1000 });
    expect(r.lines[0]!.allocations[0]!.additionalPlayer).toBe(true);
  });

  it("prices a collection per player, capping additional copies at their additional price", () => {
    const r = priceCart({
      currency: "EUR", arrangements, bundles, ownedArrangementIds: new Set(),
      lines: [
        { cartItemId: "x", type: "BUNDLE", bundleId: "bun", lastSeenPriceCents: 0, targetPlayerId: "p1" },
        { cartItemId: "y", type: "BUNDLE", bundleId: "bun", lastSeenPriceCents: 0, targetPlayerId: "p2" },
      ],
      targets: new Map([["p1", target("p1", ["c"])], ["p2", target("p2")]]),
      customerLicensedArrangementIds: new Set(["c"]),
      additionalPriceCents: half,
    });
    const p1 = r.lines.find((l) => l.targetPlayerId === "p1")!;
    const p2 = r.lines.find((l) => l.targetPlayerId === "p2")!;
    // p1 pays the shares of a (500) and b (1000) only.
    expect(p1.chargedCents).toBe(1500);
    // p2: a and b were acquired for p1 in this cart, c is on p1 already: all additional, capped at half price.
    expect(p2.allocations.every((a) => a.additionalPlayer)).toBe(true);
    expect(p2.chargedCents).toBe(Math.min(500, 500) + Math.min(1000, 1000) + Math.min(1500, 1500));
    expect(p2.bundle!.additionalPlayerCount).toBe(3);
  });

  it("drops lines for a player that is not eligible and holds unassigned lines for a choice", () => {
    const r = priceCart({
      currency: "EUR", arrangements, bundles, ownedArrangementIds: new Set(),
      lines: [
        { cartItemId: "1", type: "ARRANGEMENT", arrangementId: "a", lastSeenPriceCents: 1000, targetPlayerId: "forged" },
        { cartItemId: "2", type: "ARRANGEMENT", arrangementId: "b", lastSeenPriceCents: 2000, targetPlayerId: null },
      ],
      targets: new Map([["unassigned", target(null, [], null, false)]]),
    });
    expect(r.lines).toHaveLength(0);
    expect(r.excluded.map((e) => [e.cartItemId, e.reason, e.removeFromCart])).toEqual([["1", "PLAYER_UNAVAILABLE", true], ["2", "PLAYER_REQUIRED", false]]);
  });
});
