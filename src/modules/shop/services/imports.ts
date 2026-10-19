import "server-only";
import type { ImportBatchItem, Prisma } from "@/generated/shop-prisma/client";
import { ASSET_POLICIES, fileExtension, normaliseDeclaredMime, type AssetKindValue } from "../domain/asset-policy";
import {
  buildDryRun, parseImportCsv, workKey, type CatalogSnapshot, type Issue, type NormalizedRow, type PlanFile,
} from "../domain/import-plan";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import { storage } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { audit } from "./audit";
import { issueUploadTarget } from "./assets";
import { validateStoredObject } from "./asset-validation";

/**
 * Bulk import center. Each item moves through its own lifecycle
 *   QUEUED → UPLOADING → (UPLOADED) → VALIDATING → READY | NEEDS_REVIEW | FAILED
 * independently, so a failed file is retried alone and never rolls back the others.
 * Apply creates DRAFT arrangements (never published) and immutable AssetVersions.
 */

type Staff = { staffId: string };
const json = (v: unknown) => v as Prisma.InputJsonValue;

export async function createImportBatch(s: Staff, input: { label?: string; manifestFilename?: string; manifestCsv?: string }) {
  const db = shopDb();
  let parsed: { rows: NormalizedRow[]; errors: Issue[] } = { rows: [], errors: [] };
  if (input.manifestCsv) parsed = parseImportCsv(input.manifestCsv);

  const batch = await db.importBatch.create({
    data: {
      createdByStaffId: s.staffId,
      label: input.label ?? null,
      manifestFilename: input.manifestFilename ?? null,
      status: "DRAFT",
      dryRunSummary: parsed.errors.length ? json({ csvErrors: parsed.errors }) : undefined,
    },
  });
  if (parsed.rows.length) {
    await db.importMetadataRow.createMany({
      data: parsed.rows.map((r) => ({
        importBatchId: batch.id,
        rowNumber: r.rowNumber,
        raw: json(r.raw),
        normalized: json(r),
        errors: json(r.errors),
        warnings: json(r.warnings),
        sku: r.sku,
      })),
    });
  }
  await audit({ type: "STAFF", staffId: s.staffId }, "import.created", { type: "ImportBatch", id: batch.id }, {
    rows: parsed.rows.length, csvErrors: parsed.errors.length, manifest: input.manifestFilename ?? null,
  });
  return { batch, csvErrors: parsed.errors, rowCount: parsed.rows.length };
}

async function catalogSnapshot(shas: string[]): Promise<CatalogSnapshot> {
  const db = shopDb();
  const [arrangements, arrangers, works, genres, profiles, versions] = await Promise.all([
    db.arrangement.findMany({ select: { id: true, sku: true } }),
    db.arranger.findMany({ select: { id: true, name: true, slug: true } }),
    db.work.findMany({ select: { id: true, title: true, originalArtist: true } }),
    db.genre.findMany({ select: { name: true, slug: true } }),
    db.systemProfile.findMany({ where: { active: true }, select: { code: true } }),
    shas.length
      ? db.assetVersion.findMany({
          where: { sha256: { in: shas }, status: "VALID" },
          select: { sha256: true, versionNumber: true, asset: { select: { kind: true, arrangement: { select: { sku: true } } } } },
        })
      : Promise.resolve([]),
  ]);
  const arrangerMap = new Map<string, string>();
  for (const a of arrangers) { arrangerMap.set(a.name.toLowerCase(), a.id); arrangerMap.set(a.slug.toLowerCase(), a.id); }
  return {
    existingSkus: new Map(arrangements.map((a) => [a.sku.toLowerCase(), a.id])),
    arrangers: arrangerMap,
    works: new Map(works.map((w) => [workKey(w.title, w.originalArtist), w.id])),
    genres: new Set(genres.flatMap((g) => [g.name.toLowerCase(), g.slug.toLowerCase()])),
    profileCodes: new Set(profiles.map((p) => p.code.toUpperCase())),
    knownChecksums: new Map(versions.map((v) => [
      v.sha256!, `${v.asset.arrangement?.sku ?? "unassigned"} ${v.asset.kind} v${v.versionNumber}`,
    ])),
  };
}

/** Builds/rebuilds the dry-run plan and staging items. Repeatable until confirmed. */
export async function dryRunImport(s: Staff, batchId: string, files: PlanFile[]) {
  const db = shopDb();
  const batch = await db.importBatch.findUnique({ where: { id: batchId }, include: { metadataRows: { orderBy: { rowNumber: "asc" } } } });
  if (!batch) throw new ShopError("NOT_FOUND", "Import batch not found");
  if (batch.confirmedAt) throw new ShopError("INVALID_STATE", "Batch already confirmed; use remap instead");

  const rows = batch.metadataRows.map((r) => r.normalized as unknown as NormalizedRow);
  const catalog = await catalogSnapshot(files.map((f) => f.sha256?.toLowerCase()).filter(Boolean) as string[]);
  const plan = buildDryRun({ rows, files, catalog });
  const rowIdByNumber = new Map(batch.metadataRows.map((r) => [r.rowNumber, r.id]));
  const csvErrors = (batch.dryRunSummary as { csvErrors?: Issue[] } | null)?.csvErrors ?? [];

  const created = await db.$transaction(async (tx) => {
    await tx.importBatchItem.deleteMany({ where: { importBatchId: batchId } });
    for (const r of plan.rows) {
      await tx.importMetadataRow.update({
        where: { importBatchId_rowNumber: { importBatchId: batchId, rowNumber: r.rowNumber } },
        data: { errors: json(r.errors), warnings: json(r.warnings), normalized: json(r) },
      });
    }
    const out: { clientId: string; itemId: string }[] = [];
    for (const it of plan.items) {
      const item = await tx.importBatchItem.create({
        data: {
          importBatchId: batchId,
          originalFilename: it.filename,
          relativePath: it.relativePath,
          detectedAssetKind: it.kind,
          targetSku: it.sku,
          targetArrangementId: it.sku ? catalog.existingSkus.get(it.sku.toLowerCase()) ?? null : null,
          metadataRowId: it.rowNumber ? rowIdByNumber.get(it.rowNumber) ?? null : null,
          declaredBytes: BigInt(it.bytes),
          declaredSha256: it.sha256,
          declaredMimeType: it.kind ? normaliseDeclaredMime(it.kind, files.find((f) => f.clientId === it.clientId)?.contentType, it.filename) : null,
          status: it.status,
          validationErrors: json(it.errors),
          validationWarnings: json(it.warnings),
        },
      });
      out.push({ clientId: it.clientId, itemId: item.id });
    }
    await tx.importBatch.update({
      where: { id: batchId },
      data: {
        totalItems: plan.items.length,
        uploadedItems: 0, validItems: 0, failedItems: plan.items.filter((i) => i.status === "FAILED").length,
        status: "REVIEW_REQUIRED",
        dryRunSummary: json({ ...plan.summary, csvErrors }),
      },
    });
    return out;
  });

  await audit({ type: "STAFF", staffId: s.staffId }, "import.dry_run", { type: "ImportBatch", id: batchId }, plan.summary);
  return { summary: plan.summary, rows: plan.rows, items: plan.items, idMap: created };
}

export async function confirmImport(s: Staff, batchId: string) {
  const db = shopDb();
  const batch = await db.importBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ShopError("NOT_FOUND", "Import batch not found");
  if (batch.totalItems === 0 && !(await db.importMetadataRow.count({ where: { importBatchId: batchId } }))) {
    throw new ShopError("INVALID_STATE", "Run the dry run first");
  }
  if (!batch.confirmedAt) {
    await db.importBatch.update({ where: { id: batchId }, data: { confirmedAt: new Date(), status: "UPLOADING" } });
    await audit({ type: "STAFF", staffId: s.staffId }, "import.confirmed", { type: "ImportBatch", id: batchId });
  }
}

const UPLOADABLE: ImportBatchItem["status"][] = ["QUEUED", "UPLOADING", "FAILED"];

/** Issues scoped short-lived upload targets for up to 50 items (the client queue asks in small pages). */
export async function presignImportItems(s: Staff, batchId: string, itemIds: string[]) {
  const db = shopDb();
  const batch = await db.importBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ShopError("NOT_FOUND", "Import batch not found");
  if (!batch.confirmedAt) throw new ShopError("INVALID_STATE", "Confirm the dry run before uploading");
  if (batch.status === "COMPLETED") throw new ShopError("INVALID_STATE", "Batch already completed");

  const items = await db.importBatchItem.findMany({ where: { id: { in: itemIds }, importBatchId: batchId } });
  if (items.length !== itemIds.length) throw new ShopError("NOT_FOUND", "Unknown item in this batch");

  const results: { itemId: string; target?: unknown; expiresAt?: string; error?: string }[] = [];
  for (const item of items) {
    if (!UPLOADABLE.includes(item.status) || !item.detectedAssetKind) {
      results.push({ itemId: item.id, error: `Item is ${item.status}${item.detectedAssetKind ? "" : " (no asset type)"}` });
      continue;
    }
    if (item.status === "FAILED" && hasHardFailure(item)) {
      results.push({ itemId: item.id, error: "Item was rejected; remap or skip it" });
      continue;
    }
    const kind = item.detectedAssetKind as AssetKindValue;
    const policy = ASSET_POLICIES[kind];
    const bytes = Number(item.declaredBytes ?? 0);
    const mime = item.declaredMimeType ?? normaliseDeclaredMime(kind, undefined, item.originalFilename);
    // A retry always gets a fresh key — a half-written object is never reused.
    const key = generateObjectKey(policy.store, `import-${kind.toLowerCase().replace("_", "-")}`, fileExtension(item.originalFilename));
    await db.importBatchItem.update({
      where: { id: item.id },
      data: { status: "UPLOADING", storageStore: policy.store, storageKey: key, attemptCount: { increment: 1 } },
    });
    const { target, expiresAt } = await issueUploadTarget({
      store: policy.store, key, contentType: mime, bytes, staffId: s.staffId, purpose: `import-item:${item.id}`,
    });
    results.push({ itemId: item.id, target, expiresAt: expiresAt.toISOString() });
  }
  if (batch.status === "REVIEW_REQUIRED" || batch.status === "DRAFT") {
    await db.importBatch.update({ where: { id: batchId }, data: { status: "UPLOADING" } });
  }
  return results;
}

function hasHardFailure(item: ImportBatchItem) {
  const errs = (item.validationErrors as Issue[] | null) ?? [];
  return errs.some((e) => ["EXTENSION_NOT_ALLOWED", "TOO_LARGE", "EMPTY_FILE", "MALWARE_DETECTED"].includes(e.code));
}

/** Verifies one uploaded item. Independent of every other item. */
export async function finalizeImportItem(s: Staff, batchId: string, itemId: string, declaredSha256?: string | null) {
  const db = shopDb();
  const item = await db.importBatchItem.findFirst({ where: { id: itemId, importBatchId: batchId } });
  if (!item) throw new ShopError("NOT_FOUND", "Import item not found");
  if (!item.storageKey || !item.storageStore || !item.detectedAssetKind) {
    throw new ShopError("INVALID_STATE", "Item has no upload in progress");
  }
  if (item.status === "READY") return item;

  if (declaredSha256 && !item.declaredSha256) {
    await db.importBatchItem.update({ where: { id: item.id }, data: { declaredSha256: declaredSha256.toLowerCase() } });
  }
  await db.importBatchItem.update({ where: { id: item.id }, data: { status: "VALIDATING" } });
  const result = await validateStoredObject({
    ref: { store: item.storageStore, key: item.storageKey },
    kind: item.detectedAssetKind as AssetKindValue,
    declaredBytes: Number(item.declaredBytes ?? 0),
    declaredSha256: declaredSha256?.toLowerCase() ?? item.declaredSha256,
  });

  const planWarnings = ((item.validationWarnings as Issue[] | null) ?? []).filter((w) => w.code !== "UNMATCHED_SKU");
  const warnings: Issue[] = [...planWarnings, ...result.warnings];
  let status: ImportBatchItem["status"];
  if (!result.ok) status = result.errors.some((e) => e.code === "NOT_UPLOADED") ? "UPLOADING" : "FAILED";
  else if (!item.targetSku) {
    status = "NEEDS_REVIEW";
    warnings.push({ code: "UNMATCHED_SKU", message: "Map this file to a SKU before applying." });
  } else status = "READY";

  // Duplicate of an already-stored master (by verified checksum)?
  if (result.ok && result.sha256) {
    const dup = await db.assetVersion.findFirst({ where: { sha256: result.sha256, status: "VALID" }, select: { id: true } });
    if (dup && !warnings.some((w) => w.code === "DUPLICATE_OF_EXISTING")) {
      warnings.push({ code: "DUPLICATE_OF_EXISTING", message: "Identical content already exists as a master version." });
    }
  }

  const updated = await db.importBatchItem.update({
    where: { id: item.id },
    data: {
      status,
      bytes: result.bytes != null ? BigInt(result.bytes) : null,
      sha256: result.sha256,
      validationErrors: json(result.errors),
      validationWarnings: json(warnings),
      technicalMetadata: result.technicalMetadata ? json(result.technicalMetadata) : undefined,
    },
  });
  await refreshBatchCounters(batchId);
  return updated;
}

export async function patchImportItem(
  s: Staff,
  batchId: string,
  itemId: string,
  patch: { action: "remap" | "skip" | "unskip" | "retry"; targetSku?: string | null; assetKind?: AssetKindValue },
) {
  const db = shopDb();
  const item = await db.importBatchItem.findFirst({ where: { id: itemId, importBatchId: batchId } });
  if (!item) throw new ShopError("NOT_FOUND", "Import item not found");
  const batch = await db.importBatch.findUniqueOrThrow({ where: { id: batchId } });
  if (batch.status === "COMPLETED") throw new ShopError("INVALID_STATE", "Batch already completed");
  if (item.resultingAssetVersionId) throw new ShopError("INVALID_STATE", "Item was already applied");

  const data: Prisma.ImportBatchItemUpdateInput = {};
  switch (patch.action) {
    case "skip":
      data.status = "SKIPPED";
      break;
    case "unskip":
    case "retry":
      data.status = item.storageKey ? "UPLOADING" : "QUEUED";
      if (item.status === "FAILED") { data.status = "QUEUED"; data.storageKey = null; data.storageStore = null; }
      data.validationErrors = json([]);
      break;
    case "remap": {
      if (patch.targetSku !== undefined) {
        const skuValue = patch.targetSku?.trim() || null;
        if (skuValue) {
          const existing = await db.arrangement.findFirst({ where: { sku: { equals: skuValue, mode: "insensitive" } }, select: { id: true, sku: true } });
          const inCsv = await db.importMetadataRow.findFirst({
            where: { importBatchId: batchId, sku: { equals: skuValue, mode: "insensitive" } },
            select: { id: true, errors: true },
          });
          if (!existing && (!inCsv || ((inCsv.errors as Issue[] | null) ?? []).length)) {
            throw new ShopError("VALIDATION_FAILED", `SKU ${skuValue} is neither in the catalog nor a valid row of this CSV`);
          }
          data.targetSku = existing?.sku ?? skuValue;
          data.targetArrangement = existing ? { connect: { id: existing.id } } : { disconnect: true };
          data.metadataRow = inCsv ? { connect: { id: inCsv.id } } : { disconnect: true };
        } else {
          data.targetSku = null;
          data.targetArrangement = { disconnect: true };
        }
      }
      if (patch.assetKind && patch.assetKind !== item.detectedAssetKind) {
        const policy = ASSET_POLICIES[patch.assetKind];
        if (!policy.extensions.includes(fileExtension(item.originalFilename))) {
          throw new ShopError("VALIDATION_FAILED", `This file type cannot be a ${patch.assetKind}`);
        }
        if (Number(item.declaredBytes ?? 0) > policy.maxBytes) {
          throw new ShopError("VALIDATION_FAILED", `This file exceeds the ${patch.assetKind} size limit`);
        }
        data.detectedAssetKind = patch.assetKind;
        data.declaredMimeType = normaliseDeclaredMime(patch.assetKind, undefined, item.originalFilename);
        // A plan-time rejection for the old kind no longer applies: back to the upload queue.
        if (item.status === "FAILED" && !item.storageKey) data.status = "QUEUED";
        // Different kind may mean a different store: upload again into the right one.
        if (item.storageStore && item.storageStore !== policy.store) {
          data.storageKey = null; data.storageStore = null; data.status = "QUEUED";
        }
      }
      const kindNow = (data.detectedAssetKind as AssetKindValue | undefined) ?? item.detectedAssetKind;
      const skuNow = data.targetSku !== undefined ? data.targetSku : item.targetSku;
      if (!data.status) {
        if (item.status === "NEEDS_REVIEW" || item.status === "READY") {
          data.status = item.sha256 && skuNow && kindNow ? "READY" : item.sha256 ? "NEEDS_REVIEW" : kindNow ? "QUEUED" : "NEEDS_REVIEW";
        }
      }
      const cleared = ["AMBIGUOUS_REFERENCE", "AMBIGUOUS_FILE", "UNKNOWN_KIND"];
      if (patch.assetKind && patch.assetKind !== item.detectedAssetKind) cleared.push("EXTENSION_NOT_ALLOWED", "TOO_LARGE");
      const remaining = ((item.validationErrors as Issue[] | null) ?? []).filter((e) => !cleared.includes(e.code));
      data.validationErrors = json(remaining);
      data.validationWarnings = json(((item.validationWarnings as Issue[] | null) ?? []).filter((w) => w.code !== "UNMATCHED_SKU" || !skuNow));
      break;
    }
  }
  const updated = await db.importBatchItem.update({ where: { id: item.id }, data });
  await refreshBatchCounters(batchId);
  await audit({ type: "STAFF", staffId: s.staffId }, `import.item_${patch.action}`, { type: "ImportBatchItem", id: item.id }, {
    batchId, targetSku: updated.targetSku, kind: updated.detectedAssetKind,
  });
  return updated;
}

async function refreshBatchCounters(batchId: string) {
  const db = shopDb();
  const groups = await db.importBatchItem.groupBy({ by: ["status"], where: { importBatchId: batchId }, _count: { _all: true } });
  const count = (st: string) => groups.find((g) => g.status === st)?._count._all ?? 0;
  const total = groups.reduce((s, g) => s + g._count._all, 0);
  const ready = count("READY");
  const failed = count("FAILED");
  const needsReview = count("NEEDS_REVIEW");
  const pending = count("QUEUED") + count("UPLOADING") + count("UPLOADED") + count("VALIDATING");
  const skipped = count("SKIPPED");
  const batch = await db.importBatch.findUniqueOrThrow({ where: { id: batchId } });
  if (batch.status === "COMPLETED") return;
  let status = batch.status;
  if (batch.confirmedAt) {
    if (pending > 0) status = "UPLOADING";
    else if (failed > 0 || needsReview > 0) status = "REVIEW_REQUIRED";
    else if (ready + skipped === total) status = "READY";
  }
  await db.importBatch.update({
    where: { id: batchId },
    data: { uploadedItems: ready + needsReview, validItems: ready, failedItems: failed, status },
  });
}

/** Applies the reviewed plan: DRAFT arrangements + immutable AssetVersions. Per-record transactions. */
export async function applyImport(s: Staff, batchId: string) {
  const db = shopDb();
  const batch = await db.importBatch.findUnique({
    where: { id: batchId },
    include: { metadataRows: { orderBy: { rowNumber: "asc" } }, items: true },
  });
  if (!batch) throw new ShopError("NOT_FOUND", "Import batch not found");
  if (batch.status === "COMPLETED") return { createdArrangements: 0, attachedVersions: 0, skipped: 0 };
  const blocking = batch.items.filter((i) => !["READY", "SKIPPED"].includes(i.status) && !i.resultingAssetVersionId);
  if (blocking.length) {
    throw new ShopError("INVALID_STATE", `${blocking.length} file(s) still need upload, review or a skip decision`, {
      itemIds: blocking.map((i) => i.id).slice(0, 50),
    });
  }

  // 1. Create DRAFT arrangements for valid new rows (each in its own transaction).
  const skuToArrangement = new Map<string, string>();
  let createdArrangements = 0;
  const usedSkus = new Set(batch.items.filter((i) => i.status === "READY").map((i) => i.targetSku?.toLowerCase()).filter(Boolean));
  for (const row of batch.metadataRows) {
    const r = row.normalized as unknown as NormalizedRow & { action?: string };
    if (!r.sku) continue;
    const existing = await db.arrangement.findFirst({ where: { sku: { equals: r.sku, mode: "insensitive" } }, select: { id: true } });
    if (existing) {
      skuToArrangement.set(r.sku.toLowerCase(), existing.id);
      await db.importMetadataRow.update({ where: { id: row.id }, data: { resultingArrangementId: existing.id } });
      continue;
    }
    if (r.action !== "CREATE_DRAFT" || ((row.errors as Issue[] | null) ?? []).length) continue;
    const id = await createDraftFromRow(s, r);
    skuToArrangement.set(r.sku.toLowerCase(), id);
    await db.importMetadataRow.update({ where: { id: row.id }, data: { resultingArrangementId: id } });
    createdArrangements++;
  }

  // 2. Attach every READY file as a new immutable version (own transaction per file).
  let attachedVersions = 0;
  for (const item of batch.items) {
    if (item.status !== "READY" || item.resultingAssetVersionId) continue;
    const sku = item.targetSku?.toLowerCase();
    let arrangementId = sku ? skuToArrangement.get(sku) : undefined;
    if (!arrangementId && sku) {
      arrangementId = (await db.arrangement.findFirst({ where: { sku: { equals: sku, mode: "insensitive" } }, select: { id: true } }))?.id;
    }
    if (!arrangementId) {
      await db.importBatchItem.update({
        where: { id: item.id },
        data: { status: "NEEDS_REVIEW", validationWarnings: json([{ code: "UNMATCHED_SKU", message: "SKU not found when applying." }]) },
      });
      continue;
    }
    await attachItemAsVersion(s, item, arrangementId);
    attachedVersions++;
  }

  const stillOpen = await db.importBatchItem.count({ where: { importBatchId: batchId, status: { notIn: ["READY", "SKIPPED"] } } });
  await db.importBatch.update({
    where: { id: batchId },
    data: stillOpen ? { status: "REVIEW_REQUIRED" } : { status: "COMPLETED", completedAt: new Date() },
  });
  await audit({ type: "STAFF", staffId: s.staffId }, "import.applied", { type: "ImportBatch", id: batchId }, {
    createdArrangements, attachedVersions, usedSkus: usedSkus.size, stillOpen,
  });
  return { createdArrangements, attachedVersions, skipped: batch.items.filter((i) => i.status === "SKIPPED").length };
}

function slugify(v: string) {
  return v.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "item";
}

async function createDraftFromRow(s: Staff, r: NormalizedRow): Promise<string> {
  const db = shopDb();
  return db.$transaction(async (tx) => {
    // Arranger: match by name or slug, else create (royalty terms to be reviewed).
    const arrangerSlug = slugify(r.arranger!);
    let arranger = await tx.arranger.findFirst({
      where: { OR: [{ name: { equals: r.arranger!, mode: "insensitive" } }, { slug: arrangerSlug }] },
    });
    if (!arranger) {
      arranger = await tx.arranger.create({ data: { name: r.arranger!, slug: arrangerSlug, defaultRoyaltyRateBps: 0 } });
    }
    let work = await tx.work.findFirst({
      where: {
        title: { equals: r.workTitle!, mode: "insensitive" },
        originalArtist: r.originalArtist ? { equals: r.originalArtist, mode: "insensitive" } : null,
      },
    });
    if (!work) work = await tx.work.create({ data: { title: r.workTitle!, originalArtist: r.originalArtist } });

    const genreIds: string[] = [];
    for (const g of r.genres) {
      const slug = slugify(g);
      const genre = await tx.genre.upsert({ where: { slug }, create: { name: g, slug }, update: {} });
      genreIds.push(genre.id);
    }
    const profiles = r.compatibility.length
      ? await tx.systemProfile.findMany({ where: { code: { in: r.compatibility }, active: true } })
      : [];

    let slug = slugify(`${r.title} ${r.sku}`);
    if (await tx.arrangement.findUnique({ where: { slug }, select: { id: true } })) slug = `${slug}-${Date.now().toString(36)}`;

    const a = await tx.arrangement.create({
      data: {
        sku: r.sku!,
        slug,
        displayTitle: r.title!,
        workId: work.id,
        arrangerId: arranger.id,
        priceCents: r.priceCents!,
        currency: r.currency,
        status: "DRAFT",
        genres: { connect: genreIds.map((id) => ({ id })) },
        compatibilities: { create: profiles.map((p) => ({ systemProfileId: p.id })) },
        internalNotes: `Created by bulk import (CSV row ${r.rowNumber}).`,
      },
    });
    await audit({ type: "STAFF", staffId: s.staffId }, "arrangement.create", { type: "Arrangement", id: a.id }, {
      sku: a.sku, via: "bulk_import", rowNumber: r.rowNumber,
    }, tx);
    return a.id;
  });
}

async function attachItemAsVersion(s: Staff, item: ImportBatchItem, arrangementId: string) {
  const db = shopDb();
  await db.$transaction(async (tx) => {
    const kind = item.detectedAssetKind!;
    let asset = await tx.asset.findFirst({ where: { arrangementId, kind }, orderBy: { createdAt: "asc" } });
    if (!asset) asset = await tx.asset.create({ data: { arrangementId, kind } });
    await tx.$queryRaw`SELECT "id" FROM "Asset" WHERE "id" = ${asset.id}::uuid FOR UPDATE`;
    const last = await tx.assetVersion.aggregate({ where: { assetId: asset.id }, _max: { versionNumber: true } });
    const version = await tx.assetVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: (last._max.versionNumber ?? 0) + 1,
        originalFilename: item.originalFilename,
        storageProvider: storage().provider,
        storageStore: item.storageStore!,
        storageKey: item.storageKey!,
        declaredMimeType: item.declaredMimeType ?? "application/octet-stream",
        mimeType: ((item.technicalMetadata as { detectedMime?: string } | null)?.detectedMime) ?? null,
        declaredBytes: item.declaredBytes ?? BigInt(0),
        bytes: item.bytes,
        declaredSha256: item.declaredSha256,
        sha256: item.sha256,
        status: "VALID",
        validationWarnings: item.validationWarnings ?? undefined,
        technicalMetadata: item.technicalMetadata ?? undefined,
        uploadedByStaffId: s.staffId,
        uploadedAt: item.updatedAt,
        validatedAt: new Date(),
      },
    });
    // Never replace an active master automatically — a replacement waits for explicit activation.
    if (!asset.activeVersionId) {
      await tx.asset.update({ where: { id: asset.id }, data: { activeVersionId: version.id } });
      const flags: Prisma.ArrangementUpdateInput = {};
      if (kind === "SOURCE_MIDI" || kind === "SOURCE_DMI") flags.containsMidi = true;
      if (kind === "SOURCE_AUDIO") flags.containsAudio = true;
      if (kind === "SOURCE_VIDEO") flags.containsVideo = true;
      if (Object.keys(flags).length) await tx.arrangement.update({ where: { id: arrangementId }, data: flags });
    }
    await tx.importBatchItem.update({
      where: { id: item.id },
      data: { resultingAssetVersionId: version.id, targetArrangementId: arrangementId },
    });
    await audit({ type: "STAFF", staffId: s.staffId }, "asset.imported", { type: "AssetVersion", id: version.id }, {
      batchId: item.importBatchId, kind, activated: !asset.activeVersionId,
    }, tx);
  });
}

export async function getImportBatch(batchId: string) {
  const db = shopDb();
  const batch = await db.importBatch.findUnique({
    where: { id: batchId },
    include: {
      createdBy: { select: { email: true, displayName: true } },
      metadataRows: { orderBy: { rowNumber: "asc" } },
      items: { orderBy: [{ relativePath: "asc" }, { originalFilename: "asc" }, { id: "asc" }] },
    },
  });
  if (!batch) return null;
  return {
    ...batch,
    items: batch.items.map((i) => ({
      id: i.id,
      originalFilename: i.originalFilename,
      relativePath: i.relativePath,
      kind: i.detectedAssetKind,
      targetSku: i.targetSku,
      status: i.status,
      bytes: Number(i.bytes ?? i.declaredBytes ?? 0),
      hasChecksum: Boolean(i.declaredSha256 || i.sha256),
      attemptCount: i.attemptCount,
      errors: (i.validationErrors as Issue[] | null) ?? [],
      warnings: (i.validationWarnings as Issue[] | null) ?? [],
      applied: Boolean(i.resultingAssetVersionId),
      /** True once an upload target was issued for the current attempt (object may exist). */
      uploadStarted: Boolean(i.storageKey),
    })),
  };
}

export async function listImportBatches() {
  return shopDb().importBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { createdBy: { select: { email: true, displayName: true } } },
  });
}

/** Deletes a batch that was never confirmed (no uploads happened). Staging rows cascade. */
export async function deleteDraftImport(s: Staff, batchId: string) {
  const db = shopDb();
  const batch = await db.importBatch.findUnique({ where: { id: batchId } });
  if (!batch) throw new ShopError("NOT_FOUND", "Import batch not found");
  if (batch.confirmedAt) throw new ShopError("INVALID_STATE", "Confirmed batches are kept for the audit trail");
  await db.importBatch.delete({ where: { id: batchId } });
  await audit({ type: "STAFF", staffId: s.staffId }, "import.deleted_draft", { type: "ImportBatch", id: batchId });
}
