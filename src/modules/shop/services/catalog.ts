import "server-only";
import type { Prisma } from "@/generated/shop-prisma/client";
import { allocateBundle, BundleAllocationError } from "../domain/bundle-allocation";
import { shopDb } from "../db";
import { previewMediaUrl } from "./media";
import { activeEntitlementArrangementIds } from "./entitlements";

/**
 * Storefront read model. Everything returned here is safe for public JSON: no storage keys
 * of masters, no hashes, no original filenames, no internal notes, no rights documents.
 */

const PUBLIC_ASSET_KINDS = ["COVER_IMAGE", "PREVIEW_AUDIO", "PREVIEW_VIDEO"] as const;

const activePublicAssets = {
  where: { kind: { in: [...PUBLIC_ASSET_KINDS] }, activeVersion: { status: "VALID" as const } },
  select: {
    kind: true,
    activeVersion: { select: { storageStore: true, storageKey: true, mimeType: true } },
  },
} satisfies Prisma.Arrangement$assetsArgs;

const cardSelect = {
  id: true,
  slug: true,
  sku: true,
  displayTitle: true,
  subtitle: true,
  priceCents: true,
  currency: true,
  durationSeconds: true,
  featured: true,
  publishedAt: true,
  containsMidi: true,
  containsAudio: true,
  containsVideo: true,
  work: { select: { title: true, originalArtist: true, year: true, era: true } },
  arranger: { select: { name: true, slug: true } },
  genres: { select: { name: true, slug: true } },
  assets: activePublicAssets,
} satisfies Prisma.ArrangementSelect;

type CardRow = Prisma.ArrangementGetPayload<{ select: typeof cardSelect }>;

export type ArrangementCard = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  subtitle: string | null;
  workTitle: string;
  originalArtist: string | null;
  arrangerName: string;
  arrangerSlug: string;
  priceCents: number;
  currency: string;
  durationSeconds: number | null;
  featured: boolean;
  genres: { name: string; slug: string }[];
  flags: { midi: boolean; audio: boolean; video: boolean };
  coverUrl: string | null;
  previewAudioUrl: string | null;
  previewVideoUrl: string | null;
  owned: boolean;
};

async function toCard(row: CardRow, owned: ReadonlySet<string>): Promise<ArrangementCard> {
  const byKind = (k: string) => row.assets.find((a) => a.kind === k)?.activeVersion ?? null;
  const [coverUrl, previewAudioUrl, previewVideoUrl] = await Promise.all([
    previewMediaUrl(byKind("COVER_IMAGE")),
    previewMediaUrl(byKind("PREVIEW_AUDIO")),
    previewMediaUrl(byKind("PREVIEW_VIDEO")),
  ]);
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    title: row.displayTitle,
    subtitle: row.subtitle,
    workTitle: row.work.title,
    originalArtist: row.work.originalArtist,
    arrangerName: row.arranger.name,
    arrangerSlug: row.arranger.slug,
    priceCents: row.priceCents,
    currency: row.currency,
    durationSeconds: row.durationSeconds,
    featured: row.featured,
    genres: row.genres,
    flags: { midi: row.containsMidi, audio: row.containsAudio, video: row.containsVideo },
    coverUrl,
    previewAudioUrl,
    previewVideoUrl,
    owned: owned.has(row.id),
  };
}

export type CatalogQuery = {
  q?: string;
  genre?: string;
  arranger?: string;
  work?: string;
  compatibility?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  era?: string;
  yearFrom?: number;
  yearTo?: number;
  midi?: boolean;
  audio?: boolean;
  video?: boolean;
  sort?: "featured" | "newest" | "price_asc" | "price_desc" | "title";
  page?: number;
  pageSize?: number;
};

export function buildCatalogWhere(query: CatalogQuery): Prisma.ArrangementWhereInput {
  const and: Prisma.ArrangementWhereInput[] = [{ status: "PUBLISHED" }];
  const q = query.q?.trim();
  if (q) {
    const term = q.slice(0, 100);
    and.push({
      OR: [
        { displayTitle: { contains: term, mode: "insensitive" } },
        { subtitle: { contains: term, mode: "insensitive" } },
        { sku: { equals: term, mode: "insensitive" } },
        { work: { title: { contains: term, mode: "insensitive" } } },
        { work: { originalArtist: { contains: term, mode: "insensitive" } } },
        { arranger: { name: { contains: term, mode: "insensitive" } } },
        { searchKeywords: { has: term.toLowerCase() } },
      ],
    });
  }
  if (query.genre) and.push({ genres: { some: { slug: query.genre } } });
  if (query.arranger) and.push({ arranger: { slug: query.arranger } });
  if (query.work) and.push({ workId: query.work });
  if (query.compatibility) {
    and.push({
      OR: [
        { compatibilities: { some: { systemProfile: { code: query.compatibility } } } },
        { compatibilities: { some: { systemProfile: { isGeneric: true } } } },
      ],
    });
  }
  if (query.minPriceCents != null) and.push({ priceCents: { gte: query.minPriceCents } });
  if (query.maxPriceCents != null) and.push({ priceCents: { lte: query.maxPriceCents } });
  if (query.era) and.push({ work: { era: { equals: query.era, mode: "insensitive" } } });
  if (query.yearFrom != null) and.push({ work: { year: { gte: query.yearFrom } } });
  if (query.yearTo != null) and.push({ work: { year: { lte: query.yearTo } } });
  if (query.midi) and.push({ containsMidi: true });
  if (query.audio) and.push({ containsAudio: true });
  if (query.video) and.push({ containsVideo: true });
  return { AND: and };
}

function orderBy(sort: CatalogQuery["sort"]): Prisma.ArrangementOrderByWithRelationInput[] {
  switch (sort) {
    case "newest": return [{ publishedAt: "desc" }, { displayTitle: "asc" }];
    case "price_asc": return [{ priceCents: "asc" }, { displayTitle: "asc" }];
    case "price_desc": return [{ priceCents: "desc" }, { displayTitle: "asc" }];
    case "title": return [{ displayTitle: "asc" }];
    default: return [{ featured: "desc" }, { publishedAt: "desc" }, { displayTitle: "asc" }];
  }
}

export async function searchCatalog(query: CatalogQuery, customerId?: string | null) {
  const db = shopDb();
  const pageSize = Math.min(Math.max(query.pageSize ?? 24, 1), 60);
  const page = Math.max(query.page ?? 1, 1);
  const where = buildCatalogWhere(query);
  const [total, rows, owned] = await Promise.all([
    db.arrangement.count({ where }),
    db.arrangement.findMany({ where, select: cardSelect, orderBy: orderBy(query.sort), skip: (page - 1) * pageSize, take: pageSize }),
    customerId ? activeEntitlementArrangementIds(customerId) : Promise.resolve(new Set<string>()),
  ]);
  return {
    items: await Promise.all(rows.map((r) => toCard(r, owned))),
    total,
    page,
    pageSize,
    pageCount: Math.max(Math.ceil(total / pageSize), 1),
  };
}

/** Facet values for the browse filters (only values that have published arrangements). */
export async function catalogFacets() {
  const db = shopDb();
  const published = { some: { status: "PUBLISHED" as const } };
  const [genres, arrangers, profiles, eras, priceRange] = await Promise.all([
    db.genre.findMany({ where: { arrangements: published }, select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    db.arranger.findMany({ where: { arrangements: published }, select: { name: true, slug: true }, orderBy: { name: "asc" } }),
    db.systemProfile.findMany({
      where: { active: true, compatibilities: { some: { arrangement: { status: "PUBLISHED" } } } },
      select: { code: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.work.findMany({
      where: { era: { not: null }, arrangements: published },
      select: { era: true },
      distinct: ["era"],
      orderBy: { era: "asc" },
    }),
    db.arrangement.aggregate({ where: { status: "PUBLISHED" }, _min: { priceCents: true }, _max: { priceCents: true } }),
  ]);
  return {
    genres,
    arrangers,
    compatibility: profiles,
    eras: eras.map((e) => e.era!).filter(Boolean),
    minPriceCents: priceRange._min.priceCents ?? 0,
    maxPriceCents: priceRange._max.priceCents ?? 0,
  };
}

export async function featuredArrangements(customerId?: string | null, take = 8) {
  const owned = customerId ? await activeEntitlementArrangementIds(customerId) : new Set<string>();
  const rows = await shopDb().arrangement.findMany({
    where: { status: "PUBLISHED", featured: true },
    select: cardSelect,
    orderBy: [{ publishedAt: "desc" }],
    take,
  });
  return Promise.all(rows.map((r) => toCard(r, owned)));
}

export async function newestArrangements(customerId?: string | null, take = 8) {
  const owned = customerId ? await activeEntitlementArrangementIds(customerId) : new Set<string>();
  const rows = await shopDb().arrangement.findMany({
    where: { status: "PUBLISHED" },
    select: cardSelect,
    orderBy: [{ publishedAt: "desc" }],
    take,
  });
  return Promise.all(rows.map((r) => toCard(r, owned)));
}

export async function getArrangementDetail(slug: string, customerId?: string | null) {
  const db = shopDb();
  const row = await db.arrangement.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      ...cardSelect,
      description: true,
      tempoBpm: true,
      musicalKey: true,
      timeSignature: true,
      difficulty: true,
      releaseDate: true,
      compatibilityNotes: true,
      compatibilities: {
        select: { notes: true, systemProfile: { select: { code: true, name: true, manufacturer: true, isGeneric: true } } },
      },
      bundleItems: {
        where: { bundle: { status: "PUBLISHED" } },
        select: { bundle: { select: { id: true, slug: true, title: true, priceCents: true, currency: true, _count: { select: { items: true } } } } },
      },
    },
  });
  if (!row) return null;
  const owned = customerId ? await activeEntitlementArrangementIds(customerId) : new Set<string>();
  const card = await toCard(row, owned);
  return {
    ...card,
    description: row.description,
    tempoBpm: row.tempoBpm,
    musicalKey: row.musicalKey,
    timeSignature: row.timeSignature,
    difficulty: row.difficulty,
    releaseDate: row.releaseDate,
    workYear: row.work.year,
    compatibilityNotes: row.compatibilityNotes,
    compatibility: row.compatibilities.map((c) => ({ ...c.systemProfile, notes: c.notes })),
    bundles: row.bundleItems.map((b) => ({
      id: b.bundle.id, slug: b.bundle.slug, title: b.bundle.title,
      priceCents: b.bundle.priceCents, currency: b.bundle.currency, itemCount: b.bundle._count.items,
    })),
  };
}

export type BundleSummary = {
  id: string;
  slug: string;
  sku: string;
  title: string;
  subtitle: string | null;
  priceCents: number;
  currency: string;
  retailTotalCents: number;
  savingCents: number;
  itemCount: number;
  coverUrl: string | null;
};

const bundleSelect = {
  id: true, slug: true, sku: true, title: true, subtitle: true, description: true, priceCents: true,
  currency: true, featured: true,
  assets: {
    where: { kind: "COVER_IMAGE" as const, activeVersion: { status: "VALID" as const } },
    select: { activeVersion: { select: { storageStore: true, storageKey: true } } },
  },
  items: {
    where: { arrangement: { status: "PUBLISHED" as const } },
    orderBy: { position: "asc" as const },
    select: { arrangement: { select: cardSelect } },
  },
} satisfies Prisma.BundleSelect;

async function toBundleSummary(row: Prisma.BundleGetPayload<{ select: typeof bundleSelect }>): Promise<BundleSummary> {
  const retail = row.items.reduce((s, i) => s + i.arrangement.priceCents, 0);
  let coverUrl = await previewMediaUrl(row.assets[0]?.activeVersion);
  if (!coverUrl) {
    // Fall back to the first item's artwork.
    const first = row.items[0]?.arrangement.assets.find((a) => a.kind === "COVER_IMAGE")?.activeVersion;
    coverUrl = await previewMediaUrl(first);
  }
  return {
    id: row.id, slug: row.slug, sku: row.sku, title: row.title, subtitle: row.subtitle,
    priceCents: row.priceCents, currency: row.currency, retailTotalCents: retail,
    savingCents: Math.max(retail - row.priceCents, 0), itemCount: row.items.length, coverUrl,
  };
}

export async function publishedBundles(opts: { featuredOnly?: boolean; take?: number } = {}) {
  const rows = await shopDb().bundle.findMany({
    where: { status: "PUBLISHED", ...(opts.featuredOnly ? { featured: true } : {}) },
    select: bundleSelect,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: opts.take ?? 24,
  });
  return Promise.all(rows.map(toBundleSummary));
}

export async function getBundleDetail(slug: string, customerId?: string | null) {
  const row = await shopDb().bundle.findFirst({ where: { slug, status: "PUBLISHED" }, select: bundleSelect });
  if (!row) return null;
  const owned = customerId ? await activeEntitlementArrangementIds(customerId) : new Set<string>();
  const summary = await toBundleSummary(row);
  const items = await Promise.all(row.items.map((i) => toCard(i.arrangement, owned)));
  const ownedCount = items.filter((i) => i.owned).length;

  let completion: { payableCents: number; payableRetailCents: number; allocations: Record<string, number> } | null = null;
  let allOwned = false;
  if (items.length > 0) {
    try {
      const r = allocateBundle({
        bundlePriceCents: row.priceCents,
        items: items.map((i) => ({ arrangementId: i.id, retailCents: i.priceCents })),
        excludedArrangementIds: new Set(items.filter((i) => i.owned).map((i) => i.id)),
      });
      completion = {
        payableCents: r.payableCents,
        payableRetailCents: r.payableRetailCents,
        allocations: Object.fromEntries(r.allocations.map((a) => [a.arrangementId, a.allocatedCents])),
      };
    } catch (e) {
      if (e instanceof BundleAllocationError && e.code === "ALREADY_OWNED") allOwned = true;
      else throw e;
    }
  }
  return { ...summary, description: row.description, items, ownedCount, allOwned, completion };
}
