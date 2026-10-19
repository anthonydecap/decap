/**
 * Player-bound music licensing policy. Every commercial rule that is not final yet lives
 * here, in one object, instead of in route or UI conditionals. Stored in ShopSetting
 * (`music.policy`) and read through `services/music-policy.ts`.
 */

export const ADDITIONAL_PLAYER_STRATEGIES = ["NO_DISCOUNT", "ADDITIONAL_PERCENTAGE", "ADDITIONAL_FIXED_PRICE"] as const;
export type AdditionalPlayerStrategy = (typeof ADDITIONAL_PLAYER_STRATEGIES)[number];

/** What happens to a player's music when staff move the player to another customer. */
export const RESALE_POLICIES = ["PLAYER_AND_LIBRARY", "PLAYER_ONLY", "ADMIN_DECIDES"] as const;
export type ResalePolicy = (typeof RESALE_POLICIES)[number];

export const REPLACEMENT_POLICIES = ["FREE_ADMIN_APPROVED", "PAID_TRANSFER", "MANUAL_DECISION"] as const;
export type ReplacementPolicy = (typeof REPLACEMENT_POLICIES)[number];

export type MusicPolicy = {
  additionalPlayer: {
    strategy: AdditionalPlayerStrategy;
    /** ADDITIONAL_PERCENTAGE: share of the normal price charged, in basis points (5000 = 50%). */
    percentageBps: number;
    /** ADDITIONAL_FIXED_PRICE: flat price per arrangement, never above the normal price. */
    fixedPriceCents: number;
  };
  /** Customers without an eligible player may buy now and choose the player later. */
  allowAssignLater: boolean;
  /** Music can only be bought for a player whose software is fully licensed. */
  requireActiveSoftwareLicenseForMusic: boolean;
  resalePolicy: ResalePolicy;
  replacementPolicy: ReplacementPolicy;
};

export const DEFAULT_MUSIC_POLICY: MusicPolicy = {
  additionalPlayer: { strategy: "NO_DISCOUNT", percentageBps: 5000, fixedPriceCents: 395 },
  // Music is only sold for an activated player.
  allowAssignLater: false,
  requireActiveSoftwareLicenseForMusic: false,
  resalePolicy: "ADMIN_DECIDES",
  replacementPolicy: "MANUAL_DECISION",
};

/** Merges a stored (possibly partial or stale) value onto the defaults. */
export function normaliseMusicPolicy(raw: unknown): MusicPolicy {
  const r = (raw && typeof raw === "object" ? raw : {}) as Omit<Partial<MusicPolicy>, "additionalPlayer"> & { additionalPlayer?: Partial<MusicPolicy["additionalPlayer"]> };
  const ap: Partial<MusicPolicy["additionalPlayer"]> = r.additionalPlayer ?? {};
  const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d);
  const int = (v: unknown, d: number, max: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : d);
  const d = DEFAULT_MUSIC_POLICY;
  return {
    additionalPlayer: {
      strategy: pick(ap.strategy, ADDITIONAL_PLAYER_STRATEGIES, d.additionalPlayer.strategy),
      percentageBps: int(ap.percentageBps, d.additionalPlayer.percentageBps, 10_000),
      fixedPriceCents: int(ap.fixedPriceCents, d.additionalPlayer.fixedPriceCents, 1_000_000),
    },
    allowAssignLater: typeof r.allowAssignLater === "boolean" ? r.allowAssignLater : d.allowAssignLater,
    requireActiveSoftwareLicenseForMusic:
      typeof r.requireActiveSoftwareLicenseForMusic === "boolean" ? r.requireActiveSoftwareLicenseForMusic : d.requireActiveSoftwareLicenseForMusic,
    resalePolicy: pick(r.resalePolicy, RESALE_POLICIES, d.resalePolicy),
    replacementPolicy: pick(r.replacementPolicy, REPLACEMENT_POLICIES, d.replacementPolicy),
  };
}

/**
 * Price of one arrangement for a player when the customer already licenses it on another
 * player. Never more than the normal price, never negative. Rounds half up to the cent.
 */
export function additionalPlayerPriceCents(retailCents: number, policy: MusicPolicy["additionalPlayer"]): number {
  switch (policy.strategy) {
    case "ADDITIONAL_PERCENTAGE":
      return Math.min(retailCents, Math.max(0, Math.round((retailCents * policy.percentageBps) / 10_000)));
    case "ADDITIONAL_FIXED_PRICE":
      return Math.min(retailCents, Math.max(0, policy.fixedPriceCents));
    default:
      return retailCents;
  }
}
