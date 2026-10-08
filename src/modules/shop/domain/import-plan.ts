/**
 * Bulk import planning (pure). Turns a metadata CSV + a list of selected files into a
 * reviewable dry-run plan: which rows create DRAFT arrangements, which attach files to
 * existing SKUs, how each file maps to (SKU, asset kind), and every problem found.
 * Nothing here touches the catalog.
 */
import Papa from "papaparse";
import { ASSET_POLICIES, fileExtension, guessKindFromFilename, type AssetKindValue } from "./asset-policy";
import { parseDecimalToCents } from "./money";

export const IMPORT_CSV_COLUMNS = [
  "sku", "title", "workTitle", "originalArtist", "arranger", "price", "currency", "genre", "compatibility",
  "sourceMidiFilename", "sourceDmiFilename", "sourceAudioFilename", "sourceVideoFilename",
  "previewAudioFilename", "previewVideoFilename", "coverFilename",
] as const;

export const FILE_COLUMNS: Record<string, AssetKindValue> = {
  sourceMidiFilename: "SOURCE_MIDI",
  sourceDmiFilename: "SOURCE_DMI",
  sourceAudioFilename: "SOURCE_AUDIO",
  sourceVideoFilename: "SOURCE_VIDEO",
  previewAudioFilename: "PREVIEW_AUDIO",
  previewVideoFilename: "PREVIEW_VIDEO",
  coverFilename: "COVER_IMAGE",
};

export const MAX_IMPORT_ROWS = 5000;

export type Issue = { code: string; message: string };

export type NormalizedRow = {
  rowNumber: number;
  raw: Record<string, string>;
  sku: string | null;
  title: string | null;
  workTitle: string | null;
  originalArtist: string | null;
  arranger: string | null;
  priceCents: number | null;
  currency: string;
  genres: string[];
  compatibility: string[];
  files: Partial<Record<AssetKindValue, string>>;
  errors: Issue[];
  warnings: Issue[];
};

export function csvTemplate(): string {
  const example = [
    "DMI-0001", "Clair de Lune (Concert Edition)", "Clair de Lune", "Claude Debussy", "Jane Arranger", "14.90", "EUR",
    "Classical;Romantic", "GENERIC", "DMI-0001.mid", "DMI-0001.dmi", "", "", "DMI-0001_preview.mp3", "", "DMI-0001_cover.jpg",
  ];
  return `${IMPORT_CSV_COLUMNS.join(",")}\n${example.map(csvCell).join(",")}\n`;
}

function csvCell(v: string) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const splitList = (v: string | undefined) =>
  (v ?? "").split(/[;|]/).map((s) => s.trim()).filter(Boolean);

const basename = (p: string) => (p.split(/[\\/]/).pop() ?? p).trim();
const norm = (p: string) => basename(p).toLowerCase();

export function parseImportCsv(text: string): { rows: NormalizedRow[]; errors: Issue[] } {
  const errors: Issue[] = [];
  const parsed = Papa.parse<Record<string, string>>(text.replace(/^﻿/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => {
      const key = h.trim().toLowerCase().replace(/[\s_-]/g, "");
      return IMPORT_CSV_COLUMNS.find((c) => c.toLowerCase() === key) ?? `__unknown__${h.trim()}`;
    },
  });
  for (const e of parsed.errors.slice(0, 20)) {
    errors.push({ code: "CSV_PARSE", message: `Row ${(e.row ?? 0) + 2}: ${e.message}` });
  }
  const fields = parsed.meta.fields ?? [];
  if (!fields.includes("sku")) errors.push({ code: "CSV_MISSING_SKU_COLUMN", message: "The CSV needs a 'sku' column." });
  const unknown = fields.filter((f) => f.startsWith("__unknown__")).map((f) => f.slice(11));
  if (unknown.length) errors.push({ code: "CSV_UNKNOWN_COLUMNS", message: `Ignored unknown columns: ${unknown.join(", ")}` });
  if (parsed.data.length > MAX_IMPORT_ROWS) {
    errors.push({ code: "CSV_TOO_MANY_ROWS", message: `At most ${MAX_IMPORT_ROWS} rows per batch.` });
  }

  const seen = new Map<string, number>();
  const rows = parsed.data.slice(0, MAX_IMPORT_ROWS).map((raw, i): NormalizedRow => {
    const rowNumber = i + 2; // header is row 1
    const get = (k: string) => (raw[k] ?? "").toString().trim();
    const rowErrors: Issue[] = [];
    const rowWarnings: Issue[] = [];
    const sku = get("sku") || null;
    if (!sku) rowErrors.push({ code: "SKU_MISSING", message: "SKU is required." });
    else if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(sku)) rowErrors.push({ code: "SKU_INVALID", message: `Invalid SKU '${sku}'.` });
    else if (seen.has(sku.toLowerCase())) {
      rowErrors.push({ code: "SKU_DUPLICATE_IN_CSV", message: `SKU also on row ${seen.get(sku.toLowerCase())}.` });
    } else seen.set(sku.toLowerCase(), rowNumber);

    const priceRaw = get("price");
    const priceCents = priceRaw ? parseDecimalToCents(priceRaw) : null;
    if (priceRaw && priceCents == null) rowErrors.push({ code: "PRICE_INVALID", message: `Invalid price '${priceRaw}'.` });
    const currency = (get("currency") || "EUR").toUpperCase();
    if (currency !== "EUR") rowErrors.push({ code: "CURRENCY_UNSUPPORTED", message: "Only EUR is supported." });

    const files: Partial<Record<AssetKindValue, string>> = {};
    for (const [col, kind] of Object.entries(FILE_COLUMNS)) {
      const v = get(col);
      if (v) files[kind] = basename(v);
    }
    return {
      rowNumber,
      raw: Object.fromEntries(Object.entries(raw).filter(([k]) => !k.startsWith("__unknown__")).map(([k, v]) => [k, String(v ?? "")])),
      sku,
      title: get("title") || null,
      workTitle: get("workTitle") || null,
      originalArtist: get("originalArtist") || null,
      arranger: get("arranger") || null,
      priceCents,
      currency,
      genres: splitList(get("genre")),
      compatibility: splitList(get("compatibility")).map((c) => c.toUpperCase()),
      files,
      errors: rowErrors,
      warnings: rowWarnings,
    };
  });
  return { rows, errors };
}

export type PlanFile = {
  clientId: string;
  filename: string;
  relativePath?: string | null;
  bytes: number;
  sha256?: string | null;
  contentType?: string;
};

export type PlannedRow = NormalizedRow & {
  action: "CREATE_DRAFT" | "ATTACH_TO_EXISTING" | "INVALID";
  existingArrangementId: string | null;
  willCreateArranger: boolean;
  willCreateWork: boolean;
  unknownCompatibility: string[];
  newGenres: string[];
  missingFiles: string[];
};

export type PlannedItem = {
  clientId: string;
  filename: string;
  relativePath: string | null;
  bytes: number;
  sha256: string | null;
  kind: AssetKindValue | null;
  sku: string | null;
  rowNumber: number | null;
  /** QUEUED = ready to upload; NEEDS_REVIEW = admin must fix mapping first; FAILED = rejected. */
  status: "QUEUED" | "NEEDS_REVIEW" | "FAILED";
  errors: Issue[];
  warnings: Issue[];
};

export type DryRunSummary = {
  rows: number;
  newDrafts: number;
  matchedExisting: number;
  invalidRows: number;
  files: number;
  filesReady: number;
  filesNeedingReview: number;
  filesRejected: number;
  unmatchedFiles: number;
  duplicateFilenames: number;
  duplicateChecksums: number;
  missingReferencedFiles: number;
};

export type CatalogSnapshot = {
  /** sku (lower-case) → arrangement id */
  existingSkus: ReadonlyMap<string, string>;
  /** arranger name or slug (lower-case) → id */
  arrangers: ReadonlyMap<string, string>;
  /** "title|artist" (lower-case) → work id */
  works: ReadonlyMap<string, string>;
  /** genre name or slug (lower-case) */
  genres: ReadonlySet<string>;
  /** system profile codes (upper-case) */
  profileCodes: ReadonlySet<string>;
  /** sha256 → description of the existing AssetVersion */
  knownChecksums: ReadonlyMap<string, string>;
};

export function workKey(title: string, artist: string | null) {
  return `${title.trim().toLowerCase()}|${(artist ?? "").trim().toLowerCase()}`;
}

export function buildDryRun(input: { rows: NormalizedRow[]; files: PlanFile[]; catalog: CatalogSnapshot }) {
  const { catalog } = input;

  // Rows.
  const plannedRows: PlannedRow[] = input.rows.map((r) => {
    const errors = [...r.errors];
    const warnings = [...r.warnings];
    const existingId = r.sku ? catalog.existingSkus.get(r.sku.toLowerCase()) ?? null : null;
    let action: PlannedRow["action"] = existingId ? "ATTACH_TO_EXISTING" : "CREATE_DRAFT";
    let willCreateArranger = false;
    let willCreateWork = false;
    const unknownCompatibility = r.compatibility.filter((c) => !catalog.profileCodes.has(c));
    const newGenres = r.genres.filter((g) => !catalog.genres.has(g.toLowerCase()));

    if (existingId) {
      if (r.title || r.priceCents != null || r.arranger) {
        warnings.push({ code: "EXISTING_FIELDS_IGNORED", message: "SKU exists, so catalog fields are ignored and only files are attached." });
      }
    } else {
      if (!r.title) errors.push({ code: "TITLE_MISSING", message: "Title is required for a new arrangement." });
      if (!r.workTitle) errors.push({ code: "WORK_MISSING", message: "workTitle is required for a new arrangement." });
      if (!r.arranger) errors.push({ code: "ARRANGER_MISSING", message: "arranger is required for a new arrangement." });
      if (r.priceCents == null || r.priceCents <= 0) {
        if (!errors.some((e) => e.code === "PRICE_INVALID")) errors.push({ code: "PRICE_MISSING", message: "A price above zero is required." });
      }
      if (r.arranger && !catalog.arrangers.has(r.arranger.toLowerCase())) {
        willCreateArranger = true;
        warnings.push({ code: "NEW_ARRANGER", message: `Arranger '${r.arranger}' will be created (royalty 0%, review the terms).` });
      }
      if (r.workTitle && !catalog.works.has(workKey(r.workTitle, r.originalArtist))) willCreateWork = true;
      if (unknownCompatibility.length) {
        warnings.push({ code: "UNKNOWN_COMPATIBILITY", message: `Unknown profile code(s) ignored: ${unknownCompatibility.join(", ")}` });
      }
      if (r.compatibility.length === 0) {
        warnings.push({ code: "NO_COMPATIBILITY", message: "No compatibility given. It is required before publishing." });
      }
      if (newGenres.length) warnings.push({ code: "NEW_GENRES", message: `New genre(s) will be created: ${newGenres.join(", ")}` });
    }
    if (errors.length) action = "INVALID";
    return {
      ...r, errors, warnings, action, existingArrangementId: existingId,
      willCreateArranger, willCreateWork, unknownCompatibility, newGenres, missingFiles: [],
    };
  });

  // References from the CSV: filename → [(row, kind)]
  const refs = new Map<string, { row: PlannedRow; kind: AssetKindValue }[]>();
  for (const row of plannedRows) {
    for (const [kind, filename] of Object.entries(row.files) as [AssetKindValue, string][]) {
      const k = norm(filename);
      refs.set(k, [...(refs.get(k) ?? []), { row, kind }]);
    }
  }

  const allSkus = new Map<string, string>(); // lower → canonical
  for (const [lower] of catalog.existingSkus) allSkus.set(lower, lower);
  for (const r of plannedRows) if (r.sku && r.action !== "INVALID") allSkus.set(r.sku.toLowerCase(), r.sku);
  const skuList = [...allSkus.keys()].sort((a, b) => b.length - a.length);

  const nameCounts = new Map<string, number>();
  for (const f of input.files) nameCounts.set(norm(f.filename), (nameCounts.get(norm(f.filename)) ?? 0) + 1);
  const shaSeen = new Map<string, string>();

  const items: PlannedItem[] = input.files.map((f) => {
    const errors: Issue[] = [];
    const warnings: Issue[] = [];
    const key = norm(f.filename);
    let sku: string | null = null;
    let kind: AssetKindValue | null = null;
    let rowNumber: number | null = null;
    const sha = f.sha256?.toLowerCase() ?? null;

    const duplicateName = (nameCounts.get(key) ?? 0) > 1;
    if (duplicateName) warnings.push({ code: "DUPLICATE_FILENAME", message: "Another selected file has the same name." });

    const referenced = refs.get(key);
    if (referenced && referenced.length > 1) {
      errors.push({ code: "AMBIGUOUS_REFERENCE", message: `Referenced by ${referenced.length} CSV cells (rows ${referenced.map((r) => r.row.rowNumber).join(", ")}).` });
    } else if (referenced && duplicateName) {
      errors.push({ code: "AMBIGUOUS_FILE", message: "The CSV references this name but several selected files share it." });
    } else if (referenced) {
      const ref = referenced[0]!;
      kind = ref.kind;
      rowNumber = ref.row.rowNumber;
      sku = ref.row.action === "INVALID" ? null : ref.row.sku;
      if (ref.row.action === "INVALID") {
        warnings.push({ code: "ROW_INVALID", message: `CSV row ${ref.row.rowNumber} is invalid; map this file to a SKU manually or fix the CSV.` });
      }
    } else {
      const base = key.replace(/\.[^.]+$/, "");
      const match = skuList.find((s) => base === s || base.startsWith(`${s}_`) || base.startsWith(`${s}-`) || base.startsWith(`${s} `) || base.startsWith(`${s}.`));
      // SKUs resolve case-insensitively when the plan is applied.
      if (match) sku = allSkus.get(match)!;
      kind = guessKindFromFilename(f.filename);
      if (!sku) warnings.push({ code: "UNMATCHED_SKU", message: "Could not match this file to a SKU. Map it before applying." });
      if (!kind) errors.push({ code: "UNKNOWN_KIND", message: "Could not determine the asset type. Choose one." });
    }

    if (kind) {
      const policy = ASSET_POLICIES[kind];
      const ext = fileExtension(f.filename);
      if (!policy.extensions.includes(ext)) {
        errors.push({ code: "EXTENSION_NOT_ALLOWED", message: `.${ext} is not allowed for ${kind}.` });
      }
      if (f.bytes > policy.maxBytes) errors.push({ code: "TOO_LARGE", message: `Exceeds the ${kind} size limit.` });
    }
    if (f.bytes <= 0) errors.push({ code: "EMPTY_FILE", message: "File is empty." });

    if (sha) {
      const prior = shaSeen.get(sha);
      if (prior) warnings.push({ code: "DUPLICATE_CHECKSUM", message: `Identical content to selected file '${prior}'.` });
      else shaSeen.set(sha, f.filename);
      const existing = catalog.knownChecksums.get(sha);
      if (existing) warnings.push({ code: "DUPLICATE_OF_EXISTING", message: `Identical to existing master ${existing}.` });
    }

    const hardErrors = errors.filter((e) => e.code === "EXTENSION_NOT_ALLOWED" || e.code === "TOO_LARGE" || e.code === "EMPTY_FILE");
    const status: PlannedItem["status"] = hardErrors.length ? "FAILED" : errors.length || !kind ? "NEEDS_REVIEW" : "QUEUED";
    return {
      clientId: f.clientId,
      filename: basename(f.filename),
      relativePath: f.relativePath ?? null,
      bytes: f.bytes,
      sha256: sha,
      kind,
      sku,
      rowNumber,
      status,
      errors,
      warnings,
    };
  });

  // Files the CSV references that were not selected.
  const selected = new Set(input.files.map((f) => norm(f.filename)));
  let missingReferencedFiles = 0;
  for (const row of plannedRows) {
    for (const filename of Object.values(row.files)) {
      if (filename && !selected.has(norm(filename))) {
        row.missingFiles.push(filename);
        missingReferencedFiles++;
      }
    }
    if (row.missingFiles.length) {
      row.warnings.push({ code: "FILES_NOT_SELECTED", message: `Not selected: ${row.missingFiles.join(", ")}` });
    }
  }

  const summary: DryRunSummary = {
    rows: plannedRows.length,
    newDrafts: plannedRows.filter((r) => r.action === "CREATE_DRAFT").length,
    matchedExisting: plannedRows.filter((r) => r.action === "ATTACH_TO_EXISTING").length,
    invalidRows: plannedRows.filter((r) => r.action === "INVALID").length,
    files: items.length,
    filesReady: items.filter((i) => i.status === "QUEUED" && i.sku).length,
    filesNeedingReview: items.filter((i) => i.status === "NEEDS_REVIEW" || (i.status === "QUEUED" && !i.sku)).length,
    filesRejected: items.filter((i) => i.status === "FAILED").length,
    unmatchedFiles: items.filter((i) => !i.sku).length,
    duplicateFilenames: items.filter((i) => i.warnings.some((w) => w.code === "DUPLICATE_FILENAME")).length,
    duplicateChecksums: items.filter((i) => i.warnings.some((w) => w.code === "DUPLICATE_CHECKSUM" || w.code === "DUPLICATE_OF_EXISTING")).length,
    missingReferencedFiles,
  };
  return { rows: plannedRows, items, summary };
}
