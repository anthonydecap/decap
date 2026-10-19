import { describe, expect, it } from "vitest";
import { computeRoyaltyCents, computeRoyaltyReversalCents, resolveRoyaltyTerms } from "@/modules/shop/domain/royalty";
import { validateArrangementForPublish, validateBundleForPublish } from "@/modules/shop/domain/publish-validator";
import { roleHasPermission } from "@/modules/shop/auth/session";

describe("royalties", () => {
  it("computes percent-of-net with floor rounding", () => {
    expect(computeRoyaltyCents(999, { basis: "PERCENT_OF_NET", rateBps: 2500, fixedCents: null })).toBe(249);
    expect(computeRoyaltyCents(0, { basis: "PERCENT_OF_NET", rateBps: 2500, fixedCents: null })).toBe(0);
  });
  it("caps fixed royalties at the net amount", () => {
    expect(computeRoyaltyCents(150, { basis: "FIXED_PER_UNIT", rateBps: 0, fixedCents: 200 })).toBe(150);
  });
  it("uses the arrangement override as a whole", () => {
    const terms = resolveRoyaltyTerms(
      { royaltyBasis: "FIXED_PER_UNIT", royaltyRateBps: null, royaltyFixedCents: 100 },
      { defaultRoyaltyBasis: "PERCENT_OF_NET", defaultRoyaltyRateBps: 3000, defaultRoyaltyFixedCents: null },
    );
    expect(terms).toEqual({ basis: "FIXED_PER_UNIT", rateBps: 0, fixedCents: 100 });
  });
  it("reverses exactly on full refund and proportionally on partial", () => {
    expect(computeRoyaltyReversalCents({ allocatedCents: 1000, royaltyCents: 333 }, 1000)).toBe(333);
    expect(computeRoyaltyReversalCents({ allocatedCents: 1000, royaltyCents: 333 }, 500)).toBe(166);
  });
});

describe("publish validator", () => {
  const ok = {
    sku: "S", slug: "s", displayTitle: "T", hasWork: true, hasArranger: true, arrangerActive: true, priceCents: 999,
    rightsStatus: "CLEARED", licenseEndsAt: null, compatibilityCount: 1, hasGenericCompatibility: false,
    validActiveKinds: new Set(["SOURCE_MIDI", "PREVIEW_AUDIO"]), requirePreview: true,
  };
  it("passes a complete arrangement", () => {
    expect(validateArrangementForPublish(ok)).toEqual([]);
  });
  it("blocks missing master, rights, compatibility, preview and price", () => {
    const codes = validateArrangementForPublish({
      ...ok, priceCents: 0, rightsStatus: "PENDING_REVIEW", compatibilityCount: 0, validActiveKinds: new Set(["SOURCE_AUDIO"]),
    }).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(["PRICE_INVALID", "RIGHTS_NOT_CLEARED", "COMPATIBILITY_MISSING", "MASTER_MISSING", "PREVIEW_MISSING"]));
  });
  it("blocks an expired license", () => {
    const codes = validateArrangementForPublish({ ...ok, licenseEndsAt: new Date(Date.now() - 1000) }).map((i) => i.code);
    expect(codes).toContain("LICENSE_EXPIRED");
  });
  it("requires bundles to save money and contain published items", () => {
    const codes = validateBundleForPublish({
      sku: "B", slug: "b", title: "B", priceCents: 2000,
      items: [{ arrangementId: "a", published: true, priceCents: 1000 }, { arrangementId: "b", published: false, priceCents: 1000 }],
    }).map((i) => i.code);
    expect(codes).toEqual(expect.arrayContaining(["TOO_FEW_ITEMS", "UNPUBLISHED_ITEMS", "NO_SAVING"]));
  });
});

describe("staff permission guards", () => {
  it("matches the role matrix", () => {
    expect(roleHasPermission("ADMIN", "assets:download-master")).toBe(true);
    expect(roleHasPermission("CATALOG_MANAGER", "assets:upload")).toBe(true);
    expect(roleHasPermission("CATALOG_MANAGER", "orders:refund")).toBe(false);
    expect(roleHasPermission("CATALOG_MANAGER", "assets:download-master")).toBe(false);
    expect(roleHasPermission("FINANCE", "orders:refund")).toBe(true);
    expect(roleHasPermission("FINANCE", "assets:upload")).toBe(false);
    expect(roleHasPermission("FINANCE", "entitlements:grant")).toBe(false);
  });
});
