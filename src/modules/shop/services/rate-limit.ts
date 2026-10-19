import "server-only";
import { shopDb } from "../db";
import { ShopError } from "../errors";

/**
 * Fixed-window rate limiter backed by Postgres so it holds across serverless instances.
 * `key` should combine the action and the actor (customer/staff id, or a hashed IP).
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000);
  const rows = await shopDb().$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" ("key", "windowStart", "count")
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT ("key", "windowStart") DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
    RETURNING "count"`;
  const count = Number(rows[0]?.count ?? 0);
  if (count > limit) {
    throw new ShopError("RATE_LIMITED", "Too many requests. Please wait a moment and try again.");
  }
  // Opportunistic cleanup of old windows (cheap, bounded).
  if (Math.random() < 0.01) {
    await shopDb().$executeRaw`DELETE FROM "RateLimitBucket" WHERE "windowStart" < ${new Date(now - 24 * 3600 * 1000)}`;
  }
}

export const RATE_LIMITS = {
  checkoutPrepare: { limit: 10, windowSeconds: 60 },
  cartMutation: { limit: 60, windowSeconds: 60 },
  onboarding: { limit: 10, windowSeconds: 60 },
  uploadPresign: { limit: 600, windowSeconds: 60 },
  uploadFinalize: { limit: 600, windowSeconds: 60 },
  masterDownload: { limit: 30, windowSeconds: 60 },
} as const;
