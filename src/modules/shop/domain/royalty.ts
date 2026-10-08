export type RoyaltyBasisValue = "PERCENT_OF_NET" | "FIXED_PER_UNIT" | "NONE";

export type RoyaltyTerms = {
  basis: RoyaltyBasisValue;
  rateBps: number;
  fixedCents: number | null;
};

/** Arrangement override wins over the arranger default — as a whole, never field by field. */
export function resolveRoyaltyTerms(
  arrangement: { royaltyBasis: RoyaltyBasisValue | null; royaltyRateBps: number | null; royaltyFixedCents: number | null },
  arranger: { defaultRoyaltyBasis: RoyaltyBasisValue; defaultRoyaltyRateBps: number; defaultRoyaltyFixedCents: number | null },
): RoyaltyTerms {
  if (arrangement.royaltyBasis) {
    return {
      basis: arrangement.royaltyBasis,
      rateBps: arrangement.royaltyRateBps ?? 0,
      fixedCents: arrangement.royaltyFixedCents ?? null,
    };
  }
  return {
    basis: arranger.defaultRoyaltyBasis,
    rateBps: arranger.defaultRoyaltyRateBps,
    fixedCents: arranger.defaultRoyaltyFixedCents,
  };
}

/**
 * Royalty owed on `netCents` of revenue. Percentages round half-down (floor of .5 goes to the
 * house) so the sum of per-item royalties never exceeds what was actually earned. A fixed
 * royalty is capped at the net amount — a heavily discounted bundle never produces a loss.
 */
export function computeRoyaltyCents(netCents: number, terms: RoyaltyTerms): number {
  if (netCents <= 0) return 0;
  switch (terms.basis) {
    case "NONE":
      return 0;
    case "FIXED_PER_UNIT":
      return Math.min(Math.max(terms.fixedCents ?? 0, 0), netCents);
    case "PERCENT_OF_NET": {
      const rate = Math.min(Math.max(terms.rateBps, 0), 10_000);
      return Number((BigInt(netCents) * BigInt(rate)) / BigInt(10_000));
    }
  }
}

/**
 * Royalty to reverse when `refundCents` of an allocation is refunded. Proportional to the
 * original royalty; a full refund reverses exactly what was booked.
 */
export function computeRoyaltyReversalCents(
  allocation: { allocatedCents: number; royaltyCents: number },
  refundCents: number,
): number {
  if (refundCents <= 0 || allocation.allocatedCents <= 0) return 0;
  if (refundCents >= allocation.allocatedCents) return allocation.royaltyCents;
  return Number((BigInt(allocation.royaltyCents) * BigInt(refundCents)) / BigInt(allocation.allocatedCents));
}
