/**
 * Upload policy per asset kind: which store it lives in, what it may be, how big it may be,
 * and how to recognise the real file type from its first bytes (never trust the extension
 * or the browser-declared MIME type alone).
 */

export type AssetKindValue =
  | "SOURCE_MIDI"
  | "SOURCE_DMI"
  | "SOURCE_AUDIO"
  | "SOURCE_VIDEO"
  | "PREVIEW_AUDIO"
  | "PREVIEW_VIDEO"
  | "COVER_IMAGE"
  | "DOCUMENT";

export type StoreValue = "MASTERS" | "DELIVERIES" | "PREVIEWS";

export type DetectedType = { mime: string; family: "midi" | "dmi" | "audio" | "video" | "image" | "pdf" };

type KindPolicy = {
  store: StoreValue;
  /** Customer-visible (previews / artwork) vs. private master material. */
  isPublicFacing: boolean;
  extensions: string[];
  mimeTypes: string[];
  families: DetectedType["family"][];
  maxBytes: number;
  /** Parse fully on the server during finalize (small files only). */
  serverParse: boolean;
};

const MB = 1024 * 1024;
const GB = 1024 * MB;

export const ASSET_POLICIES: Record<AssetKindValue, KindPolicy> = {
  SOURCE_MIDI: {
    store: "MASTERS", isPublicFacing: false, extensions: ["mid", "midi", "smf"],
    mimeTypes: ["audio/midi", "audio/x-midi", "audio/mid", "application/octet-stream"],
    families: ["midi"], maxBytes: 20 * MB, serverParse: true,
  },
  SOURCE_DMI: {
    store: "MASTERS", isPublicFacing: false, extensions: ["dmi"],
    mimeTypes: ["application/octet-stream", "application/x-dmi"],
    families: ["dmi"], maxBytes: 100 * MB, serverParse: true,
  },
  SOURCE_AUDIO: {
    store: "MASTERS", isPublicFacing: false, extensions: ["wav", "aif", "aiff", "flac", "mp3", "m4a", "ogg"],
    mimeTypes: ["audio/wav", "audio/x-wav", "audio/wave", "audio/aiff", "audio/x-aiff", "audio/flac", "audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/ogg"],
    families: ["audio"], maxBytes: 4 * GB, serverParse: false,
  },
  SOURCE_VIDEO: {
    store: "MASTERS", isPublicFacing: false, extensions: ["mp4", "mov", "m4v", "webm", "mkv"],
    mimeTypes: ["video/mp4", "video/quicktime", "video/x-m4v", "video/webm", "video/x-matroska"],
    families: ["video"], maxBytes: 20 * GB, serverParse: false,
  },
  PREVIEW_AUDIO: {
    store: "PREVIEWS", isPublicFacing: true, extensions: ["mp3", "m4a", "ogg"],
    mimeTypes: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/ogg"],
    families: ["audio"], maxBytes: 30 * MB, serverParse: false,
  },
  PREVIEW_VIDEO: {
    store: "PREVIEWS", isPublicFacing: true, extensions: ["mp4", "webm"],
    mimeTypes: ["video/mp4", "video/webm"],
    families: ["video"], maxBytes: 300 * MB, serverParse: false,
  },
  COVER_IMAGE: {
    store: "PREVIEWS", isPublicFacing: true, extensions: ["jpg", "jpeg", "png", "webp", "avif"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    families: ["image"], maxBytes: 15 * MB, serverParse: false,
  },
  DOCUMENT: {
    store: "MASTERS", isPublicFacing: false, extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
    families: ["pdf"], maxBytes: 50 * MB, serverParse: false,
  },
};

export const SOURCE_KINDS: AssetKindValue[] = ["SOURCE_MIDI", "SOURCE_DMI", "SOURCE_AUDIO", "SOURCE_VIDEO"];

export function fileExtension(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : "";
}

/** Normalises browser-declared MIME types (they are often empty for .mid/.dmi). */
export function normaliseDeclaredMime(kind: AssetKindValue, declared: string | undefined, filename: string): string {
  const policy = ASSET_POLICIES[kind];
  const d = (declared ?? "").toLowerCase().split(";")[0]!.trim();
  if (d && policy.mimeTypes.includes(d)) return d;
  const ext = fileExtension(filename);
  const byExt: Record<string, string> = {
    mid: "audio/midi", midi: "audio/midi", smf: "audio/midi", dmi: "application/octet-stream",
    wav: "audio/wav", aif: "audio/aiff", aiff: "audio/aiff", flac: "audio/flac", mp3: "audio/mpeg",
    m4a: "audio/mp4", ogg: "audio/ogg", mp4: "video/mp4", m4v: "video/x-m4v", mov: "video/quicktime",
    webm: "video/webm", mkv: "video/x-matroska", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    webp: "image/webp", avif: "image/avif", pdf: "application/pdf",
  };
  return byExt[ext] ?? "application/octet-stream";
}

/** Guesses the asset kind for a bulk-import file from its name. Admin can always remap. */
export function guessKindFromFilename(filename: string, columnHint?: AssetKindValue): AssetKindValue | null {
  if (columnHint) return columnHint;
  const ext = fileExtension(filename);
  const lower = filename.toLowerCase();
  const isPreview = /(^|[\s._-])(preview|prev|sample|teaser)([\s._-]|$)/.test(lower);
  if (["mid", "midi", "smf"].includes(ext)) return "SOURCE_MIDI";
  if (ext === "dmi") return "SOURCE_DMI";
  if (["jpg", "jpeg", "png", "webp", "avif"].includes(ext)) return "COVER_IMAGE";
  if (ext === "pdf") return "DOCUMENT";
  if (["mp3", "m4a", "ogg"].includes(ext)) return isPreview ? "PREVIEW_AUDIO" : "SOURCE_AUDIO";
  if (["wav", "aif", "aiff", "flac"].includes(ext)) return "SOURCE_AUDIO";
  if (["mp4", "webm"].includes(ext)) return isPreview ? "PREVIEW_VIDEO" : "SOURCE_VIDEO";
  if (["mov", "m4v", "mkv"].includes(ext)) return "SOURCE_VIDEO";
  return null;
}

function startsWith(head: Uint8Array, bytes: number[], offset = 0): boolean {
  if (head.length < offset + bytes.length) return false;
  return bytes.every((b, i) => head[offset + i] === b);
}
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/**
 * Detects the real file type from magic bytes. `dmiMagic` is the optional configured
 * signature of the proprietary DMI container (hex) — without it DMI cannot be sniffed and
 * the caller records a warning instead.
 */
export function sniffFileType(head: Uint8Array, dmiMagic?: Uint8Array | null): DetectedType | null {
  if (startsWith(head, ascii("MThd"))) return { mime: "audio/midi", family: "midi" };
  if (dmiMagic && dmiMagic.length > 0 && startsWith(head, [...dmiMagic])) return { mime: "application/x-dmi", family: "dmi" };
  if (startsWith(head, ascii("RIFF")) && startsWith(head, ascii("WAVE"), 8)) return { mime: "audio/wav", family: "audio" };
  if (startsWith(head, ascii("RIFF")) && startsWith(head, ascii("WEBP"), 8)) return { mime: "image/webp", family: "image" };
  if (startsWith(head, ascii("FORM")) && (startsWith(head, ascii("AIFF"), 8) || startsWith(head, ascii("AIFC"), 8))) {
    return { mime: "audio/aiff", family: "audio" };
  }
  if (startsWith(head, ascii("fLaC"))) return { mime: "audio/flac", family: "audio" };
  if (startsWith(head, ascii("OggS"))) return { mime: "audio/ogg", family: "audio" };
  if (startsWith(head, ascii("ID3"))) return { mime: "audio/mpeg", family: "audio" };
  if (head.length >= 2 && head[0] === 0xff && (head[1]! & 0xe0) === 0xe0 && (head[1]! & 0x06) !== 0) {
    return { mime: "audio/mpeg", family: "audio" };
  }
  if (startsWith(head, ascii("ftyp"), 4)) {
    const brand = String.fromCharCode(...head.subarray(8, 12));
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", family: "image" };
    if (brand.startsWith("M4A") || brand === "M4B ") return { mime: "audio/mp4", family: "audio" };
    if (brand === "qt  ") return { mime: "video/quicktime", family: "video" };
    return { mime: "video/mp4", family: "video" };
  }
  if (startsWith(head, [0x1a, 0x45, 0xdf, 0xa3])) return { mime: "video/webm", family: "video" };
  if (startsWith(head, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", family: "image" };
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", family: "image" };
  if (startsWith(head, ascii("%PDF-"))) return { mime: "application/pdf", family: "pdf" };
  return null;
}

export function hexToBytes(hex: string | undefined | null): Uint8Array | null {
  if (!hex) return null;
  const clean = hex.replace(/[^0-9a-f]/gi, "");
  if (clean.length === 0 || clean.length % 2) return null;
  return Uint8Array.from(clean.match(/../g)!.map((b) => parseInt(b, 16)));
}
