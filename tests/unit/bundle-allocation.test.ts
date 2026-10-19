import { describe, expect, it } from "vitest";
import { allocateBundle, allocateProportionally, BundleAllocationError } from "@/modules/shop/domain/bundle-allocation";

const items = (...prices: number[]) => prices.map((retailCents, i) => ({ arrangementId: `a${i}`, retailCents }));

describe("allocateProportionally", () => {
  it("always sums exactly to the total", () => {
    for (const total of [1, 99, 1000, 2999, 12345]) {
      for (const weights of [[1, 1, 1], [999, 1499, 2499], [7, 0, 13, 13], [1]]) {
        const out = allocateProportionally(total, weights);
        expect(out.reduce((a, b) => a + b, 0)).toBe(total);
      }
    }
  });

  it("gives leftover cents to the largest remainders, ties to the earlier position", () => {
    // 100 split three ways: 33.33 each → floors 33,33,33 and one leftover cent to index 0.
    expect(allocateProportionally(100, [1, 1, 1])).toEqual([34, 33, 33]);
    // Deterministic across calls.
    expect(allocateProportionally(100, [1, 1, 1])).toEqual(allocateProportionally(100, [1, 1, 1]));
  });

  it("splits evenly when all weights are zero", () => {
    expect(allocateProportionally(10, [0, 0, 0])).toEqual([4, 3, 3]);
  });

  it("rejects negative or fractional input", () => {
    expect(() => allocateProportionally(-1, [1])).toThrow(BundleAllocationError);
    expect(() => allocateProportionally(10, [1.5])).toThrow(BundleAllocationError);
  });
});

describe("allocateBundle (complete-the-collection)", () => {
  it("charges the full bundle price when nothing is owned", () => {
    const r = allocateBundle({ bundlePriceCents: 3000, items: items(1000, 1500, 2500), excludedArrangementIds: new Set() });
    expect(r.payableCents).toBe(3000);
    expect(r.retailTotalCents).toBe(5000);
    expect(r.allocations.map((a) => a.allocatedCents)).toEqual([600, 900, 1500]);
  });

  it("charges only the allocated share of missing items", () => {
    const r = allocateBundle({ bundlePriceCents: 3000, items: items(1000, 1500, 2500), excludedArrangementIds: new Set(["a2"]) });
    expect(r.payableCents).toBe(1500); // 600 + 900
    expect(r.payableRetailCents).toBe(2500);
    expect(r.ownedOrCoveredCount).toBe(1);
  });

  it("never charges more than buying the missing items separately", () => {
    const r = allocateBundle({ bundlePriceCents: 1999, items: items(999, 999, 999), excludedArrangementIds: new Set(["a0", "a1"]) });
    expect(r.payableCents).toBeLessThanOrEqual(999);
  });

  it("rounds deterministically with awkward prices", () => {
    const r = allocateBundle({ bundlePriceCents: 1000, items: items(333, 333, 334), excludedArrangementIds: new Set() });
    expect(r.allocations.reduce((s, a) => s + a.allocatedCents, 0)).toBe(1000);
    expect(r.allocations.map((a) => a.allocatedCents)).toEqual([333, 333, 334]);
  });

  it("rejects a fully owned bundle as ALREADY_OWNED", () => {
    try {
      allocateBundle({ bundlePriceCents: 1000, items: items(500, 700), excludedArrangementIds: new Set(["a0", "a1"]) });
      throw new Error("expected failure");
    } catch (e) {
      expect(e).toBeInstanceOf(BundleAllocationError);
      expect((e as BundleAllocationError).code).toBe("ALREADY_OWNED");
    }
  });

  it("rejects an empty bundle", () => {
    expect(() => allocateBundle({ bundlePriceCents: 1000, items: [], excludedArrangementIds: new Set() })).toThrow(/no published items/);
  });
});
