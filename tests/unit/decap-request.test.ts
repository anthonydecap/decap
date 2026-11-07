import { describe, expect, it } from "vitest";
import { formatCustomerNumber, parseDecapRequest, playerIdFromPublicKey } from "@/modules/shop/services/decap-request";

// Real requests written by the Decap Player / licence tool (contract C7 §1). Public data only.
const SPELER_A = `{
  "format": "decap-request",
  "formatVersion": 1,
  "player": { "id": "f7928d1fc97c177a6ee3e7694b7652ef", "publicKey": "3f65fb0ffd39ac6284ca94f41950c3cd95b15ecfa4658d9b4a859a5f7aff5110" },
  "app": "decaplic-proef",
  "created": "2026-09-27"
}
`;
const TONY_PLAYER = `{\r\n  "format": "decap-request",\r\n  "formatVersion": 1,\r\n  "player": { "id": "21f85357a19e7bc8375e75bc3ec4f094", "publicKey": "57f395898132672be4fa580660d4da6bb5e2c5f61899c252496afccdce5bcf30" },\r\n  "app": "DecapPlayer",\r\n  "created": "2026-10-28"\r\n}\r\n`;

const withPlayer = (player: object, extra: object = {}) =>
  JSON.stringify({ format: "decap-request", formatVersion: 1, player, app: "x", created: "2026-11-07", ...extra });
const A = JSON.parse(SPELER_A).player as { id: string; publicKey: string };

describe("Decap Player activation request (.decapreq)", () => {
  it("derives the player ID exactly like the player (BLAKE2b-128 of the public key)", () => {
    expect(playerIdFromPublicKey(A.publicKey)).toBe(A.id);
    expect(playerIdFromPublicKey("57f395898132672be4fa580660d4da6bb5e2c5f61899c252496afccdce5bcf30")).toBe("21f85357a19e7bc8375e75bc3ec4f094");
  });

  it("accepts real requests, with LF, CRLF and a byte-order mark", () => {
    expect(parseDecapRequest(SPELER_A)).toEqual({ playerId: A.id, publicKey: A.publicKey, app: "decaplic-proef", created: "2026-09-27" });
    expect(parseDecapRequest(TONY_PLAYER).playerId).toBe("21f85357a19e7bc8375e75bc3ec4f094");
    expect(parseDecapRequest("﻿" + SPELER_A).playerId).toBe(A.id);
  });

  it("refuses an ID that does not belong to the key (altered or forged request)", () => {
    const otherId = "02a85f4fdfe902eebfa7a405541fc719";
    expect(() => parseDecapRequest(withPlayer({ id: otherId, publicKey: A.publicKey }))).toThrowError(/altered/);
    const flipped = (A.publicKey[0] === "3" ? "4" : "3") + A.publicKey.slice(1);
    expect(() => parseDecapRequest(withPlayer({ id: A.id, publicKey: flipped }))).toThrowError(/altered/);
  });

  it("is strict about the spelling: lowercase hex of the right length, like the player", () => {
    for (const player of [
      { id: A.id.toUpperCase(), publicKey: A.publicKey },
      { id: A.id, publicKey: A.publicKey.toUpperCase() },
      { id: A.id.slice(2), publicKey: A.publicKey },
      { id: A.id, publicKey: A.publicKey + "00" },
      { id: A.id, publicKey: 12 },
      { id: A.id },
    ]) {
      expect(() => parseDecapRequest(withPlayer(player))).toThrowError(/incomplete or damaged/);
    }
  });

  it("refuses anything that is not a version 1 request", () => {
    expect(() => parseDecapRequest("not json")).toThrowError(/not a Decap Player activation request/);
    expect(() => parseDecapRequest("[]")).toThrowError(/not a Decap Player activation request/);
    expect(() => parseDecapRequest(withPlayer(A, { format: "decap-license" }))).toThrowError(/not a Decap Player/);
    expect(() => parseDecapRequest(withPlayer(A, { formatVersion: 2 }))).toThrowError(/newer Decap Player/);
    expect(() => parseDecapRequest(withPlayer(A, { formatVersion: "1" }))).toThrowError(/newer Decap Player/);
    expect(() => parseDecapRequest(SPELER_A + " ".repeat(5000))).toThrowError(/not a Decap Player/);
  });

  it("formats customer numbers as in the licence", () => {
    expect(formatCustomerNumber(1001)).toBe("K1001");
    expect(formatCustomerNumber(7)).toBe("K0007");
    expect(formatCustomerNumber(123456)).toBe("K123456");
  });
});
