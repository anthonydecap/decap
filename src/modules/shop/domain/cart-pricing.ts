/**
 * Server-side cart pricing. Pure: callers load catalog + ownership, this decides what is
 * payable. The result is what checkout snapshots onto the order — client prices are never used.
 *
 * Phase 4: music is licensed per registered player. Music lines carry a target player
 * (or null = "assign later"); the cart is priced per target, in order of first appearance:
 *  - "owned" means an ACTIVE license on THAT player (or an unassigned license for the
 *    assign-later group), never account-wide ownership;
 *  - an arrangement the customer already licenses on another player, or that an earlier
 *    target in this same cart acquires, is sold at the additional-player price;
 *  - arrangements not compatible with the target's player type are never charged.
 *
 * Dedupe rules within one target (customer-friendly and deterministic):
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

export type PricingCatalogSoftware = {
  id: string;
  sku: string;
  title: string;
  /** ACTIVE product with a license price. */
  purchasable: boolean;
  priceCents: number;
  currency: string;
};

export type PricingCartLine =
  | { cartItemId: string; type: "ARRANGEMENT"; arrangementId: string; lastSeenPriceCents: number; targetPlayerId?: string | null }
  | { cartItemId: string; type: "BUNDLE"; bundleId: string; lastSeenPriceCents: number; targetPlayerId?: string | null }
  | { cartItemId: string; type: "SOFTWARE_LICENSE"; softwareProductId: string; lastSeenPriceCents: number };

export type PricedAllocation = {
  arrangementId: string;
  sku: string;
  title: string;
  retailValueCents: number;
  allocatedCents: number;
  /** Sold at the additional-player price (already licensed on another player). */
  additionalPlayer?: boolean;
};

/** Key of the "assign later" target group. */
export const UNASSIGNED_TARGET = "unassigned";

export const targetKeyOf = (playerId: string | null | undefined) => playerId ?? UNASSIGNED_TARGET;

/** Everything pricing needs to know about one target player (or the assign-later group). */
export type PricingTarget = {
  playerId: string | null;
  label: string;
  /** Owned by the customer, ACTIVE and able to receive music (or assign-later is allowed). */
  eligible: boolean;
  /** Arrangements with an ACTIVE license on this player (assign-later: UNASSIGNED licenses). */
  licensedArrangementIds: ReadonlySet<string>;
  /** Arrangements compatible with the player's type. null = no restriction. */
  compatibleArrangementIds: ReadonlySet<string> | null;
};

export type PricedLine = {
  cartItemId: string;
  type: "ARRANGEMENT" | "BUNDLE" | "SOFTWARE_LICENSE";
  refId: string;
  /** Music lines: the player that receives the licenses (null = assign later). */
  targetPlayerId?: string | null;
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
    incompatibleCount?: number;
    additionalPlayerCount?: number;
  };
};

export type ExcludedReason =
  /** Already licensed for the target player (or already bought for later assignment). */
  | "ALREADY_OWNED"
  | "UNAVAILABLE"
  | "CURRENCY_MISMATCH"
  | "INCLUDED_IN_BUNDLE"
  /** Not compatible with the target player's type. */
  | "INCOMPATIBLE"
  /** The target player is no longer eligible (retired, not the customer's, no music library). */
  | "PLAYER_UNAVAILABLE"
  /** No player chosen yet and "assign later" is not available: the customer must pick one. */
  | "PLAYER_REQUIRED";

export type ExcludedLine = {
  cartItemId: string;
  type: "ARRANGEMENT" | "BUNDLE" | "SOFTWARE_LICENSE";
  refId: string;
  targetPlayerId?: string | null;
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
  /**
   * Legacy single-target ownership, used when `targets` is not given (anonymous carts and
   * pure-domain callers): every music line is priced against this set.
   */
  ownedArrangementIds: ReadonlySet<string>;
  /** Software products for SOFTWARE_LICENSE lines (optional for music-only callers). */
  software?: ReadonlyMap<string, PricingCatalogSoftware>;
  /** Player-aware pricing: one entry per target key (`targetKeyOf(playerId)`). */
  targets?: ReadonlyMap<string, PricingTarget>;
  /** Arrangements with a live license on any of the customer's players or unassigned. */
  customerLicensedArrangementIds?: ReadonlySet<string>;
  /** Price for an arrangement that is additional (already licensed on another player). */
  additionalPriceCents?: (retailCents: number) => number;
};

export function priceCart(input: CartPricingInput): CartPricingResult {
  const { currency } = input;
  const lines: PricedLine[] = [];
  const excluded: ExcludedLine[] = [];
  const notices: PricingNotice[] = [];
  const additionalPrice = input.additionalPriceCents ?? ((c: number) => c);

  // Group music lines by target, in order of first appearance.
  const groups = new Map<string, PricingCartLine[]>();
  for (const line of input.lines) {
    if (line.type === "SOFTWARE_LICENSE") continue;
    const key = input.targets ? targetKeyOf((line as { targetPlayerId?: string | null }).targetPlayerId) : UNASSIGNED_TARGET;
    groups.set(key, [...(groups.get(key) ?? []), line]);
  }
  // Arrangements this cart acquires for an earlier target: later targets get them as additional copies.
  const acquiredEarlier = new Set<string>();
  for (const [key, groupLines] of groups) {
    const target = input.targets?.get(key);
    if (input.targets && (!target || !target.eligible)) {
      // A forged / retired player drops its lines; "assign later" lines wait for a player choice.
      const needsChoice = key === UNASSIGNED_TARGET;
      for (const l of groupLines as Extract<PricingCartLine, { type: "ARRANGEMENT" | "BUNDLE" }>[]) {
        excluded.push({
          cartItemId: l.cartItemId, type: l.type, refId: l.type === "BUNDLE" ? l.bundleId : l.arrangementId,
          targetPlayerId: l.targetPlayerId ?? null,
          title: (l.type === "BUNDLE" ? input.bundles.get(l.bundleId)?.title : input.arrangements.get(l.arrangementId)?.title) ?? "Music",
          reason: needsChoice ? "PLAYER_REQUIRED" : "PLAYER_UNAVAILABLE", removeFromCart: !needsChoice,
        });
      }
      continue;
    }
    const owned = target ? target.licensedArrangementIds : input.ownedArrangementIds;
    const elsewhere = input.customerLicensedArrangementIds;
    const result = priceGroup({
      currency,
      lines: groupLines,
      arrangements: input.arrangements,
      bundles: input.bundles,
      owned,
      compatible: target?.compatibleArrangementIds ?? null,
      isAdditional: target
        ? (id) => !owned.has(id) && ((elsewhere?.has(id) ?? false) || acquiredEarlier.has(id))
        : () => false,
      additionalPrice,
      targetPlayerId: target ? target.playerId : undefined,
    });
    lines.push(...result.lines);
    excluded.push(...result.excluded);
    notices.push(...result.notices);
    for (const l of result.lines) for (const a of l.allocations) acquiredEarlier.add(a.arrangementId);
  }

  // Software licenses: priced at the product's license price; no allocations (not music).
  for (const line of input.lines) {
    if (line.type !== "SOFTWARE_LICENSE") continue;
    const p = input.software?.get(line.softwareProductId);
    if (!p || !p.purchasable || p.currency !== currency) {
      excluded.push({
        cartItemId: line.cartItemId, type: "SOFTWARE_LICENSE", refId: line.softwareProductId,
        title: p?.title ?? "Software license", reason: p && p.currency !== currency ? "CURRENCY_MISMATCH" : "UNAVAILABLE", removeFromCart: true,
      });
      continue;
    }
    lines.push({
      cartItemId: line.cartItemId, type: "SOFTWARE_LICENSE", refId: p.id, sku: p.sku, title: p.title,
      retailValueCents: p.priceCents, chargedCents: p.priceCents, allocations: [],
    });
    if (line.lastSeenPriceCents !== p.priceCents) {
      notices.push({ code: "PRICE_CHANGED", cartItemId: line.cartItemId, title: p.title, previousCents: line.lastSeenPriceCents, currentCents: p.priceCents });
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

type GroupInput = {
  currency: string;
  lines: readonly PricingCartLine[];
  arrangements: ReadonlyMap<string, PricingCatalogArrangement>;
  bundles: ReadonlyMap<string, PricingCatalogBundle>;
  owned: ReadonlySet<string>;
  compatible: ReadonlySet<string> | null;
  isAdditional: (arrangementId: string) => boolean;
  additionalPrice: (retailCents: number) => number;
  /** undefined = legacy (no player targeting); null = assign later. */
  targetPlayerId: string | null | undefined;
};

/** Prices the music lines for ONE target player. */
function priceGroup(input: GroupInput) {
  const { currency, arrangements, bundles, owned: ownedArrangementIds, compatible, isAdditional, additionalPrice } = input;
  const target = input.targetPlayerId === undefined ? {} : { targetPlayerId: input.targetPlayerId };
  const lines: PricedLine[] = [];
  const excluded: ExcludedLine[] = [];
  const notices: PricingNotice[] = [];
  // arrangementId → bundle line that will deliver it in this order
  const coveredBy = new Map<string, { bundleId: string; title: string }>();
  const isIncompatible = (id: string) => compatible !== null && !compatible.has(id);

  const bundleLines = input.lines.filter((l): l is Extract<PricingCartLine, { type: "BUNDLE" }> => l.type === "BUNDLE");
  const arrangementLines = input.lines.filter(
    (l): l is Extract<PricingCartLine, { type: "ARRANGEMENT" }> => l.type === "ARRANGEMENT",
  );

  for (const line of bundleLines) {
    const bundle = bundles.get(line.bundleId);
    if (!bundle || !bundle.published || bundle.items.length === 0) {
      excluded.push({
        cartItemId: line.cartItemId, type: "BUNDLE", refId: line.bundleId, ...target,
        title: bundle?.title ?? "Collection", reason: "UNAVAILABLE", removeFromCart: true,
      });
      continue;
    }
    if (bundle.currency !== currency) {
      excluded.push({
        cartItemId: line.cartItemId, type: "BUNDLE", refId: bundle.id, title: bundle.title, ...target,
        reason: "CURRENCY_MISMATCH", removeFromCart: true,
      });
      continue;
    }
    const exclude = new Set<string>();
    let ownedCount = 0;
    let coveredCount = 0;
    let incompatibleCount = 0;
    for (const item of bundle.items) {
      if (ownedArrangementIds.has(item.arrangementId)) {
        exclude.add(item.arrangementId);
        ownedCount++;
      } else if (coveredBy.has(item.arrangementId)) {
        exclude.add(item.arrangementId);
        coveredCount++;
      } else if (isIncompatible(item.arrangementId)) {
        exclude.add(item.arrangementId);
        incompatibleCount++;
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
        // Nothing left to sell for this player. Covered by another line in this cart: keep it
        // (it becomes payable again if that line is removed). Otherwise drop it.
        const reason: ExcludedReason = coveredCount > 0
          ? "INCLUDED_IN_BUNDLE"
          : incompatibleCount === bundle.items.length ? "INCOMPATIBLE" : "ALREADY_OWNED";
        excluded.push({
          cartItemId: line.cartItemId, type: "BUNDLE", refId: bundle.id, title: bundle.title, ...target,
          reason,
          removeFromCart: coveredCount === 0,
          ...(coveredCount > 0 ? firstCoveringBundle(bundle, coveredBy) : {}),
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
        const additional = isAdditional(a.arrangementId);
        return {
          arrangementId: a.arrangementId,
          sku: meta.sku,
          title: meta.title,
          retailValueCents: a.retailCents,
          // An additional-player copy never costs more than its stand-alone additional price.
          allocatedCents: additional ? Math.min(a.allocatedCents, additionalPrice(a.retailCents)) : a.allocatedCents,
          ...(additional ? { additionalPlayer: true } : {}),
        };
      });
    for (const a of allocations) coveredBy.set(a.arrangementId, { bundleId: bundle.id, title: bundle.title });
    const additionalPlayerCount = allocations.filter((a) => a.additionalPlayer).length;
    const chargedCents = allocations.reduce((sum, a) => sum + a.allocatedCents, 0);

    lines.push({
      cartItemId: line.cartItemId,
      type: "BUNDLE",
      refId: bundle.id,
      ...target,
      sku: bundle.sku,
      title: bundle.title,
      retailValueCents: result.payableRetailCents,
      chargedCents,
      allocations,
      bundle: {
        priceCents: bundle.priceCents,
        retailTotalCents: result.retailTotalCents,
        itemCount: result.itemCount,
        excludedArrangementIds: [...exclude].sort(),
        ownedCount,
        coveredByOtherLinesCount: coveredCount,
        ...(incompatibleCount ? { incompatibleCount } : {}),
        ...(additionalPlayerCount ? { additionalPlayerCount } : {}),
      },
    });
    if (ownedCount > 0) {
      notices.push({
        code: "PARTIALLY_OWNED", cartItemId: line.cartItemId, title: bundle.title,
        ownedCount, itemCount: bundle.items.length,
      });
    }
    if (line.lastSeenPriceCents !== chargedCents) {
      notices.push({
        code: "PRICE_CHANGED", cartItemId: line.cartItemId, title: bundle.title,
        previousCents: line.lastSeenPriceCents, currentCents: chargedCents,
      });
    }
  }

  for (const line of arrangementLines) {
    const arrangement = arrangements.get(line.arrangementId);
    const ex = (reason: ExcludedReason, removeFromCart: boolean, extra: Partial<ExcludedLine> = {}) =>
      excluded.push({
        cartItemId: line.cartItemId, type: "ARRANGEMENT", refId: arrangement?.id ?? line.arrangementId, ...target,
        title: arrangement?.title ?? "Arrangement", reason, removeFromCart, ...extra,
      });
    if (!arrangement || !arrangement.published) { ex("UNAVAILABLE", true); continue; }
    if (arrangement.currency !== currency) { ex("CURRENCY_MISMATCH", true); continue; }
    if (ownedArrangementIds.has(arrangement.id)) { ex("ALREADY_OWNED", true); continue; }
    if (isIncompatible(arrangement.id)) { ex("INCOMPATIBLE", true); continue; }
    const cover = coveredBy.get(arrangement.id);
    if (cover) {
      ex("INCLUDED_IN_BUNDLE", false, { coveredByBundleId: cover.bundleId, coveredByBundleTitle: cover.title });
      continue;
    }
    const additional = isAdditional(arrangement.id);
    const charged = additional ? additionalPrice(arrangement.priceCents) : arrangement.priceCents;
    lines.push({
      cartItemId: line.cartItemId,
      type: "ARRANGEMENT",
      refId: arrangement.id,
      ...target,
      sku: arrangement.sku,
      title: arrangement.title,
      retailValueCents: arrangement.priceCents,
      chargedCents: charged,
      allocations: [{
        arrangementId: arrangement.id,
        sku: arrangement.sku,
        title: arrangement.title,
        retailValueCents: arrangement.priceCents,
        allocatedCents: charged,
        ...(additional ? { additionalPlayer: true } : {}),
      }],
    });
    if (line.lastSeenPriceCents !== charged) {
      notices.push({
        code: "PRICE_CHANGED", cartItemId: line.cartItemId, title: arrangement.title,
        previousCents: line.lastSeenPriceCents, currentCents: charged,
      });
    }
  }

  return { lines, excluded, notices };
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
      l.targetPlayerId ?? null,
      l.chargedCents,
      l.allocations.map((a) => [a.arrangementId, a.allocatedCents, a.retailValueCents, a.additionalPlayer ? 1 : 0]),
    ]),
  });
}
