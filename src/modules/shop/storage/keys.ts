import { randomUUID } from "node:crypto";
import type { StoreName } from "./types";

const SAFE_EXT = /^[a-z0-9]{1,8}$/;

/**
 * Generates a fresh random object key. Keys never contain filenames, emails, customer names
 * or registration numbers — only a category, a date bucket (for lifecycle tooling) and a UUID.
 */
export function generateObjectKey(store: StoreName, category: string, extension: string, now = new Date()): string {
  const ext = extension.toLowerCase();
  const cat = category.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const suffix = SAFE_EXT.test(ext) ? `.${ext}` : "";
  return `${store.toLowerCase()}/${cat}/${yyyy}/${mm}/${randomUUID()}${suffix}`;
}

/** Defends routes that take a key: only our generated shape is ever accepted. */
export function isGeneratedKey(key: string): boolean {
  return /^(masters|deliveries|previews|support|documents|software)\/[a-z0-9-]+\/\d{4}\/\d{2}\/[0-9a-f-]{36}(\.[a-z0-9]{1,8})?$/.test(key);
}
