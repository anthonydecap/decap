import { createPublicKey, verify } from "node:crypto";
import { ShopError } from "../errors";
import { playerIdFromPublicKey } from "./decap-request";

/**
 * Player licence `.decaplic` (licence v1, contract C7 §2), made offline by `decaplic issue`.
 *
 * The shop never makes or changes a licence. It only checks an uploaded one before it is
 * stored and handed to a customer, with the same rules as `ParseAndVerify` in the player
 * (`engine/license/DecapLicense.cpp`): the last line `#signature <hex>` is an Ed25519
 * signature (RFC 8032) over everything before it, CR removed; the signer is looked up by
 * `signerKeyId` among the PUBLIC keys below. A public key cannot sign anything: it is safe here.
 */

/** Public verification keys, same as `DecapTrustedKeys.h` of the release player. */
const RELEASE_SIGNER_KEYS: Record<string, string> = {
  "decap-2026-1": "d44c8c3a4882f6d465ad0734bf7ba7f257885cd8c94e2fa41787b7bd2901e0af",
};

let signerKeys: Record<string, string> = RELEASE_SIGNER_KEYS;

/** Tests sign with a throw-away key; never used outside the test suite. */
export function setSignerKeysForTests(keys: Record<string, string> | null) {
  if (process.env.NODE_ENV !== "test") throw new Error("setSignerKeysForTests is for tests only");
  signerKeys = keys ?? RELEASE_SIGNER_KEYS;
}

export const DECAP_LICENSE_MAX_BYTES = 2 * 1024 * 1024;
const KNOWN_FORMAT_VERSION = 1;
const SIG_TAG = "#signature ";
const HEX64 = /^[0-9a-f]{64}$/;
const HEX32 = /^[0-9a-f]{32}$/;
const SEALED_HEX = /^[0-9a-f]{160}$/; // kSealedSize = 80 bytes
const DATE = /^\d{4}-\d{2}-\d{2}$/;
// Ed25519 public key as SubjectPublicKeyInfo DER: fixed 12-byte prefix + the 32 raw bytes.
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

export type DecapLicense = {
  licenseId: string;
  issued: string;
  signerKeyId: string;
  customer: string;
  edition: string;
  validUntil: string | null;
  dmiUserId: number | null;
  playerId: string;
  publicKey: string;
  midiOut: boolean;
  songIds: string[];
};

const bad = (message: string) => new ShopError("VALIDATION_FAILED", message);
const NOT_A_LICENSE = "This is not a Decap Player licence file (.decaplic made by decaplic issue).";

export function verifyDecapLicense(fileText: string): DecapLicense {
  if (Buffer.byteLength(fileText, "utf8") > DECAP_LICENSE_MAX_BYTES) throw bad(NOT_A_LICENSE);
  const text = fileText.replace(/^﻿/, "").replace(/\r/g, "");
  const p = text.lastIndexOf(`\n${SIG_TAG}`);
  if (p < 0) throw bad(NOT_A_LICENSE);
  const body = text.slice(0, p + 1);
  const sigHex = text.slice(p + 1 + SIG_TAG.length).replace(/[\n \t]+$/, "");
  if (!/^[0-9a-f]{128}$/.test(sigHex)) throw bad(NOT_A_LICENSE);

  let root: Record<string, unknown>;
  try {
    const v: unknown = JSON.parse(body);
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error();
    root = v as Record<string, unknown>;
  } catch {
    throw bad("The licence file is unreadable or incomplete.");
  }

  const keyId = root.signerKeyId;
  if (typeof keyId !== "string") throw bad("The licence file is unreadable or incomplete.");
  const pubHex = Object.prototype.hasOwnProperty.call(signerKeys, keyId) ? signerKeys[keyId] : undefined;
  if (!pubHex) throw bad(`The licence is signed with an unknown key (${keyId.slice(0, 40)}). Sign it with the Decap key.`);
  const key = createPublicKey({ key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(pubHex, "hex")]), format: "der", type: "spki" });
  if (!verify(null, Buffer.from(body, "utf8"), key, Buffer.from(sigHex, "hex"))) {
    throw bad("The signature does not match: the licence was altered or is not genuine. Upload the file exactly as decaplic wrote it.");
  }

  // From here on the text is Decap's own; still check every field strictly.
  const incomplete = () => bad("The licence is signed but incomplete; make it again with decaplic issue.");
  if (root.format !== "decap-license") throw incomplete();
  const ver = root.formatVersion;
  if (typeof ver !== "number" || !Number.isInteger(ver) || ver < 1) throw incomplete();
  if (ver > KNOWN_FORMAT_VERSION) throw bad("This licence has a newer format than the shop knows. Update the shop first.");
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const licenseId = str(root.licenseId), issued = str(root.issued), customer = str(root.customer), edition = str(root.edition);
  if (!licenseId || licenseId.length > 64 || !issued || !customer || !edition) throw incomplete();

  let validUntil: string | null = null;
  if (root.validUntil !== undefined) {
    if (typeof root.validUntil !== "string" || !DATE.test(root.validUntil)) throw incomplete();
    validUntil = root.validUntil;
  }
  let dmiUserId: number | null = null;
  if (root.dmiUserId !== undefined) {
    const d = root.dmiUserId;
    if (typeof d !== "number" || !Number.isInteger(d) || d < 1 || d > 16777215) throw incomplete();
    dmiUserId = d;
  }

  const player = root.player as Record<string, unknown> | undefined;
  const playerId = str(player?.id), publicKey = str(player?.publicKey);
  if (!playerId || !publicKey || !HEX32.test(playerId) || !HEX64.test(publicKey)) throw incomplete();
  if (playerIdFromPublicKey(publicKey) !== playerId) throw bad("The licence names a player ID that does not belong to its key.");

  const features = root.features as Record<string, unknown> | undefined;
  if (!features || typeof features.midiOut !== "boolean") throw incomplete();

  if (!Array.isArray(root.songs)) throw incomplete();
  const songIds: string[] = [];
  const seen = new Set<string>();
  for (const s of root.songs as unknown[]) {
    const e = s as Record<string, unknown> | null;
    const id = str(e?.id), sealed = str(e?.sealedKey);
    if (!id || !sealed || !SEALED_HEX.test(sealed) || seen.has(id)) throw incomplete();
    seen.add(id);
    songIds.push(id);
  }

  return {
    licenseId, issued, signerKeyId: keyId, customer, edition, validUntil, dmiUserId,
    playerId, publicKey, midiOut: features.midiOut, songIds,
  };
}
