import "server-only";

/**
 * Server-only shop configuration. Read lazily so the marketing site never fails to boot
 * because a shop variable is missing; the shop feature that needs it fails loudly instead.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  return v;
}

export const shopConfig = {
  get databaseUrl() { return required("SHOP_DATABASE_URL"); },
  get appBaseUrl() { return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(/\/$/, ""); },
  get isProduction() { return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"; },

  // Stripe (test/sandbox).
  get stripeSecretKey() { return required("STRIPE_SECRET_KEY"); },
  get stripeWebhookSecret() { return required("STRIPE_WEBHOOK_SECRET"); },

  // Storage.
  get storageDriver(): "vercel-blob" | "local" | "memory" {
    const d = process.env.SHOP_STORAGE_DRIVER ?? "vercel-blob";
    if (d !== "vercel-blob" && d !== "local" && d !== "memory") throw new Error(`Unknown SHOP_STORAGE_DRIVER ${d}`);
    return d;
  },
  /** HMAC secret for upload tickets and dev-storage URLs. */
  get uploadTicketSecret() {
    return process.env.SHOP_UPLOAD_TICKET_SECRET ?? process.env.SHOP_LOCAL_STORAGE_SECRET ?? required("SHOP_UPLOAD_TICKET_SECRET");
  },
  get previewsAccess(): "public" | "private" {
    if (process.env.SHOP_PREVIEWS_ACCESS) return process.env.SHOP_PREVIEWS_ACCESS === "public" ? "public" : "private";
    // No dedicated public previews store → previews share the private store (signed URLs).
    return process.env.BLOB_PREVIEWS_STORE_ID || process.env.BLOB_PREVIEWS_READ_WRITE_TOKEN ? "public" : "private";
  },
  /** Signed admin upload URL lifetime: 5–15 minutes. */
  get uploadUrlTtlSeconds() {
    const v = Number(process.env.SHOP_UPLOAD_URL_TTL_SECONDS ?? 600);
    return Math.min(Math.max(Number.isFinite(v) ? v : 600, 300), 900);
  },
  get adminDownloadTtlSeconds() { return 120; },
  get previewUrlTtlSeconds() { return 900; },
  /** Above this, finalize trusts the client-declared hash + verifies size/signature only. */
  get serverHashMaxBytes() { return Number(process.env.SHOP_SERVER_HASH_MAX_BYTES ?? 256 * 1024 * 1024); },
  /** Optional hex magic number of the proprietary DMI container. */
  get dmiMagicHex() { return process.env.SHOP_DMI_MAGIC_HEX ?? null; },

  // Product policy.
  get requirePreviewToPublish() { return process.env.SHOP_REQUIRE_PREVIEW_TO_PUBLISH !== "false"; },
  get requireStaffMfa() {
    if (process.env.SHOP_REQUIRE_STAFF_MFA === "false") return false;
    if (process.env.SHOP_REQUIRE_STAFF_MFA === "true") return true;
    // On by default for real deployments; off for a production build served on localhost.
    if (process.env.VERCEL_ENV === "production") return true;
    return this.isProduction && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(this.appBaseUrl);
  },
  get legalVersions() {
    return {
      TERMS: process.env.SHOP_TERMS_VERSION ?? "2026-10-01",
      PRIVACY: process.env.SHOP_PRIVACY_VERSION ?? "2026-10-01",
    } as const;
  },
};
