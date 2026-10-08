/**
 * Server-side cart pricing. Pure: callers load catalog + ownership, this decides what is
 * payable. The result is what checkout snapshots onto the order — client prices are never used.
 *
 * Dedupe rules (customer-friendly and deterministic):
 *  - Bundles are priced first, in the order they were added. Each bundle excludes items the
 *    customer owns AND items already covered by an earlier bundle line, so overlapping
 *    collections are never charged twice.
 *  - An individual arrangement already covered by a bundle line is not charged separately
 *    (kept in the cart, shown as "included in <bundle>").
 *  - Anything the customer already owns, or that is no longer published, is dropped with an
 *    explanation.
 */
import { allocateBundle, BundleAllocationError } from "./bundle-allocation";

export type PricingCatalogArrangement = {
  id: string;
  sku: string;
  title: string;
  published: boolean;
  priceCents: number;
  currency: string;
};

export type PricingCatalogBundle = {
  id: string;
  sku: string;
  title: string;
  published: boolean;
  priceCents: number;
  currency: string;
  /** Published member arrangements only, in bundle order. */
  items: ReadonlyArray<{ arrangementId: string; sku: string; title: string; retailCents: number }>;
};

export type PricingCartLine =
  | { cartItemId: string; type: "ARRANGEMENT"; arrangementId: string; lastSeenPriceCents: number }
  | { cartItemId: string; type: "BUNDLE"; bundleId: string; lastSeenPriceCents: number };

export type PricedAllocation = {
  arrangementId: string;
  sku: string;
  title: string;
  retailValueCents: number;
  allocatedCents: number;
};

export type PricedLine = {
  cartItemId: string;
  type: "ARRANGEMENT" | "BUNDLE";
  refId: string;
  sku: string;
  title: string;
  retailValueCents: number;
  chargedCents: number;
  allocations: PricedAllocation[];
  bundle?: {
    priceCents: number;
    retailTotalCents: number;
    itemCount: number;
    excludedArrangementIds: string[];
    ownedCount: number;
    coveredByOtherLinesCount: number;
  };
};

export type ExcludedReason =
  | "ALREADY_OWNED"
  | "UNAVAILABLE"
  | "CURRENCY_MISMATCH"
  | "INCLUDED_IN_BUNDLE";

export type ExcludedLine = {
  cartItemId: string;
  type: "ARRANGEMENT" | "BUNDLE";
  refId: string;
  title: string;
  reason: ExcludedReason;
  /** For INCLUDED_IN_BUNDLE: the bundle line that covers it. */
  coveredByBundleId?: string;
  coveredByBundleTitle?: string;
  /** Whether the line should be removed from the stored cart (vs. kept but not charged). */
  removeFromCart: boolean;
};

export type PricingNotice =
  | { code: "PRICE_CHANGED"; cartItemId: string; title: string; previousCents: number; currentCents: number }
  | { code: "PARTIALLY_OWNED"; cartItemId: string; title: string; ownedCount: number; itemCount: number };

export type CartPricingResult = {
  currency: string;
  lines: PricedLine[];
  excluded: ExcludedLine[];
  notices: PricingNotice[];
  retailTotalCents: number;
  totalCents: number;
  discountCents: number;
};

export type CartPricingInput = {
  currency: string;
  lines: readonly PricingCartLine[];
  arrangements: ReadonlyMap<string, PricingCatalogArrangement>;
  bundles: ReadonlyMap<string, PricingCatalogBundle>;
  ownedArrangementIds: ReadonlySet<string>;
};

export function priceCart(input: CartPricingInput): CartPricingResult {
  const { currency, arrangements, bundles, ownedArrangementIds } = input;
  const lines: PricedLine[] = [];
  const excluded: ExcludedLine[] = [];
  const notices: PricingNotice[] = [];
  // arrangementId → bundle line that will deliver it in this order
  const coveredBy = new Map<string, { bundleId: string; title: string }>();

  const bundleLines = input.lines.filter((l): l is Extract<PricingCartLine, { type: "BUNDLE" }> => l.type === "BUNDLE");
  const arrangementLines = input.lines.filter(
    (l): l is Extract<PricingCartLine, { type: "ARRANGEMENT" }> => l.type === "ARRANGEMENT",
  );

  for (const line of bundleLines) {
    const bundle = bundles.get(line.bundleId);
    if (!bundle || !bundle.published || bundle.items.length === 0) {
      excluded.push({
        cartItemId: line.cartItemId, type: "BUNDLE", refId: line.bundleId,
        title: bundle?.title ?? "Collection", reason: "UNAVAILABLE", removeFromCart: true,
      });
      continue;
    }
    if (bundle.currency !== currency) {
      excluded.push({
        cartItemId: line.cartItemId, type: "BUNDLE", refId: bundle.id, title: bundle.title,
        reason: "CURRENCY_MISMATCH", removeFromCart: true,
      });
      continue;
    }
    const exclude = new Set<string>();
    let ownedCount = 0;
    let coveredCount = 0;
    for (const item of bundle.items) {
      if (ownedArrangementIds.has(item.arrangementId)) {
        exclude.add(item.arrangementId);
        ownedCount++;
      } else if (coveredBy.has(item.arrangementId)) {
        exclude.add(item.arrangementId);
        coveredCount++;
      }
    }

    let result;
    try {
      result = allocateBundle({
        bundlePriceCents: bundle.priceCents,
        items: bundle.items.map((i) => ({ arrangementId: i.arrangementId, retailCents: i.retailCents })),
        excludedArrangementIds: exclude,
      });
    } catch (e) {
      if (e instanceof BundleAllocationError && e.code === "ALREADY_OWNED") {
        const fullyOwned = ownedCount === bundle.items.length;
        excluded.push({
          cartItemId: line.cartItemId, type: "BUNDLE", refId: bundle.id, title: bundle.title,
          reason: fullyOwned ? "ALREADY_OWNED" : "INCLUDED_IN_BUNDLE",
          removeFromCart: fullyOwned,
          ...(fullyOwned ? {} : firstCoveringBundle(bundle, coveredBy)),
        });
        continue;
      }
      throw e;
    }

    const byId = new Map(bundle.items.map((i) => [i.arrangementId, i]));
    const allocations: PricedAllocation[] = result.allocations
      .filter((a) => !a.excluded)
      .map((a) => {
        const meta = byId.get(a.arrangementId)!;
        return {
          arrangementId: a.arrangementId,
          sku: meta.sku,
          title: meta.title,
          retailValueCents: a.retailCents,
          allocatedCents: a.allocatedCents,
        };
      });
    for (const a of allocations) coveredBy.set(a.arrangementId, { bundleId: bundle.id, title: bundle.title });

    lines.push({
      cartItemId: line.cartItemId,
      type: "BUNDLE",
      refId: bundle.id,
      sku: bundle.sku,
      title: bundle.title,
      retailValueCents: result.payableRetailCents,
      chargedCents: result.payableCents,
      allocations,
      bundle: {
        priceCents: bundle.priceCents,
        retailTotalCents: result.retailTotalCents,
        itemCount: result.itemCount,
        excludedArrangementIds: [...exclude].sort(),
        ownedCount,
        coveredByOtherLinesCount: coveredCount,
      },
    });
    if (ownedCount > 0) {
      notices.push({
        code: "PARTIALLY_OWNED", cartItemId: line.cartItemId, title: bundle.title,
        ownedCount, itemCount: bundle.items.length,
      });
    }
    if (line.lastSeenPriceCents !== result.payableCents) {
      notices.push({
        code: "PRICE_CHANGED", cartItemId: line.cartItemId, title: bundle.title,
        previousCents: line.lastSeenPriceCents, currentCents: result.payableCents,
      });
    }
  }

  for (const line of arrangementLines) {
    const arrangement = arrangements.get(line.arrangementId);
    if (!arrangement || !arrangement.published) {
      excluded.push({
        cartItemId: line.cartItemId, type: "ARRANGEMENT", refId: line.arrangementId,
        title: arrangement?.title ?? "Arrangement", reason: "UNAVAILABLE", removeFromCart: true,
      });
      continue;
    }
    if (arrangement.currency !== currency) {
      excluded.push({
        cartItemId: line.cartItemId, type: "ARRANGEMENT", refId: arrangement.id, title: arrangement.title,
        reason: "CURRENCY_MISMATCH", removeFromCart: true,
      });
      continue;
    }
    if (ownedArrangementIds.has(arrangement.id)) {
      excluded.push({
        cartItemId: line.cartItemId, type: "ARRANGEMENT", refId: arrangement.id, title: arrangement.title,
        reason: "ALREADY_OWNED", removeFromCart: true,
      });
      continue;
    }
    const cover = coveredBy.get(arrangement.id);
    if (cover) {
      excluded.push({
        cartItemId: line.cartItemId, type: "ARRANGEMENT", refId: arrangement.id, title: arrangement.title,
        reason: "INCLUDED_IN_BUNDLE", coveredByBundleId: cover.bundleId, coveredByBundleTitle: cover.title,
        removeFromCart: false,
      });
      continue;
    }
    lines.push({
      cartItemId: line.cartItemId,
      type: "ARRANGEMENT",
      refId: arrangement.id,
      sku: arrangement.sku,
      title: arrangement.title,
      retailValueCents: arrangement.priceCents,
      chargedCents: arrangement.priceCents,
      allocations: [{
        arrangementId: arrangement.id,
        sku: arrangement.sku,
        title: arrangement.title,
        retailValueCents: arrangement.priceCents,
        allocatedCents: arrangement.priceCents,
      }],
    });
    if (line.lastSeenPriceCents !== arrangement.priceCents) {
      notices.push({
        code: "PRICE_CHANGED", cartItemId: line.cartItemId, title: arrangement.title,
        previousCents: line.lastSeenPriceCents, currentCents: arrangement.priceCents,
      });
    }
  }

  // Present lines in the customer's cart order.
  const order = new Map(input.lines.map((l, i) => [l.cartItemId, i]));
  lines.sort((a, b) => order.get(a.cartItemId)! - order.get(b.cartItemId)!);
  excluded.sort((a, b) => order.get(a.cartItemId)! - order.get(b.cartItemId)!);

  const retailTotalCents = lines.reduce((s, l) => s + l.retailValueCents, 0);
  const totalCents = lines.reduce((s, l) => s + l.chargedCents, 0);
  return {
    currency,
    lines,
    excluded,
    notices,
    retailTotalCents,
    totalCents,
    discountCents: Math.max(retailTotalCents - totalCents, 0),
  };
}

function firstCoveringBundle(
  bundle: PricingCatalogBundle,
  coveredBy: ReadonlyMap<string, { bundleId: string; title: string }>,
): { coveredByBundleId?: string; coveredByBundleTitle?: string } {
  for (const item of bundle.items) {
    const c = coveredBy.get(item.arrangementId);
    if (c) return { coveredByBundleId: c.bundleId, coveredByBundleTitle: c.title };
  }
  return {};
}

/** Canonical string of everything that affects what is charged; hashed to detect drift. */
export function canonicalPricingString(result: CartPricingResult): string {
  return JSON.stringify({
    c: result.currency,
    t: result.totalCents,
    l: result.lines.map((l) => [
      l.type,
      l.refId,
      l.chargedCents,
      l.allocations.map((a) => [a.arrangementId, a.allocatedCents, a.retailValueCents]),
    ]),
  });
}
