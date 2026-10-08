import "server-only";
import { shopDb } from "../../../db";

/**
 * Read-only admin read models for catalog pages that the services do not (yet) expose.
 * No mutations here: every write goes through the audited API routes / services.
 */

export async function listBundlesAdmin(params: { q?: string; status?: string }) {
  const status = params.status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(params.status)
    ? (params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED") : undefined;
  return shopDb().bundle.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(params.q
        ? { OR: [
            { title: { contains: params.q, mode: "insensitive" } },
            { sku: { contains: params.q, mode: "insensitive" } },
          ] }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true, sku: true, title: true, status: true, priceCents: true, currency: true, featured: true, updatedAt: true,
      items: { select: { arrangement: { select: { priceCents: true } } } },
    },
  });
}

export async function getBundleAdmin(id: string) {
  return shopDb().bundle.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { position: "asc" },
        select: { arrangementId: true },
      },
    },
  });
}

/** Cover image versions for a bundle. Storage keys never leave the server. */
export async function listBundleCoverVersions(bundleId: string) {
  const assets = await shopDb().asset.findMany({
    where: { bundleId, kind: "COVER_IMAGE" },
    orderBy: { createdAt: "asc" },
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

/** Compact list for the collection arrangement picker (plus anything already in the bundle). */
export async function arrangementPickerOptions(includeIds: string[] = []) {
  return shopDb().arrangement.findMany({
    where: { OR: [{ status: { not: "ARCHIVED" } }, { id: { in: includeIds } }] },
    orderBy: { displayTitle: "asc" },
    select: { id: true, sku: true, displayTitle: true, priceCents: true, status: true },
  });
}

export async function listWorksAdmin() {
  return shopDb().work.findMany({
    orderBy: { title: "asc" },
    include: { _count: { select: { arrangements: true } } },
  });
}

export async function listArrangersAdmin() {
  return shopDb().arranger.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { arrangements: true } } },
  });
}

export async function listProfilesAndTaxonomy() {
  const db = shopDb();
  const [profiles, genres, tags] = await Promise.all([
    db.systemProfile.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { compatibilities: true } } } }),
    db.genre.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { arrangements: true } } } }),
    db.tag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { arrangements: true } } } }),
  ]);
  return { profiles, genres, tags };
}
