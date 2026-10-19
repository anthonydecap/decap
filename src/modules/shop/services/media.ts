import "server-only";
import { shopConfig } from "../config";
import { storage } from "../storage";

/**
 * Customer-facing media URLs. Only ever resolves PREVIEWS-store objects (artwork, short
 * previews). Master / delivery stores are rejected here by construction.
 */
export async function previewMediaUrl(version: { storageStore: string; storageKey: string } | null | undefined): Promise<string | null> {
  if (!version || version.storageStore !== "PREVIEWS") return null;
  const ref = { store: "PREVIEWS" as const, key: version.storageKey };
  const pub = storage().publicUrl(ref);
  if (pub) return pub;
  try {
    const { url } = await storage().createDownloadUrl(ref, { expiresInSeconds: shopConfig.previewUrlTtlSeconds });
    return url;
  } catch {
    return null;
  }
}
