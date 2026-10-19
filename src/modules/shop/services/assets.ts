import "server-only";
import type { AssetKind, Prisma } from "@/generated/shop-prisma/client";
import {
  ASSET_POLICIES,
  fileExtension,
  normaliseDeclaredMime,
  type AssetKindValue,
} from "../domain/asset-policy";
import type { MidiMetadata } from "../domain/midi";
import { shopConfig } from "../config";
import { shopDb, type ShopTx } from "../db";
import { ShopError } from "../errors";
import { storage, type StoreName, type UploadTarget } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { signTicket } from "../storage/tickets";
import { audit } from "./audit";
import { validateStoredObject } from "./asset-validation";

/**
 * Master file vault + previews. Every upload is a new immutable AssetVersion with a fresh
 * random key; nothing is ever overwritten. Uploads go browser → storage directly through a
 * short-lived, single-path, PUT-only signed target.
 */

const MULTIPART_THRESHOLD = 100 * 1024 * 1024;

export type PresignInput = {
  staffId: string;
  owner: { arrangementId: string } | { bundleId: string };
  kind: AssetKindValue;
  filename: string;
  contentType?: string;
  bytes: number;
  sha256?: string | null;
  label?: string | null;
};

export function checkUploadPolicy(kind: AssetKindValue, filename: string, bytes: number, contentType?: string) {
  const policy = ASSET_POLICIES[kind];
  if (!policy) throw new ShopError("VALIDATION_FAILED", "Unknown asset kind");
  const ext = fileExtension(filename);
  if (!policy.extensions.includes(ext)) {
    throw new ShopError("VALIDATION_FAILED", `.${ext || "?"} files are not allowed for ${kind} (allowed: ${policy.extensions.join(", ")})`);
  }
  if (!Number.isSafeInteger(bytes) || bytes <= 0) throw new ShopError("VALIDATION_FAILED", "File size is required");
  if (bytes > policy.maxBytes) throw new ShopError("VALIDATION_FAILED", `File exceeds the ${kind} size limit`);
  const mime = normaliseDeclaredMime(kind, contentType, filename);
  return { policy, ext, mime };
}

export async function issueUploadTarget(args: {
  store: StoreName;
  key: string;
  contentType: string;
  bytes: number;
  staffId: string;
  purpose: string;
}): Promise<{ target: UploadTarget; expiresAt: Date }> {
  const ttl = shopConfig.uploadUrlTtlSeconds;
  const exp = Date.now() + ttl * 1000;
  const ticket = signTicket(
    {
      v: 1, store: args.store, key: args.key, contentType: args.contentType,
      maxBytes: args.bytes, exp, staffId: args.staffId, purpose: args.purpose,
    },
    shopConfig.uploadTicketSecret,
  );
  const target = await storage().createUploadTarget({
    store: args.store,
    key: args.key,
    contentType: args.contentType,
    maxBytes: args.bytes,
    expiresInSeconds: ttl,
    ticket,
    multipart: args.bytes > MULTIPART_THRESHOLD,
  });
  return { target, expiresAt: new Date(exp) };
}

async function findOrCreateAsset(tx: ShopTx, owner: PresignInput["owner"], kind: AssetKind, label?: string | null) {
  const where = "arrangementId" in owner
    ? { arrangementId: owner.arrangementId, bundleId: null, kind }
    : { bundleId: owner.bundleId, arrangementId: null, kind };
  const existing = await tx.asset.findFirst({ where, orderBy: { createdAt: "asc" } });
  if (existing) return existing;
  return tx.asset.create({ data: { ...where, label: label ?? null } });
}

/** Admin single-file upload (Arrangement / Bundle "Files" tab). */
export async function presignAssetUpload(input: PresignInput) {
  const { policy, ext, mime } = checkUploadPolicy(input.kind, input.filename, input.bytes, input.contentType);
  const db = shopDb();

  if ("arrangementId" in input.owner) {
    if (!(await db.arrangement.findUnique({ where: { id: input.owner.arrangementId }, select: { id: true } }))) {
      throw new ShopError("NOT_FOUND", "Arrangement not found");
    }
  } else {
    if (input.kind !== "COVER_IMAGE") throw new ShopError("VALIDATION_FAILED", "Bundles only take cover images");
    if (!(await db.bundle.findUnique({ where: { id: input.owner.bundleId }, select: { id: true } }))) {
      throw new ShopError("NOT_FOUND", "Bundle not found");
    }
  }

  const key = generateObjectKey(policy.store, input.kind.toLowerCase().replace("_", "-"), ext);
  const version = await db.$transaction(async (tx) => {
    const asset = await findOrCreateAsset(tx, input.owner, input.kind, input.label);
    await tx.$queryRaw`SELECT "id" FROM "Asset" WHERE "id" = ${asset.id}::uuid FOR UPDATE`;
    const last = await tx.assetVersion.aggregate({ where: { assetId: asset.id }, _max: { versionNumber: true } });
    return tx.assetVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: (last._max.versionNumber ?? 0) + 1,
        originalFilename: input.filename.slice(0, 255),
        storageProvider: storage().provider,
        storageStore: policy.store,
        storageKey: key,
        declaredMimeType: mime,
        declaredBytes: BigInt(input.bytes),
        declaredSha256: input.sha256?.toLowerCase() ?? null,
        status: "UPLOADING",
        uploadedByStaffId: input.staffId,
        uploadUrlExpiresAt: new Date(Date.now() + shopConfig.uploadUrlTtlSeconds * 1000),
      },
    });
  });

  const { target, expiresAt } = await issueUploadTarget({
    store: policy.store, key, contentType: mime, bytes: input.bytes, staffId: input.staffId,
    purpose: `asset-version:${version.id}`,
  });
  await audit({ type: "STAFF", staffId: input.staffId }, "asset.upload_presigned", { type: "AssetVersion", id: version.id }, {
    kind: input.kind, bytes: input.bytes, store: policy.store,
  });
  return { assetVersionId: version.id, versionNumber: version.versionNumber, target, expiresAt: expiresAt.toISOString() };
}

/** Verifies the uploaded object and marks the version VALID / INVALID. Re-runnable. */
export async function finalizeAssetVersion(input: { staffId: string; assetVersionId: string }) {
  const db = shopDb();
  const version = await db.assetVersion.findUnique({ where: { id: input.assetVersionId }, include: { asset: true } });
  if (!version) throw new ShopError("NOT_FOUND", "Asset version not found");
  if (version.status === "VALID") return version;
  if (version.status === "ABANDONED") throw new ShopError("INVALID_STATE", "Upload was abandoned; start a new upload");

  await db.assetVersion.update({ where: { id: version.id }, data: { status: "VALIDATING" } });
  const result = await validateStoredObject({
    ref: { store: version.storageStore, key: version.storageKey },
    kind: version.asset.kind,
    declaredBytes: Number(version.declaredBytes),
    declaredSha256: version.declaredSha256,
  });

  const updated = await db.$transaction(async (tx) => {
    const v = await tx.assetVersion.update({
      where: { id: version.id },
      data: {
        status: result.ok ? "VALID" : result.errors.some((e) => e.code === "NOT_UPLOADED") ? "UPLOADING" : "INVALID",
        bytes: result.bytes != null ? BigInt(result.bytes) : null,
        sha256: result.sha256,
        mimeType: result.detectedMime,
        validationErrors: result.errors as unknown as Prisma.InputJsonValue,
        validationWarnings: result.warnings as unknown as Prisma.InputJsonValue,
        technicalMetadata: (result.technicalMetadata ?? undefined) as Prisma.InputJsonValue | undefined,
        uploadedAt: result.bytes != null ? version.uploadedAt ?? new Date() : null,
        validatedAt: new Date(),
      },
    });
    // First valid version of a slot becomes active automatically; replacements need an
    // explicit activation by staff.
    if (result.ok && !version.asset.activeVersionId) {
      await activateWithinTx(tx, v.id, input.staffId);
    }
    return v;
  });

  await audit({ type: "STAFF", staffId: input.staffId }, "asset.finalized", { type: "AssetVersion", id: version.id }, {
    status: updated.status, errorCodes: result.errors.map((e) => e.code), warningCodes: result.warnings.map((w) => w.code),
  });
  return updated;
}

async function activateWithinTx(tx: ShopTx, assetVersionId: string, staffId: string) {
  const v = await tx.assetVersion.findUniqueOrThrow({ where: { id: assetVersionId }, include: { asset: true } });
  if (v.status !== "VALID") throw new ShopError("INVALID_STATE", "Only VALID versions can be activated");
  const previous = v.asset.activeVersionId;
  if (previous === v.id) return v;
  await tx.asset.update({ where: { id: v.assetId }, data: { activeVersionId: v.id } });
  if (previous) await tx.assetVersion.update({ where: { id: previous }, data: { supersededAt: new Date() } });
  await tx.assetVersion.update({ where: { id: v.id }, data: { supersededAt: null } });
  if (v.asset.arrangementId) await applyCuratedDefaults(tx, v.asset.arrangementId, v.asset.kind, v.technicalMetadata);
  await audit({ type: "STAFF", staffId }, "asset.activated", { type: "AssetVersion", id: v.id }, {
    assetId: v.assetId, previousVersionId: previous,
  }, tx);
  return v;
}

export async function activateAssetVersion(input: { staffId: string; assetVersionId: string }) {
  return shopDb().$transaction((tx) => activateWithinTx(tx, input.assetVersionId, input.staffId));
}

/** Content flags + empty curated fields are filled from the active master; never overwritten. */
async function applyCuratedDefaults(tx: ShopTx, arrangementId: string, kind: AssetKind, technical: unknown) {
  const data: Prisma.ArrangementUpdateInput = {};
  if (kind === "SOURCE_MIDI" || kind === "SOURCE_DMI") data.containsMidi = true;
  if (kind === "SOURCE_AUDIO") data.containsAudio = true;
  if (kind === "SOURCE_VIDEO") data.containsVideo = true;
  const midi = (technical as { midi?: MidiMetadata } | null)?.midi;
  if (midi) {
    const a = await tx.arrangement.findUniqueOrThrow({
      where: { id: arrangementId },
      select: { durationSeconds: true, tempoBpm: true, musicalKey: true, timeSignature: true },
    });
    if (a.durationSeconds == null && midi.durationSeconds) data.durationSeconds = midi.durationSeconds;
    if (a.tempoBpm == null && midi.tempos[0]) data.tempoBpm = Math.round(midi.tempos[0].bpm);
    if (a.musicalKey == null && midi.keySignatures[0]) data.musicalKey = midi.keySignatures[0].key;
    if (a.timeSignature == null && midi.timeSignatures[0]) {
      data.timeSignature = `${midi.timeSignatures[0].numerator}/${midi.timeSignatures[0].denominator}`;
    }
  }
  if (Object.keys(data).length) await tx.arrangement.update({ where: { id: arrangementId }, data });
}

/** Short-lived, audited admin re-download of a master. */
export async function adminDownloadUrl(input: { staffId: string; assetVersionId: string }) {
  const v = await shopDb().assetVersion.findUnique({ where: { id: input.assetVersionId } });
  if (!v) throw new ShopError("NOT_FOUND", "Asset version not found");
  if (v.status !== "VALID" && v.status !== "INVALID") throw new ShopError("INVALID_STATE", "Nothing to download yet");
  const { url, expiresAt } = await storage().createDownloadUrl(
    { store: v.storageStore, key: v.storageKey },
    { expiresInSeconds: shopConfig.adminDownloadTtlSeconds, filename: v.originalFilename },
  );
  await audit({ type: "STAFF", staffId: input.staffId }, "asset.master_download", { type: "AssetVersion", id: v.id }, {
    store: v.storageStore, ttlSeconds: shopConfig.adminDownloadTtlSeconds,
  });
  return { url, expiresAt };
}

/** Marks stale UPLOADING versions (expired upload window, nothing stored) as ABANDONED. */
export async function abandonExpiredUploads() {
  return shopDb().assetVersion.updateMany({
    where: { status: "UPLOADING", uploadUrlExpiresAt: { lt: new Date(Date.now() - 3600 * 1000) } },
    data: { status: "ABANDONED" },
  });
}

/** Admin "Files" tab read model. Storage keys stay server-side. */
export async function listArrangementAssets(arrangementId: string) {
  const assets = await shopDb().asset.findMany({
    where: { arrangementId },
    orderBy: [{ kind: "asc" }, { createdAt: "asc" }],
    include: { versions: { orderBy: { versionNumber: "desc" }, include: { uploadedBy: { select: { email: true, displayName: true } } } } },
  });
  return assets.map((a) => ({
    id: a.id,
    kind: a.kind,
    label: a.label,
    activeVersionId: a.activeVersionId,
    versions: a.versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      originalFilename: v.originalFilename,
      status: v.status,
      store: v.storageStore,
      bytes: v.bytes != null ? Number(v.bytes) : Number(v.declaredBytes),
      mimeType: v.mimeType ?? v.declaredMimeType,
      sha256: v.sha256,
      validationErrors: (v.validationErrors as { code: string; message: string }[] | null) ?? [],
      validationWarnings: (v.validationWarnings as { code: string; message: string }[] | null) ?? [],
      technicalMetadata: v.technicalMetadata,
      uploadedBy: v.uploadedBy?.displayName ?? v.uploadedBy?.email ?? null,
      createdAt: v.createdAt,
      validatedAt: v.validatedAt,
      supersededAt: v.supersededAt,
      isActive: a.activeVersionId === v.id,
    })),
  }));
}
