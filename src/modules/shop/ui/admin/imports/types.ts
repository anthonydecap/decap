import { ASSET_POLICIES, fileExtension, type AssetKindValue } from "../../../domain/asset-policy";

/** Client-side shapes of the bulk import API responses. */

export type Issue = { code: string; message: string };

export type ItemStatus =
  | "QUEUED" | "UPLOADING" | "UPLOADED" | "VALIDATING" | "READY" | "NEEDS_REVIEW" | "FAILED" | "SKIPPED";

export type BatchItem = {
  id: string;
  originalFilename: string;
  relativePath: string | null;
  kind: AssetKindValue | null;
  targetSku: string | null;
  status: ItemStatus;
  bytes: number;
  hasChecksum: boolean;
  attemptCount: number;
  errors: Issue[];
  warnings: Issue[];
  applied: boolean;
};

export type BatchRow = {
  rowNumber: number;
  sku: string | null;
  errors: Issue[] | null;
  warnings: Issue[] | null;
  action: string | null;
  resultingArrangementId: string | null;
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

export type BatchDetail = {
  id: string;
  label: string | null;
  status: string;
  totalItems: number;
  uploadedItems: number;
  validItems: number;
  failedItems: number;
  dryRunSummary: (Partial<DryRunSummary> & { csvErrors?: Issue[] }) | null;
  confirmedAt: string | null;
  completedAt: string | null;
  rows: BatchRow[];
  items: BatchItem[];
};

export type PlannedRow = {
  rowNumber: number;
  sku: string | null;
  title: string | null;
  action: "CREATE_DRAFT" | "ATTACH_TO_EXISTING" | "INVALID";
  errors: Issue[];
  warnings: Issue[];
};

export type PlannedItem = {
  clientId: string;
  filename: string;
  relativePath: string | null;
  bytes: number;
  kind: AssetKindValue | null;
  sku: string | null;
  rowNumber: number | null;
  status: "QUEUED" | "NEEDS_REVIEW" | "FAILED";
  errors: Issue[];
  warnings: Issue[];
};

export type DryRunResponse = {
  summary: DryRunSummary;
  rows: PlannedRow[];
  items: PlannedItem[];
  idMap: { clientId: string; itemId: string }[];
};

export const KIND_LABELS: Record<AssetKindValue, string> = {
  SOURCE_MIDI: "MIDI master",
  SOURCE_DMI: "DMI master",
  SOURCE_AUDIO: "Audio master",
  SOURCE_VIDEO: "Video master",
  PREVIEW_AUDIO: "Audio preview",
  PREVIEW_VIDEO: "Video preview",
  COVER_IMAGE: "Cover image",
  DOCUMENT: "Document",
};

export const ROW_ACTION_LABELS: Record<string, string> = {
  CREATE_DRAFT: "New draft",
  ATTACH_TO_EXISTING: "Attach to existing",
  INVALID: "Invalid",
};

/** Asset kinds whose policy allows this file's extension (what a remap may choose). */
export function allowedKindsFor(filename: string): AssetKindValue[] {
  const ext = fileExtension(filename);
  return (Object.keys(ASSET_POLICIES) as AssetKindValue[]).filter((k) => ASSET_POLICIES[k].extensions.includes(ext));
}

/** Mirrors the server's notion of a rejected item that cannot be re-uploaded without a remap/retry. */
const HARD_FAILURES = ["EXTENSION_NOT_ALLOWED", "TOO_LARGE", "EMPTY_FILE", "MALWARE_DETECTED"];
export function isHardFailure(item: Pick<BatchItem, "status" | "errors">) {
  return item.status === "FAILED" && item.errors.some((e) => HARD_FAILURES.includes(e.code));
}

/** Server statuses from which the presign endpoint will issue an upload target. */
export function isUploadable(item: BatchItem) {
  if (item.applied || !item.kind) return false;
  if (!["QUEUED", "UPLOADING", "FAILED"].includes(item.status)) return false;
  return !isHardFailure(item);
}

/** Display hygiene: no em or en dashes in admin-visible text. */
export function cleanText(s: string): string {
  return s.replace(/\s+[\u2014\u2013]\s+/g, ", ").replace(/[\u2014\u2013]/g, "-");
}

export const HASH_INLINE_LIMIT = 256 * 1024 * 1024;
