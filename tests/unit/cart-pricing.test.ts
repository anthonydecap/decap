import { describe, expect, it } from "vitest";
import { canonicalPricingString, priceCart, type PricingCatalogArrangement, type PricingCatalogBundle } from "@/modules/shop/domain/cart-pricing";

const arr = (id: string, priceCents: number, published = true): PricingCatalogArrangement => ({
  id, sku: id.toUpperCase(), title: `Title ${id}`, published, priceCents, currency: "EUR",
});
const A = arr("a", 1000);
const B = arr("b", 1500);
const C = arr("c", 2500);
const D = arr("d", 800);
const arrangements = new Map([A, B, C, D].map((x) => [x.id, x]));

const bundle = (id: string, priceCents: number, members: PricingCatalogArrangement[], published = true): PricingCatalogBundle => ({
  id, sku: id.toUpperCase(), title: `Bundle ${id}`, published, priceCents, currency: "EUR",
  items: members.map((m) => ({ arrangementId: m.id, sku: m.sku, title: m.title, retailCents: m.priceCents })),
});
const X = bundle("x", 3000, [A, B, C]);
const Y = bundle("y", 2000, [C, D]);
const bundles = new Map([X, Y].map((b) => [b.id, b]));

const line = {
  arr: (id: string, seen: number) => ({ cartItemId: `ci-${id}`, type: "ARRANGEMENT" as const, arrangementId: id, lastSeenPriceCents: seen }),
  bun: (id: string, seen: number) => ({ cartItemId: `ci-${id}`, type: "BUNDLE" as const, bundleId: id, lastSeenPriceCents: seen }),
};

const price = (lines: Parameters<typeof priceCart>[0]["lines"], owned: string[] = []) =>
  priceCart({ currency: "EUR", lines, arrangements, bundles, ownedArrangementIds: new Set(owned) });

describe("priceCart", () => {
  it("prices individual arrangements at list price", () => {
    const r = price([line.arr("a", 1000), line.arr("d", 800)]);
    expect(r.totalCents).toBe(1800);
    expect(r.discountCents).toBe(0);
    expect(r.notices).toEqual([]);
  });

  it("does not charge an arrangement that a bundle in the cart already includes", () => {
    const r = price([line.arr("a", 1000), line.bun("x", 3000)]);
    expect(r.totalCents).toBe(3000);
    expect(r.lines.map((l) => l.refId)).toEqual(["x"]);
    expect(r.excluded).toEqual([
      expect.objectContaining({ refId: "a", reason: "INCLUDED_IN_BUNDLE", coveredByBundleId: "x", removeFromCart: false }),
    ]);
  });

  it("never charges an overlapping arrangement twice across bundles", () => {
    // X (A,B,C) then Y (C,D): C is delivered by X, so Y charges only D's allocation.
    const r = price([line.bun("x", 3000), line.bun("y", 2000)]);
    const y = r.lines.find((l) => l.refId === "y")!;
    expect(y.allocations.map((a) => a.arrangementId)).toEqual(["d"]);
    const allocated = r.lines.flatMap((l) => l.allocations.map((a) => a.arrangementId));
    expect(new Set(allocated).size).toBe(allocated.length);
  });

  it("removes already-owned arrangements and charges partial bundles", () => {
    const r = price([line.arr("a", 1000), line.bun("x", 3000)], ["a"]);
    expect(r.excluded).toEqual([expect.objectContaining({ refId: "a", reason: "ALREADY_OWNED", removeFromCart: true })]);
    const x = r.lines[0]!;
    expect(x.chargedCents).toBe(2400); // 900 + 1500 of 3000 allocated over (1000,1500,2500)
    expect(r.notices).toContainEqual(expect.objectContaining({ code: "PARTIALLY_OWNED", ownedCount: 1, itemCount: 3 }));
  });

  it("drops a bundle the customer fully owns", () => {
    const r = price([line.bun("y", 2000)], ["c", "d"]);
    expect(r.lines).toEqual([]);
    expect(r.excluded[0]).toMatchObject({ reason: "ALREADY_OWNED", removeFromCart: true });
  });

  it("drops unpublished items as UNAVAILABLE", () => {
    const hidden = new Map([...arrangements, ["z", arr("z", 500, false)]]);
    const r = priceCart({ currency: "EUR", lines: [line.arr("z", 500)], arrangements: hidden, bundles, ownedArrangementIds: new Set() });
    expect(r.excluded[0]).toMatchObject({ reason: "UNAVAILABLE", removeFromCart: true });
  });

  it("explains price changes", () => {
    const r = price([line.arr("b", 1200)]);
    expect(r.notices).toContainEqual({ code: "PRICE_CHANGED", cartItemId: "ci-b", title: "Title b", previousCents: 1200, currentCents: 1500 });
  });

  it("keeps cart order in the output and a stable canonical string", () => {
    const r1 = price([line.arr("d", 800), line.bun("x", 3000)]);
    expect(r1.lines.map((l) => l.refId)).toEqual(["d", "x"]);
    const r2 = price([line.arr("d", 800), line.bun("x", 3000)]);
    expect(canonicalPricingString(r1)).toBe(canonicalPricingString(r2));
  });
});
