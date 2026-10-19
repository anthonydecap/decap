import "server-only";
import { createHash } from "node:crypto";
import type { z } from "zod";
import type { Customer, Prisma, SoftwareDownloadSource } from "@/generated/shop-prisma/client";
import { fileExtension } from "../domain/asset-policy";
import {
  customerSoftwareStatus, INSTALLER_EXTENSIONS, licenseState, maskRegistrationCode, MAX_INSTALLER_BYTES, OPEN_ACTIVATION_STATUSES, sniffInstaller,
} from "../domain/software-status";
import { shopConfig } from "../config";
import { shopDb } from "../db";
import { ShopError, notFound } from "../errors";
import type { releasePatchSchema, releasePresignSchema, softwareProductSchema } from "../schemas";
import { storage } from "../storage";
import { generateObjectKey } from "../storage/keys";
import { audit } from "./audit";
import { issueUploadTarget } from "./assets";
import { recordActivity } from "./crm";
import { previewMediaUrl } from "./media";
import { detectAttachmentType } from "./support-files";

/**
 * Software catalog, releases and downloads.
 *
 * Installers live in the private `software/` namespace under random keys. Customers never
 * get a permanent URL: every download goes through an authenticated route that records a
 * SoftwareDownload and redirects to a short-lived signed URL. Releases are immutable; a new
 * build is a new row. Uploading creates a DRAFT; publishing and "mark current" are separate,
 * explicit staff actions. Nothing uploaded is ever executed here.
 */

type Staff = { staffId: string };
const actor = (s: Staff) => ({ type: "STAFF" as const, staffId: s.staffId });

export const DOWNLOAD_URL_TTL_SECONDS = 300;

// ─── Public catalog ──────────────────────────────────────────────────────────

const VISIBLE_STATUSES = ["ACTIVE", "DISCONTINUED"] as const;

const publicReleaseSelect = {
  id: true, version: true, platform: true, architecture: true, releaseChannel: true, releaseNotes: true,
  minimumOsVersion: true, fileSizeBytes: true, sha256: true, publishedAt: true, isCurrent: true,
} satisfies Prisma.SoftwareReleaseSelect;

type ReleaseRow = Prisma.SoftwareReleaseGetPayload<{ select: typeof publicReleaseSelect }>;
/** JSON-safe (sizes as numbers). */
export type PublicRelease = Omit<ReleaseRow, "fileSizeBytes"> & { fileSizeBytes: number | null };

/** Current, published, downloadable releases for one product (one per platform/arch/channel). */
async function currentReleases(productId: string, channel: "STABLE" | "BETA" | "LEGACY" = "STABLE"): Promise<PublicRelease[]> {
  const rows = await shopDb().softwareRelease.findMany({
    where: { softwareProductId: productId, status: "PUBLISHED", isCurrent: true, isDownloadable: true, releaseChannel: channel },
    select: publicReleaseSelect,
    orderBy: [{ platform: "asc" }, { architecture: "asc" }],
  });
  return rows.map((r) => ({ ...r, fileSizeBytes: r.fileSizeBytes != null ? Number(r.fileSizeBytes) : null }));
}

export async function productImages(p: { coverImageKey: string | null; iconKey: string | null }) {
  const [coverUrl, iconUrl] = await Promise.all([
    p.coverImageKey ? previewMediaUrl({ storageStore: "PREVIEWS", storageKey: p.coverImageKey }) : null,
    p.iconKey ? previewMediaUrl({ storageStore: "PREVIEWS", storageKey: p.iconKey }) : null,
  ]);
  return { coverUrl, iconUrl };
}

export async function listPublicSoftware() {
  const products = await shopDb().softwareProduct.findMany({
    where: { status: { in: [...VISIBLE_STATUSES] } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return Promise.all(products.map(async (p) => ({
    id: p.id, slug: p.slug, name: p.name, shortDescription: p.shortDescription, status: p.status,
    currentVersion: p.currentVersion, trialAvailable: p.trialAvailable, systemRequirements: p.systemRequirements,
    licensePriceCents: p.defaultLicensePriceCents, currency: p.currency,
    ...(await productImages(p)),
  })));
}

export async function getPublicSoftware(slug: string, opts: { includeHidden?: boolean } = {}) {
  const p = await shopDb().softwareProduct.findFirst({
    where: { slug, ...(opts.includeHidden ? {} : { status: { in: [...VISIBLE_STATUSES] } }) },
  });
  if (!p) return null;
  const [releases, betaReleases] = await Promise.all([currentReleases(p.id), currentReleases(p.id, "BETA")]);
  return {
    id: p.id, slug: p.slug, name: p.name, shortDescription: p.shortDescription, description: p.description,
    systemRequirements: p.systemRequirements, activationInstructions: p.activationInstructions, status: p.status,
    currentVersion: p.currentVersion, trialAvailable: p.trialAvailable, licenseRequiredForFullUse: p.licenseRequiredForFullUse,
    licensePriceCents: p.status === "ACTIVE" ? p.defaultLicensePriceCents : null, currency: p.currency,
    releases, betaReleases,
    ...(await productImages(p)),
  };
}

// ─── Downloads (authenticated) ───────────────────────────────────────────────

/**
 * Records the download and returns a short-lived signed URL. Customers get the current
 * STABLE build by default; a specific published release may be requested by id.
 */
export async function startDownload(customer: Customer, slug: string, opts: { releaseId?: string | null; source?: SoftwareDownloadSource } = {}) {
  const db = shopDb();
  const product = await db.softwareProduct.findFirst({ where: { slug, status: { in: [...VISIBLE_STATUSES] } } });
  if (!product) throw notFound("Software");
  const release = opts.releaseId
    ? await db.softwareRelease.findFirst({
        where: { id: opts.releaseId, softwareProductId: product.id, status: "PUBLISHED", isDownloadable: true },
      })
    : await db.softwareRelease.findFirst({
        where: { softwareProductId: product.id, status: "PUBLISHED", isDownloadable: true, isCurrent: true, releaseChannel: "STABLE" },
        orderBy: [{ platform: "asc" }, { architecture: "asc" }],
      });
  if (!release) throw new ShopError("UNAVAILABLE", "No download is available for this software yet");

  const first = !(await db.softwareDownload.findFirst({ where: { customerId: customer.id, softwareProductId: product.id }, select: { id: true } }));
  await db.$transaction(async (tx) => {
    await tx.softwareDownload.create({
      data: { customerId: customer.id, softwareProductId: product.id, softwareReleaseId: release.id, source: opts.source ?? "OTHER" },
    });
    await recordActivity({
      tx, customerId: customer.id,
      type: first ? "software.downloaded" : "software.release_downloaded",
      summary: `Downloaded ${product.name} ${release.version}`,
      metadata: { softwareProductId: product.id, releaseId: release.id, version: release.version },
    });
  });
  const ext = fileExtension(release.originalFilename) || "exe";
  const filename = `${product.slug}-${release.version}-${release.platform.toLowerCase()}-${release.architecture.toLowerCase()}.${ext}`;
  const { url } = await storage().createDownloadUrl(
    { store: "SOFTWARE", key: release.storageKey },
    { expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS, filename },
  );
  return { url, release, product };
}

// ─── Customer software hub ───────────────────────────────────────────────────

const licenseSelect = {
  id: true, number: true, status: true, maxActivations: true, licenseSource: true, purchasedAt: true, activatedAt: true,
  suspendedAt: true, revokedAt: true, orderId: true, softwareProductId: true,
  order: { select: { id: true, number: true } },
  installations: {
    orderBy: { createdAt: "desc" as const },
    select: { id: true, status: true, registrationCode: true, label: true, activatedAt: true, retiredAt: true, createdAt: true, activationKeyEncrypted: true },
  },
  activationRequests: {
    orderBy: { submittedAt: "desc" as const },
    select: {
      id: true, number: true, status: true, registrationCode: true, submittedAt: true, infoRequest: true, rejectionReason: true,
      conflictInstallationId: true, customerMessage: true, reviewedAt: true,
    },
  },
} satisfies Prisma.SoftwareLicenseSelect;

type LicenseRow = Prisma.SoftwareLicenseGetPayload<{ select: typeof licenseSelect }>;

/** Customer-safe shape: masked codes, no key material, no internal notes. */
function toCustomerLicense(l: LicenseRow) {
  const active = l.installations.filter((i) => i.status === "ACTIVE").length;
  const latest = l.activationRequests[0] ?? null;
  const stateInput = {
    id: l.id, status: l.status, maxActivations: l.maxActivations, activeInstallations: active,
    latestRequest: latest ? { status: latest.status, conflict: Boolean(latest.conflictInstallationId) } : null,
  };
  return {
    id: l.id,
    number: l.number,
    status: l.status,
    state: licenseState(stateInput),
    stateInput,
    maxActivations: l.maxActivations,
    activeInstallations: active,
    purchasedAt: l.purchasedAt,
    activatedAt: l.activatedAt,
    source: l.licenseSource,
    order: l.order ? { id: l.order.id, number: l.order.number } : null,
    canSubmitActivation:
      (l.status === "PENDING_ACTIVATION" || l.status === "ACTIVE") &&
      !l.activationRequests.some((r) => (OPEN_ACTIVATION_STATUSES as readonly string[]).includes(r.status)),
    hasFreeActivation: active < l.maxActivations,
    installations: l.installations.map((i) => ({
      // Customers see a masked code; the full code stays with DMI.
      id: i.id, status: i.status, registrationCode: maskRegistrationCode(i.registrationCode), label: i.label, activatedAt: i.activatedAt,
      retiredAt: i.retiredAt, hasActivationKey: Boolean(i.activationKeyEncrypted),
    })),
    requests: l.activationRequests.map((r) => ({
      id: r.id, number: r.number, status: r.status, registrationCode: maskRegistrationCode(r.registrationCode), submittedAt: r.submittedAt,
      infoRequest: r.status === "WAITING_FOR_CUSTOMER" ? r.infoRequest : null,
      rejectionReason: r.status === "REJECTED" ? r.rejectionReason : null,
      underReview: Boolean(r.conflictInstallationId) && (OPEN_ACTIVATION_STATUSES as readonly string[]).includes(r.status),
      reviewedAt: r.reviewedAt,
    })),
  };
}

export type CustomerLicense = ReturnType<typeof toCustomerLicense>;

/** Everything the customer has touched: downloaded products and/or licensed products. */
export async function customerSoftwareOverview(customerId: string) {
  const db = shopDb();
  const [downloads, licenses] = await Promise.all([
    db.softwareDownload.groupBy({ by: ["softwareProductId"], where: { customerId }, _max: { downloadedAt: true }, _count: { _all: true } }),
    db.softwareLicense.findMany({ where: { customerId }, select: licenseSelect, orderBy: { purchasedAt: "desc" } }),
  ]);
  const productIds = [...new Set([...downloads.map((d) => d.softwareProductId), ...licenses.map((l) => l.softwareProductId)])];
  if (!productIds.length) return [];
  const products = await db.softwareProduct.findMany({ where: { id: { in: productIds } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const lastDownloaded = await db.softwareDownload.findMany({
    where: { customerId, softwareProductId: { in: productIds } },
    orderBy: { downloadedAt: "desc" },
    distinct: ["softwareProductId"],
    select: { softwareProductId: true, downloadedAt: true, release: { select: { version: true } } },
  });
  return Promise.all(products.map(async (p) => {
    const mine = licenses.filter((l) => l.softwareProductId === p.id).map(toCustomerLicense);
    const dl = downloads.find((d) => d.softwareProductId === p.id);
    const last = lastDownloaded.find((d) => d.softwareProductId === p.id);
    return {
      product: {
        id: p.id, slug: p.slug, name: p.name, currentVersion: p.currentVersion, trialAvailable: p.trialAvailable,
        status: p.status, licensePriceCents: p.status === "ACTIVE" ? p.defaultLicensePriceCents : null, currency: p.currency,
        ...(await productImages(p)),
      },
      status: customerSoftwareStatus({ trialAvailable: p.trialAvailable, downloaded: Boolean(dl), licenses: mine.map((l) => l.stateInput) }),
      downloaded: Boolean(dl),
      downloadCount: dl?._count._all ?? 0,
      lastDownloadedAt: last?.downloadedAt ?? null,
      lastDownloadedVersion: last?.release.version ?? null,
      licenses: mine,
    };
  }));
}

export async function customerSoftwareDetail(customerId: string, slug: string) {
  // A license holder keeps access to their license and keys even if the product is later
  // archived or withdrawn; everyone else only sees visible products.
  const product = await getPublicSoftware(slug, { includeHidden: true });
  if (!product) return null;
  const db = shopDb();
  if (!(VISIBLE_STATUSES as readonly string[]).includes(product.status)) {
    const has = await db.softwareLicense.count({ where: { customerId, softwareProductId: product.id } });
    if (!has) return null;
  }
  const [licenses, downloads] = await Promise.all([
    db.softwareLicense.findMany({ where: { customerId, softwareProductId: product.id }, select: licenseSelect, orderBy: { purchasedAt: "desc" } }),
    db.softwareDownload.findMany({
      where: { customerId, softwareProductId: product.id },
      orderBy: { downloadedAt: "desc" },
      take: 10,
      select: { id: true, downloadedAt: true, release: { select: { version: true, platform: true, architecture: true } } },
    }),
  ]);
  const mine = licenses.map(toCustomerLicense);
  return {
    product,
    licenses: mine,
    downloads,
    status: customerSoftwareStatus({ trialAvailable: product.trialAvailable, downloaded: downloads.length > 0, licenses: mine.map((l) => l.stateInput) }),
  };
}

// ─── Admin: products ─────────────────────────────────────────────────────────

export async function saveSoftwareProduct(s: Staff, id: string | null, input: z.infer<typeof softwareProductSchema>) {
  try {
    const p = id
      ? await shopDb().softwareProduct.update({ where: { id }, data: input })
      : await shopDb().softwareProduct.create({ data: { ...input, status: "DRAFT" } });
    await audit(actor(s), id ? "software_product.update" : "software_product.create", { type: "SoftwareProduct", id: p.id }, {
      slug: p.slug, priceCents: p.defaultLicensePriceCents,
    });
    return p;
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") throw new ShopError("CONFLICT", "A product with that slug already exists");
    if ((e as { code?: string }).code === "P2025") throw notFound("Software product");
    throw e;
  }
}

export async function setSoftwareProductStatus(s: Staff, id: string, status: "DRAFT" | "ACTIVE" | "DISCONTINUED" | "ARCHIVED") {
  const db = shopDb();
  const p = await db.softwareProduct.findUnique({ where: { id } });
  if (!p) throw notFound("Software product");
  if (status === "ACTIVE") {
    const current = await db.softwareRelease.count({ where: { softwareProductId: id, status: "PUBLISHED", isCurrent: true, releaseChannel: "STABLE" } });
    if (!current) throw new ShopError("PUBLISH_BLOCKED", "Publish a release and mark it current before making the product active");
  }
  const updated = await db.softwareProduct.update({
    where: { id },
    data: { status, ...(status === "ACTIVE" && !p.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit(actor(s), `software_product.${status.toLowerCase()}`, { type: "SoftwareProduct", id }, { from: p.status });
  return updated;
}

/** Cover / icon image: small, server-side upload into the PREVIEWS namespace. */
export async function uploadProductImage(s: Staff, productId: string, kind: "cover" | "icon", file: File) {
  const p = await shopDb().softwareProduct.findUnique({ where: { id: productId } });
  if (!p) throw notFound("Software product");
  if (file.size <= 0 || file.size > 4 * 1024 * 1024) throw new ShopError("VALIDATION_FAILED", "Images must be under 4 MB");
  const body = new Uint8Array(await file.arrayBuffer());
  const type = detectAttachmentType(body, file.name);
  if (!type || !type.mime.startsWith("image/")) throw new ShopError("VALIDATION_FAILED", "Use a JPEG, PNG or WebP image");
  const key = generateObjectKey("PREVIEWS", `software-${kind}`, type.ext);
  await storage().write({ store: "PREVIEWS", key }, body, type.mime);
  await shopDb().softwareProduct.update({ where: { id: productId }, data: kind === "cover" ? { coverImageKey: key } : { iconKey: key } });
  await audit(actor(s), "software_product.image", { type: "SoftwareProduct", id: productId }, { kind });
}

export async function listSoftwareProductsAdmin() {
  const db = shopDb();
  const products = await db.softwareProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { releases: true, downloads: true, licenses: true } } },
  });
  const pending = await db.softwareActivationRequest.groupBy({
    by: ["softwareProductId"],
    where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } },
    _count: { _all: true },
  });
  return products.map((p) => ({ ...p, pendingActivations: pending.find((x) => x.softwareProductId === p.id)?._count._all ?? 0 }));
}

export async function getSoftwareProductAdmin(id: string) {
  const db = shopDb();
  const product = await db.softwareProduct.findUnique({ where: { id } });
  if (!product) return null;
  const [releases, licenseCounts, downloadCount] = await Promise.all([
    db.softwareRelease.findMany({
      where: { softwareProductId: id },
      orderBy: [{ createdAt: "desc" }],
      include: { createdBy: { select: { displayName: true, email: true } }, _count: { select: { downloads: true } } },
    }),
    db.softwareLicense.groupBy({ by: ["status"], where: { softwareProductId: id }, _count: { _all: true } }),
    db.softwareDownload.count({ where: { softwareProductId: id } }),
  ]);
  return {
    product,
    ...(await productImages(product)),
    releases: releases.map((r) => ({
      ...r,
      declaredBytes: Number(r.declaredBytes),
      fileSizeBytes: r.fileSizeBytes != null ? Number(r.fileSizeBytes) : null,
      downloadCount: r._count.downloads,
    })),
    licenseCounts: Object.fromEntries(licenseCounts.map((l) => [l.status, l._count._all])),
    downloadCount,
  };
}

// ─── Admin: releases ─────────────────────────────────────────────────────────

/** Creates an UPLOADING release and a short-lived, single-path upload target. */
export async function presignRelease(s: Staff, productId: string, input: z.infer<typeof releasePresignSchema>) {
  const db = shopDb();
  if (!(await db.softwareProduct.findUnique({ where: { id: productId }, select: { id: true } }))) throw notFound("Software product");
  const ext = fileExtension(input.filename);
  if (!INSTALLER_EXTENSIONS[ext]) throw new ShopError("VALIDATION_FAILED", `.${ext || "?"} installers are not accepted (use .exe, .msi, .zip or .pkg)`);
  if (input.bytes > MAX_INSTALLER_BYTES) throw new ShopError("VALIDATION_FAILED", "Installers are limited to 2 GB");
  const key = generateObjectKey("SOFTWARE", "installer", ext);
  let release;
  try {
    release = await db.softwareRelease.create({
      data: {
        softwareProductId: productId,
        version: input.version,
        platform: input.platform,
        architecture: input.architecture,
        releaseChannel: input.releaseChannel,
        releaseNotes: input.releaseNotes,
        minimumOsVersion: input.minimumOsVersion,
        storageProvider: storage().provider,
        storageKey: key,
        originalFilename: input.filename.slice(0, 255),
        declaredBytes: BigInt(input.bytes),
        declaredSha256: input.sha256?.toLowerCase() ?? null,
        status: "UPLOADING",
        createdByStaffId: s.staffId,
      },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      throw new ShopError("CONFLICT", "That version already exists for this platform, architecture and channel. Releases are immutable: use a new version number.");
    }
    throw e;
  }
  const { target, expiresAt } = await issueUploadTarget({
    store: "SOFTWARE", key, contentType: "application/octet-stream", bytes: input.bytes, staffId: s.staffId, purpose: `software-release:${release.id}`,
  });
  await audit(actor(s), "software_release.upload_started", { type: "SoftwareRelease", id: release.id }, {
    version: release.version, platform: release.platform, bytes: input.bytes,
  });
  return { releaseId: release.id, target, expiresAt: expiresAt.toISOString() };
}

async function sha256OfObject(key: string, maxBytes: number) {
  const hash = createHash("sha256");
  const reader = (await storage().openRead({ store: "SOFTWARE", key })).getReader();
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) { await reader.cancel().catch(() => {}); throw new Error("too large"); }
    hash.update(value);
  }
  return { sha256: hash.digest("hex"), total };
}

/** Verifies existence, exact size, installer signature and SHA-256. Never executes anything. */
export async function finalizeRelease(s: Staff, releaseId: string, declaredSha256?: string | null) {
  const db = shopDb();
  const r = await db.softwareRelease.findUnique({ where: { id: releaseId } });
  if (!r) throw notFound("Release");
  if (r.status !== "UPLOADING") return r;
  const errors: { code: string; message: string }[] = [];
  const head = await storage().head({ store: "SOFTWARE", key: r.storageKey });
  if (!head) throw new ShopError("INVALID_STATE", "The installer has not been uploaded yet");
  if (head.bytes !== Number(r.declaredBytes)) errors.push({ code: "SIZE_MISMATCH", message: `Uploaded ${head.bytes} bytes, expected ${r.declaredBytes}` });
  const first = await storage().readHead({ store: "SOFTWARE", key: r.storageKey }, 64);
  const kind = sniffInstaller(first);
  const ext = fileExtension(r.originalFilename);
  if (!kind || !INSTALLER_EXTENSIONS[ext]?.includes(kind.kind)) {
    errors.push({ code: "SIGNATURE_MISMATCH", message: `The file is not a valid .${ext} installer` });
  }
  const declared = (declaredSha256 ?? r.declaredSha256)?.toLowerCase() ?? null;
  let sha256: string | null = null;
  if (!errors.length) {
    if (head.bytes <= shopConfig.serverHashMaxBytes) {
      sha256 = (await sha256OfObject(r.storageKey, head.bytes)).sha256;
      if (declared && declared !== sha256) errors.push({ code: "CHECKSUM_MISMATCH", message: "SHA-256 differs from the checksum computed in the browser" });
    } else if (declared) {
      sha256 = declared;
    } else {
      errors.push({ code: "CHECKSUM_MISSING", message: "Large installers need a browser-computed SHA-256" });
    }
  }
  const updated = await db.softwareRelease.update({
    where: { id: r.id },
    data: errors.length
      ? { validationErrors: errors as unknown as Prisma.InputJsonValue }
      : { status: "DRAFT", fileSizeBytes: BigInt(head.bytes), sha256, uploadedAt: new Date(), validationErrors: [] as unknown as Prisma.InputJsonValue },
  });
  await audit(actor(s), errors.length ? "software_release.upload_rejected" : "software_release.uploaded", { type: "SoftwareRelease", id: r.id }, {
    errors: errors.map((e) => e.code), sha256,
  });
  return updated;
}

async function recomputeCurrentVersion(tx: Prisma.TransactionClient, productId: string) {
  const current = await tx.softwareRelease.findFirst({
    where: { softwareProductId: productId, status: "PUBLISHED", isCurrent: true, releaseChannel: "STABLE" },
    orderBy: { publishedAt: "desc" },
  });
  await tx.softwareProduct.update({ where: { id: productId }, data: { currentVersion: current?.version ?? null } });
}

export async function releaseAction(s: Staff, releaseId: string, action: "publish" | "mark_current" | "archive") {
  const db = shopDb();
  return db.$transaction(async (tx) => {
    const r = await tx.softwareRelease.findUnique({ where: { id: releaseId } });
    if (!r) throw notFound("Release");
    let updated;
    if (action === "publish") {
      if (r.status !== "DRAFT") throw new ShopError("INVALID_STATE", r.status === "UPLOADING" ? "Finish and verify the upload first" : `A ${r.status.toLowerCase()} release cannot be published`);
      updated = await tx.softwareRelease.update({ where: { id: r.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
    } else if (action === "mark_current") {
      // Draft, uploading or archived releases can never become current.
      if (r.status !== "PUBLISHED") throw new ShopError("INVALID_STATE", "Only a published release can be marked current");
      await tx.softwareRelease.updateMany({
        where: { softwareProductId: r.softwareProductId, platform: r.platform, architecture: r.architecture, releaseChannel: r.releaseChannel, isCurrent: true },
        data: { isCurrent: false },
      });
      updated = await tx.softwareRelease.update({ where: { id: r.id }, data: { isCurrent: true } });
    } else {
      if (r.status === "ARCHIVED") return r;
      updated = await tx.softwareRelease.update({ where: { id: r.id }, data: { status: "ARCHIVED", isCurrent: false, archivedAt: new Date() } });
    }
    await recomputeCurrentVersion(tx, r.softwareProductId);
    await audit(actor(s), `software_release.${action}`, { type: "SoftwareRelease", id: r.id }, { version: r.version, channel: r.releaseChannel }, tx);
    return updated;
  });
}

export async function updateRelease(s: Staff, releaseId: string, input: z.infer<typeof releasePatchSchema>) {
  const r = await shopDb().softwareRelease.update({ where: { id: releaseId }, data: input }).catch((e) => {
    if ((e as { code?: string }).code === "P2025") throw notFound("Release");
    throw e;
  });
  await audit(actor(s), "software_release.update", { type: "SoftwareRelease", id: releaseId }, { fields: Object.keys(input) });
  return r;
}

/**
 * Discards an upload that never passed verification (cancelled, failed or expired). Such a
 * release was never downloadable, so removing it frees its version number without touching
 * history. Verified releases are immutable and can only be archived.
 */
export async function discardUploadingRelease(s: Staff, releaseId: string) {
  const db = shopDb();
  const r = await db.softwareRelease.findUnique({ where: { id: releaseId }, include: { _count: { select: { downloads: true } } } });
  if (!r) throw notFound("Release");
  if (r.status !== "UPLOADING" || r._count.downloads > 0) {
    throw new ShopError("INVALID_STATE", "Only an unverified upload can be discarded. Archive verified releases instead.");
  }
  await storage().delete({ store: "SOFTWARE", key: r.storageKey }).catch(() => undefined);
  await db.softwareRelease.delete({ where: { id: r.id } });
  await audit(actor(s), "software_release.upload_discarded", { type: "SoftwareRelease", id: r.id }, { version: r.version, productId: r.softwareProductId });
}

/** Staff download of any release (including drafts), audited. */
export async function staffReleaseDownloadUrl(s: Staff, releaseId: string) {
  const r = await shopDb().softwareRelease.findUnique({ where: { id: releaseId } });
  if (!r || r.status === "UPLOADING") throw notFound("Release");
  const { url } = await storage().createDownloadUrl({ store: "SOFTWARE", key: r.storageKey }, { expiresInSeconds: 120, filename: r.originalFilename });
  await audit(actor(s), "software_release.staff_download", { type: "SoftwareRelease", id: r.id });
  return url;
}

export async function listSoftwareDownloads(params: { productId?: string; customerId?: string; page?: number }) {
  const db = shopDb();
  const where: Prisma.SoftwareDownloadWhereInput = {
    ...(params.productId ? { softwareProductId: params.productId } : {}),
    ...(params.customerId ? { customerId: params.customerId } : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const [total, items] = await Promise.all([
    db.softwareDownload.count({ where }),
    db.softwareDownload.findMany({
      where,
      orderBy: { downloadedAt: "desc" },
      skip: (page - 1) * 100,
      take: 100,
      select: {
        id: true, downloadedAt: true, source: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true, companyName: true } },
        product: { select: { id: true, name: true } },
        release: { select: { id: true, version: true, platform: true, architecture: true, releaseChannel: true } },
      },
    }),
  ]);
  return { total, page, pageCount: Math.max(Math.ceil(total / 100), 1), items };
}

export async function softwareDashboard() {
  const db = shopDb();
  const since = new Date(Date.now() - 30 * 86400000);
  const [pending, waitingCustomer, downloads30, licenses30, recentDownloads] = await Promise.all([
    db.softwareActivationRequest.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } } }),
    db.softwareActivationRequest.count({ where: { status: "WAITING_FOR_CUSTOMER" } }),
    db.softwareDownload.count({ where: { downloadedAt: { gte: since } } }),
    db.softwareLicense.count({ where: { licenseSource: "PURCHASE", purchasedAt: { gte: since } } }),
    db.softwareDownload.findMany({
      orderBy: { downloadedAt: "desc" },
      take: 6,
      select: {
        id: true, downloadedAt: true,
        customer: { select: { id: true, email: true, firstName: true, lastName: true } },
        product: { select: { name: true } },
        release: { select: { version: true } },
      },
    }),
  ]);
  return { pending, waitingCustomer, downloads30, licenses30, recentDownloads };
}
