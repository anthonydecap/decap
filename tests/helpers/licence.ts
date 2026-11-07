import { generateKeyPairSync, sign } from "node:crypto";
import { setSignerKeysForTests } from "@/modules/shop/services/decap-license-file";

/**
 * A throw-away Ed25519 signer that writes licences in exactly the layout of `decaplic issue`.
 * The private key lives only in memory for the test run.
 */
export function makeTestSigner(keyId = "decap-SHOPTEST-1") {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const rawPub = publicKey.export({ format: "der", type: "spki" }).subarray(12).toString("hex");
  setSignerKeysForTests({ [keyId]: rawPub });

  return {
    keyId,
    signLicence(fields: {
      licenseId?: string;
      playerId: string;
      publicKey: string;
      customer: string;
      edition?: string;
      midiOut?: boolean;
      songIds?: string[];
      validUntil?: string;
      dmiUserId?: number;
      signerKeyId?: string;
    }) {
      const sealed = "ab".repeat(80);
      const lines = [
        "{",
        '  "format": "decap-license",',
        '  "formatVersion": 1,',
        `  "licenseId": "${fields.licenseId ?? Math.random().toString(16).slice(2).padEnd(32, "0")}",`,
        '  "issued": "2026-11-07",',
        ...(fields.validUntil ? [`  "validUntil": "${fields.validUntil}",`] : []),
        ...(fields.dmiUserId ? [`  "dmiUserId": ${fields.dmiUserId},`] : []),
        `  "signerKeyId": "${fields.signerKeyId ?? keyId}",`,
        `  "player": { "id": "${fields.playerId}", "publicKey": "${fields.publicKey}" },`,
        `  "customer": "${fields.customer}",`,
        `  "edition": "${fields.edition ?? "standard"}",`,
        `  "features": { "midiOut": ${fields.midiOut ?? true} },`,
        '  "songs": [',
        (fields.songIds ?? []).map((id) => `    { "id": "${id}", "sealedKey": "${sealed}" }`).join(",\n"),
        "  ]",
        "}",
        "",
      ];
      const body = lines.filter((l, i) => !(l === "" && i !== lines.length - 1)).join("\n");
      const sig = sign(null, Buffer.from(body, "utf8"), privateKey).toString("hex");
      return `${body}#signature ${sig}\n`;
    },
  };
}
