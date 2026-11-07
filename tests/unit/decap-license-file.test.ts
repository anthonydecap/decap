import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { setSignerKeysForTests, verifyDecapLicense } from "@/modules/shop/services/decap-license-file";
import { makeTestSigner } from "../helpers/licence";

// licentie-A.decaplic: written by the real `decaplic issue` (DecapPlayer test/license), signed with
// the TEST key decap-TEST-1. Its PUBLIC key below is the same as in DecapTrustedKeys.h.
const REAL = readFileSync(join(__dirname, "../fixtures/licentie-A.decaplic"), "utf8");
const DECAP_TEST_1_PUB = "9b2ac7b2d63aa5c52fd88b6937ee713a9071a670fc496c0fcc8949885f6c85ac";
const A = { id: "f7928d1fc97c177a6ee3e7694b7652ef", publicKey: "3f65fb0ffd39ac6284ca94f41950c3cd95b15ecfa4658d9b4a859a5f7aff5110" };

afterEach(() => setSignerKeysForTests(null));

describe("Player licence file (.decaplic)", () => {
  it("verifies a licence written by the real decaplic, CRLF and all", () => {
    setSignerKeysForTests({ "decap-TEST-1": DECAP_TEST_1_PUB });
    expect(REAL).toContain("\r\n");
    const lic = verifyDecapLicense(REAL);
    expect(lic).toMatchObject({
      licenseId: "f6e206764ed39acedccf288c557ecb6d",
      signerKeyId: "decap-TEST-1",
      customer: "K0001",
      edition: "standard",
      playerId: A.id,
      publicKey: A.publicKey,
      midiOut: true,
      validUntil: null,
      dmiUserId: null,
    });
    expect(lic.songIds).toHaveLength(3);
  });

  it("does not trust the test key in the shop's own key list", () => {
    expect(() => verifyDecapLicense(REAL)).toThrowError(/unknown key/);
  });

  it("refuses any change to the signed text", () => {
    setSignerKeysForTests({ "decap-TEST-1": DECAP_TEST_1_PUB });
    expect(() => verifyDecapLicense(REAL.replace('"K0001"', '"K0002"'))).toThrowError(/altered/);
    expect(() => verifyDecapLicense(REAL.replace('"midiOut": true', '"midiOut": false'))).toThrowError(/altered/);
    const sigAt = REAL.lastIndexOf("#signature ") + 11;
    const flipped = REAL.slice(0, sigAt) + (REAL[sigAt] === "0" ? "1" : "0") + REAL.slice(sigAt + 1);
    expect(() => verifyDecapLicense(flipped)).toThrowError(/altered/);
  });

  it("refuses files that are not a licence", () => {
    expect(() => verifyDecapLicense("{}")).toThrowError(/not a Decap Player licence/);
    expect(() => verifyDecapLicense(REAL.replace("#signature", "#handtekening"))).toThrowError(/not a Decap Player licence/);
  });

  it("reads the optional fields and checks the content after the signature", () => {
    const signer = makeTestSigner();
    const lic = verifyDecapLicense(signer.signLicence({
      ...{ playerId: A.id, publicKey: A.publicKey }, customer: "K1001", edition: "pro", midiOut: false,
      validUntil: "2027-12-31", dmiUserId: 4242, songIds: ["song-1", "song-2"],
    }));
    expect(lic).toMatchObject({ edition: "pro", midiOut: false, validUntil: "2027-12-31", dmiUserId: 4242, songIds: ["song-1", "song-2"] });

    // Correctly signed, but the ID does not belong to the key.
    expect(() => verifyDecapLicense(signer.signLicence({ playerId: "0".repeat(32), publicKey: A.publicKey, customer: "K1001" })))
      .toThrowError(/does not belong/);
    // Correctly signed, but the same song twice.
    expect(() => verifyDecapLicense(signer.signLicence({ playerId: A.id, publicKey: A.publicKey, customer: "K1001", songIds: ["x", "x"] })))
      .toThrowError(/incomplete/);
  });
});
