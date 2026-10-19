import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { shopConfig } from "../config";
import { ShopError } from "../errors";

/**
 * Activation keys at rest.
 *
 * These are not passwords: support has to be able to read one back to a customer who lost
 * it, so a one-way hash is the wrong tool. They are secrets all the same — anyone holding
 * one can activate a player — so they are encrypted with AES-256-GCM, which authenticates
 * the ciphertext as well as hiding it. A tampered row fails to decrypt instead of
 * returning something plausible.
 *
 * Stored format, one line, so a row can be read without a schema change:
 *
 *     v1.<iv base64url>.<authTag base64url>.<ciphertext base64url>
 *
 * The version prefix exists so a future key rotation can decrypt old rows and write new
 * ones without a migration that would have to touch every secret at once.
 */

const VERSION = "v1";
const IV_BYTES = 12; // GCM standard.

function key(): Buffer {
  // The secret is arbitrary text; the cipher needs exactly 32 bytes. Hashing gives both.
  return createHash("sha256").update(shopConfig.activationKeySecret, "utf8").digest();
}

const b64 = (b: Buffer) => b.toString("base64url");
const unb64 = (s: string) => Buffer.from(s, "base64url");

export function encryptActivationKey(plaintext: string): string {
  const value = plaintext.trim();
  if (!value) throw new ShopError("VALIDATION_FAILED", "An activation key cannot be empty");
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [VERSION, b64(iv), b64(cipher.getAuthTag()), b64(body)].join(".");
}

export function decryptActivationKey(stored: string): string {
  const parts = stored.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new ShopError("CONFLICT", "This activation key was stored in a format this server cannot read");
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(), unb64(parts[1]!));
    decipher.setAuthTag(unb64(parts[2]!));
    return Buffer.concat([decipher.update(unb64(parts[3]!)), decipher.final()]).toString("utf8");
  } catch {
    // Wrong secret, or the row was altered. Both mean the same thing to a caller: ask the
    // EXE for the key again rather than trust whatever came back.
    throw new ShopError("CONFLICT", "The stored activation key could not be read. It may have been encrypted with a different secret.");
  }
}

/** Equal-length, constant-time comparison. Used by tests and any future verification path. */
export function activationKeyMatches(stored: string, candidate: string): boolean {
  const a = Buffer.from(decryptActivationKey(stored), "utf8");
  const b = Buffer.from(candidate.trim(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** What a customer-facing or list view may show: the shape, never the secret. */
export function maskActivationKey(plaintextLength = 19): string {
  return "•".repeat(Math.max(4, Math.min(plaintextLength, 32)));
}
