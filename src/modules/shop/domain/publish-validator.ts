/**
 * Publish gates. An arrangement / bundle can only move to PUBLISHED when every check passes.
 * Pure — callers load the data; the admin UI shows the same issue list before publishing.
 */

export type PublishIssue = { code: string; message: string };

export type ArrangementPublishInput = {
  sku: string | null;
  slug: string | null;
  displayTitle: string | null;
  hasWork: boolean;
  hasArranger: boolean;
  arrangerActive: boolean;
  priceCents: number | null;
  rightsStatus: string;
  licenseEndsAt: Date | null;
  compatibilityCount: number;
  hasGenericCompatibility: boolean;
  /** Kinds of assets that have a VALID active version. */
  validActiveKinds: ReadonlySet<string>;
  /** Product policy: storefront must have an audio or video preview. */
  requirePreview: boolean;
  now?: Date;
};

export const PLAYABLE_MASTER_KINDS = ["SOURCE_MIDI", "SOURCE_DMI"] as const;
export const PREVIEW_KINDS = ["PREVIEW_AUDIO", "PREVIEW_VIDEO"] as const;
export const PUBLISHABLE_RIGHTS = new Set(["CLEARED", "PUBLIC_DOMAIN"]);

export function validateArrangementForPublish(input: ArrangementPublishInput): PublishIssue[] {
  const issues: PublishIssue[] = [];
  const now = input.now ?? new Date();

  if (!input.displayTitle?.trim()) issues.push({ code: "TITLE_MISSING", message: "Display title is required." });
  if (!input.sku?.trim()) issues.push({ code: "SKU_MISSING", message: "SKU is required." });
  if (!input.slug?.trim()) issues.push({ code: "SLUG_MISSING", message: "Slug is required." });
  if (!input.hasWork) issues.push({ code: "WORK_MISSING", message: "Link the arrangement to a Work." });
  if (!input.hasArranger) issues.push({ code: "ARRANGER_MISSING", message: "An arranger is required." });
  else if (!input.arrangerActive) issues.push({ code: "ARRANGER_INACTIVE", message: "The arranger is inactive." });
  if (input.priceCents == null || input.priceCents <= 0) {
    issues.push({ code: "PRICE_INVALID", message: "Price must be greater than zero." });
  }
  if (!PLAYABLE_MASTER_KINDS.some((k) => input.validActiveKinds.has(k))) {
    issues.push({
      code: "MASTER_MISSING",
      message: "At least one VALID active playable master (SOURCE_MIDI or SOURCE_DMI) is required.",
    });
  }
  if (input.compatibilityCount === 0 && !input.hasGenericCompatibility) {
    issues.push({
      code: "COMPATIBILITY_MISSING",
      message: "Add at least one compatible system profile (or the generic profile).",
    });
  }
  if (!PUBLISHABLE_RIGHTS.has(input.rightsStatus)) {
    issues.push({
      code: "RIGHTS_NOT_CLEARED",
      message: `Rights workflow state is ${input.rightsStatus}; it must be CLEARED or PUBLIC_DOMAIN.`,
    });
  }
  if (input.licenseEndsAt && input.licenseEndsAt.getTime() <= now.getTime()) {
    issues.push({ code: "LICENSE_EXPIRED", message: "The recorded license period has ended." });
  }
  if (input.requirePreview && !PREVIEW_KINDS.some((k) => input.validActiveKinds.has(k))) {
    issues.push({ code: "PREVIEW_MISSING", message: "A VALID audio or video preview is required by preview policy." });
  }
  return issues;
}

export type BundlePublishInput = {
  sku: string | null;
  slug: string | null;
  title: string | null;
  priceCents: number | null;
  /** All items with their arrangement publish status. */
  items: ReadonlyArray<{ arrangementId: string; published: boolean; priceCents: number }>;
};

export function validateBundleForPublish(input: BundlePublishInput): PublishIssue[] {
  const issues: PublishIssue[] = [];
  if (!input.title?.trim()) issues.push({ code: "TITLE_MISSING", message: "Title is required." });
  if (!input.sku?.trim()) issues.push({ code: "SKU_MISSING", message: "SKU is required." });
  if (!input.slug?.trim()) issues.push({ code: "SLUG_MISSING", message: "Slug is required." });
  if (input.priceCents == null || input.priceCents <= 0) {
    issues.push({ code: "PRICE_INVALID", message: "Bundle price must be greater than zero." });
  }
  const published = input.items.filter((i) => i.published);
  if (published.length < 2) {
    issues.push({ code: "TOO_FEW_ITEMS", message: "A bundle needs at least two published arrangements." });
  }
  const unpublished = input.items.length - published.length;
  if (unpublished > 0) {
    issues.push({
      code: "UNPUBLISHED_ITEMS",
      message: `${unpublished} item(s) are not published. Publish or remove them first.`,
    });
  }
  const retail = published.reduce((s, i) => s + i.priceCents, 0);
  if (input.priceCents != null && retail > 0 && input.priceCents >= retail) {
    issues.push({
      code: "NO_SAVING",
      message: "Bundle price must be lower than the sum of its arrangements' normal prices.",
    });
  }
  return issues;
}
