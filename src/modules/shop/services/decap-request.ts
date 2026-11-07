import { blake2b } from "@noble/hashes/blake2b";
import { ShopError } from "../errors";

/**
 * Activation request `.decapreq` of the Decap Player (licence v1, contract C7 §1).
 *
 * The player writes it (Help > Create Activation Request), the customer uploads it here. It
 * holds no secret: only the player ID and the player's X25519 public key. The check is the
 * same as `ParseRequest` in the player (`engine/license/DecapLicense.cpp`), so a request the
 * shop accepts is one the licence tool accepts:
 *   format == "decap-request", formatVersion == 1, publicKey = 64 lowercase hex,
 *   id == hex(BLAKE2b(publicKey, 16-byte output, no key)).
 * Lowercase only, like the player: one value, one spelling.
 */

/** A real request is about 250 bytes; anything far larger is not one. */
export const DECAP_REQUEST_MAX_BYTES = 4096;

export type DecapRequest = {
  /** 32 lowercase hex. */
  playerId: string;
  /** 64 lowercase hex. */
  publicKey: string;
  /** Free text written by the player (version), for the record only. */
  app: string | null;
  created: string | null;
};

const HEX32 = /^[0-9a-f]{32}$/;
const HEX64 = /^[0-9a-f]{64}$/;

/** hex(BLAKE2b-128(publicKey)): the player ID that belongs to a public key. */
export function playerIdFromPublicKey(publicKeyHex: string): string {
  return Buffer.from(blake2b(Buffer.from(publicKeyHex, "hex"), { dkLen: 16 })).toString("hex");
}

function invalid(message: string): ShopError {
  return new ShopError("VALIDATION_FAILED", message);
}

const NOT_A_REQUEST = "This is not a Decap Player activation request. In the player choose Help > Create Activation Request and upload the .decapreq file it saves.";

export function parseDecapRequest(text: string): DecapRequest {
  if (Buffer.byteLength(text, "utf8") > DECAP_REQUEST_MAX_BYTES) throw invalid(NOT_A_REQUEST);
  let root: unknown;
  try {
    root = JSON.parse(text.replace(/^﻿/, ""));
  } catch {
    throw invalid(NOT_A_REQUEST);
  }
  if (!root || typeof root !== "object" || Array.isArray(root)) throw invalid(NOT_A_REQUEST);
  const r = root as Record<string, unknown>;
  if (r.format !== "decap-request") throw invalid(NOT_A_REQUEST);
  if (r.formatVersion !== 1) {
    throw invalid("This activation request comes from a newer Decap Player than the shop knows. Please contact us.");
  }
  const player = r.player;
  if (!player || typeof player !== "object" || Array.isArray(player)) throw invalid(NOT_A_REQUEST);
  const { id, publicKey } = player as Record<string, unknown>;
  if (typeof id !== "string" || typeof publicKey !== "string" || !HEX32.test(id) || !HEX64.test(publicKey)) {
    throw invalid("The activation request is incomplete or damaged. Create a new one in the player and upload that.");
  }
  if (playerIdFromPublicKey(publicKey) !== id) {
    throw invalid("The activation request has been altered: the player ID does not match its key. Create a new one in the player and upload that file unchanged.");
  }
  const short = (v: unknown) => (typeof v === "string" ? v.slice(0, 120) : null);
  return { playerId: id, publicKey, app: short(r.app), created: short(r.created) };
}

/** `K1001`: the customer number as printed in a licence (contract C7). */
export function formatCustomerNumber(n: number): string {
  return `K${String(n).padStart(4, "0")}`;
}
