/**
 * Complete-the-collection bundle pricing.
 *
 * 1. The bundle price is allocated across *all* current published items in proportion to each
 *    item's normal retail price (largest-remainder method, so allocations always sum to the
 *    bundle price exactly).
 * 2. Items the customer already owns (ACTIVE entitlement) — or that another line in the same
 *    cart already covers — are excluded.
 * 3. The customer pays only the allocations of the remaining items.
 *
 * Rounding is deterministic: floor every share, then hand the leftover cents one by one to the
 * items with the largest fractional remainder; ties go to the earlier bundle position.
 */

export type BundleAllocationInput = {
  bundlePriceCents: number;
  /** Current published items in bundle order. */
  items: ReadonlyArray<{ arrangementId: string; retailCents: number }>;
  /** Arrangements to exclude (already owned / covered elsewhere). */
  excludedArrangementIds: ReadonlySet<string>;
};

export type BundleItemAllocation = {
  arrangementId: string;
  position: number;
  retailCents: number;
  /** Share of the full bundle price, whether or not it is charged. */
  allocatedCents: number;
  excluded: boolean;
};

export type BundleAllocationResult = {
  allocations: BundleItemAllocation[];
  /** Sum of normal retail of all items. */
  retailTotalCents: number;
  /** Retail value of the items that will actually be acquired. */
  payableRetailCents: number;
  /** What the customer pays for this bundle line. */
  payableCents: number;
  ownedOrCoveredCount: number;
  itemCount: number;
};

export class BundleAllocationError extends Error {
  constructor(public readonly code: "EMPTY_BUNDLE" | "ALREADY_OWNED" | "INVALID_INPUT", message: string) {
    super(message);
  }
}

/** Splits `total` across `weights` proportionally; result always sums to `total`. */
export function allocateProportionally(total: number, weights: readonly number[]): number[] {
  if (!Number.isSafeInteger(total) || total < 0) throw new BundleAllocationError("INVALID_INPUT", "total must be non-negative cents");
  if (weights.length === 0) return [];
  if (weights.some((w) => !Number.isSafeInteger(w) || w < 0)) {
    throw new BundleAllocationError("INVALID_INPUT", "weights must be non-negative integers");
  }
  const weightSum = weights.reduce((a, b) => a + b, 0);
  // All-zero retail values: split evenly.
  const effective = weightSum === 0 ? weights.map(() => 1) : weights;
  const sum = weightSum === 0 ? weights.length : weightSum;

  // BigInt keeps total * weight exact even for very large catalogs.
  const bigTotal = BigInt(total);
  const bigSum = BigInt(sum);
  const floors: number[] = [];
  const remainders: bigint[] = [];
  for (const w of effective) {
    const numerator = bigTotal * BigInt(w);
    floors.push(Number(numerator / bigSum));
    remainders.push(numerator % bigSum);
  }
  let leftover = total - floors.reduce((a, b) => a + b, 0);
  const order = effective
    .map((_, i) => i)
    .sort((a, b) => (remainders[b]! > remainders[a]! ? 1 : remainders[b]! < remainders[a]! ? -1 : a - b));
  for (const i of order) {
    if (leftover <= 0) break;
    floors[i]! += 1;
    leftover -= 1;
  }
  return floors;
}

export function allocateBundle(input: BundleAllocationInput): BundleAllocationResult {
  const { bundlePriceCents, items, excludedArrangementIds } = input;
  if (items.length === 0) throw new BundleAllocationError("EMPTY_BUNDLE", "Bundle has no published items");

  const shares = allocateProportionally(
    bundlePriceCents,
    items.map((i) => i.retailCents),
  );

  const allocations: BundleItemAllocation[] = items.map((item, position) => ({
    arrangementId: item.arrangementId,
    position,
    retailCents: item.retailCents,
    allocatedCents: shares[position]!,
    excluded: excludedArrangementIds.has(item.arrangementId),
  }));

  const payable = allocations.filter((a) => !a.excluded);
  if (payable.length === 0) {
    throw new BundleAllocationError("ALREADY_OWNED", "Every arrangement in this bundle is already owned");
  }

  return {
    allocations,
    retailTotalCents: items.reduce((a, i) => a + i.retailCents, 0),
    payableRetailCents: payable.reduce((a, i) => a + i.retailCents, 0),
    payableCents: payable.reduce((a, i) => a + i.allocatedCents, 0),
    ownedOrCoveredCount: allocations.length - payable.length,
    itemCount: allocations.length,
  };
}
