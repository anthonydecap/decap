import "server-only";
import { createHash } from "node:crypto";
import { ASSET_POLICIES, hexToBytes, sniffFileType, type AssetKindValue } from "../domain/asset-policy";
import { MidiParseError, parseMidi } from "../domain/midi";
import { shopConfig } from "../config";
import { storage, type ObjectRef } from "../storage";

/**
 * Server-side verification of an uploaded object. Runs before any AssetVersion may become
 * VALID: existence, exact size, real file signature, checksum, and safe MIDI parsing.
 */

export type ValidationIssue = { code: string; message: string };

export type ObjectValidationResult = {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  bytes: number | null;
  sha256: string | null;
  detectedMime: string | null;
  technicalMetadata: Record<string, unknown> | null;
};

export interface MalwareScanner {
  scan(ref: ObjectRef): Promise<{ status: "clean" | "infected" | "unavailable"; signature?: string }>;
}

let scanner: MalwareScanner = { scan: async () => ({ status: "unavailable" }) };
export function setMalwareScanner(s: MalwareScanner) {
  scanner = s;
}

const SNIFF_BYTES = 64 * 1024;

async function sha256OfStream(stream: ReadableStream<Uint8Array>, maxBytes: number) {
  const hash = createHash("sha256");
  const reader = stream.getReader();
  let total = 0;
  const keep: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new Error("Object larger than allowed");
    }
    hash.update(value);
    keep.push(value);
  }
  return { sha256: hash.digest("hex"), total, chunks: keep };
}

function concat(chunks: Uint8Array[], total: number) {
  const out = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

export async function validateStoredObject(input: {
  ref: ObjectRef;
  kind: AssetKindValue;
  declaredBytes: number;
  declaredSha256?: string | null;
}): Promise<ObjectValidationResult> {
  const policy = ASSET_POLICIES[input.kind];
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const result: ObjectValidationResult = {
    ok: false, errors, warnings, bytes: null, sha256: null, detectedMime: null, technicalMetadata: null,
  };

  if (input.ref.store !== policy.store) {
    errors.push({ code: "WRONG_STORE", message: `${input.kind} must live in the ${policy.store} store` });
    return result;
  }

  const head = await storage().head(input.ref);
  if (!head) {
    errors.push({ code: "NOT_UPLOADED", message: "The file has not been uploaded (object not found)." });
    return result;
  }
  result.bytes = head.bytes;
  if (head.bytes === 0) errors.push({ code: "EMPTY_FILE", message: "The file is empty." });
  if (head.bytes > policy.maxBytes) errors.push({ code: "TOO_LARGE", message: `File exceeds the ${input.kind} size limit.` });
  if (head.bytes !== input.declaredBytes) {
    errors.push({ code: "SIZE_MISMATCH", message: `Uploaded size ${head.bytes} differs from declared ${input.declaredBytes}.` });
  }
  if (errors.length) return result;

  // Real type from magic bytes.
  const first = await storage().readHead(input.ref, SNIFF_BYTES);
  const dmiMagic = hexToBytes(shopConfig.dmiMagicHex);
  const detected = sniffFileType(first, dmiMagic);
  if (input.kind === "SOURCE_DMI") {
    if (!dmiMagic) {
      warnings.push({ code: "DMI_SIGNATURE_UNCHECKED", message: "No DMI signature configured (SHOP_DMI_MAGIC_HEX); container not verified." });
    } else if (detected?.family !== "dmi") {
      errors.push({ code: "SIGNATURE_MISMATCH", message: "File does not carry the DMI container signature." });
    }
    result.detectedMime = "application/x-dmi";
  } else if (!detected) {
    errors.push({ code: "UNKNOWN_SIGNATURE", message: "File type could not be recognised from its contents." });
  } else {
    // MP4-family containers carry both audio and video.
    const ftypAmbiguous = (detected.mime === "video/mp4" || detected.mime === "audio/mp4") &&
      policy.families.some((f) => f === "audio" || f === "video");
    if (!policy.families.includes(detected.family) && !ftypAmbiguous) {
      errors.push({ code: "SIGNATURE_MISMATCH", message: `Contents look like ${detected.mime}, not a valid ${input.kind}.` });
    }
    result.detectedMime = detected.mime;
  }
  if (errors.length) return result;

  // Checksum.
  if (head.bytes <= shopConfig.serverHashMaxBytes) {
    const { sha256, total, chunks } = await sha256OfStream(await storage().openRead(input.ref), policy.maxBytes);
    result.sha256 = sha256;
    if (total !== head.bytes) errors.push({ code: "SIZE_MISMATCH", message: "Streamed size differs from object size." });
    if (input.declaredSha256 && input.declaredSha256.toLowerCase() !== sha256) {
      errors.push({ code: "CHECKSUM_MISMATCH", message: "SHA-256 of the stored object does not match the browser-computed checksum." });
    }
    if (policy.serverParse && input.kind === "SOURCE_MIDI" && !errors.length) {
      try {
        result.technicalMetadata = { midi: parseMidi(concat(chunks, total)) };
      } catch (e) {
        errors.push({
          code: "MIDI_PARSE_FAILED",
          message: e instanceof MidiParseError ? `MIDI parse failed: ${e.message}` : "MIDI parse failed",
        });
      }
    }
  } else {
    if (!input.declaredSha256) {
      errors.push({ code: "CHECKSUM_MISSING", message: "Large files must include a browser-computed SHA-256." });
    } else {
      result.sha256 = input.declaredSha256.toLowerCase();
      warnings.push({ code: "CHECKSUM_CLIENT_DECLARED", message: "File is above the server hashing limit; checksum is browser-computed." });
    }
  }

  if (!policy.serverParse || input.kind !== "SOURCE_MIDI") {
    const scan = await scanner.scan(input.ref);
    if (scan.status === "infected") errors.push({ code: "MALWARE_DETECTED", message: "Malware scanner flagged this file." });
    else if (scan.status === "unavailable" && (input.kind === "DOCUMENT" || policy.isPublicFacing)) {
      warnings.push({ code: "SCAN_UNAVAILABLE", message: "No malware scanner configured; file was not scanned." });
    }
  }

  result.technicalMetadata = {
    ...(result.technicalMetadata ?? {}),
    detectedMime: result.detectedMime,
    checksumSource: result.sha256 && head.bytes <= shopConfig.serverHashMaxBytes ? "server" : "client",
  };
  result.ok = errors.length === 0;
  return result;
}
