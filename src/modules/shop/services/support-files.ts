import { sniffFileType, fileExtension } from "../domain/asset-policy";

/**
 * Allowlist for support attachments and internal customer documents. Detected from the
 * bytes, not from the browser's MIME type or the file name. 4 MB keeps uploads inside the
 * serverless request limit; screenshots, PDFs and short logs fit comfortably.
 */
export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_MESSAGE = 5;

export type AttachmentType = { mime: string; ext: string };

export function detectAttachmentType(body: Uint8Array, fileName: string): AttachmentType | null {
  const sniffed = sniffFileType(body.subarray(0, 64));
  if (sniffed) {
    switch (sniffed.mime) {
      case "image/jpeg": return { mime: "image/jpeg", ext: "jpg" };
      case "image/png": return { mime: "image/png", ext: "png" };
      case "image/webp": return { mime: "image/webp", ext: "webp" };
      case "application/pdf": return { mime: "application/pdf", ext: "pdf" };
      case "audio/midi": return { mime: "audio/midi", ext: "mid" };
      default: return null;
    }
  }
  // Plain text (logs, notes): only for .txt/.log and only if it really is text.
  const ext = fileExtension(fileName);
  if ((ext === "txt" || ext === "log") && isPlainText(body)) return { mime: "text/plain", ext: "txt" };
  return null;
}

function isPlainText(body: Uint8Array) {
  const sample = body.subarray(0, 8192);
  for (const b of sample) {
    if (b === 0) return false;
    if (b < 0x09 || (b > 0x0d && b < 0x20)) return false;
  }
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(sample);
    return true;
  } catch {
    return false;
  }
}
