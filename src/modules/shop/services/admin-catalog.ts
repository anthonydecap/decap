import "server-only";
import type { z } from "zod";
import type { Prisma } from "@/generated/shop-prisma/client";
import { validateArrangementForPublish, validateBundleForPublish, type PublishIssue } from "../domain/publish-validator";
import { shopConfig } from "../config";
import { shopDb } from "../db";
import { ShopError } from "../errors";
import type {
  arrangementSchema, arrangerSchema, bundleSchema, systemProfileSchema, taxonomySchema, workSchema,
} from "../schemas";
import { audit } from "./audit";

/** Admin catalog commands. Every mutation is audited; publishing always runs the validator. */

type Staff = { staffId: string };
const actor = (s: Staff) => ({ type: "STAFF" as const, staffId: s.staffId });

function uniqueViolation(e: unknown, what: string): never {
  if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
    throw new ShopError("CONFLICT", `${what} already exists (duplicate SKU / slug / code)`);
  }
  throw e;
}

// ─── Works ───────────────────────────────────────────────────────────────────

export async function saveWork(s: Staff, id: string | null, data: z.infer<typeof workSchema>) {
  const db = shopDb();
  const work = id ? await db.work.update({ where: { id }, data }) : await db.work.create({ data });
  await audit(actor(s), id ? "work.update" : "work.create", { type: "Work", id: work.id }, { title: work.title });
  return work;
}

export async function deleteWork(s: Staff, id: string) {
  const db = shopDb();
  if (await db.arrangement.count({ where: { workId: id } })) {
    throw new ShopError("CONFLICT", "Work is used by arrangements");
  }
  await db.work.delete({ where: { id } });
  await audit(actor(s), "work.delete", { type: "Work", id });
}

// ─── Arrangers ───────────────────────────────────────────────────────────────

export async function saveArranger(s: Staff, id: string | null, data: z.infer<typeof arrangerSchema>) {
  const db = shopDb();
  try {
    const arranger = id ? await db.arranger.update({ where: { id }, data }) : await db.arranger.create({ data });
    await audit(actor(s), id ? "arranger.update" : "arranger.create", { type: "Arranger", id: arranger.id }, {
      name: arranger.name, royaltyBasis: arranger.defaultRoyaltyBasis, royaltyRateBps: arranger.defaultRoyaltyRateBps,
    });
    return arranger;
  } catch (e) {
    uniqueViolation(e, "Arranger");
  }
}

// ─── System profiles / taxonomy ──────────────────────────────────────────────

export async function saveSystemProfile(s: Staff, id: string | null, data: z.infer<typeof systemProfileSchema>) {
  const db = shopDb();
  try {
    const p = id ? await db.systemProfile.update({ where: { id }, data }) : await db.systemProfile.create({ data });
    await audit(actor(s), id ? "system_profile.update" : "system_profile.create", { type: "SystemProfile", id: p.id }, { code: p.code });
    return p;
  } catch (e) {
    uniqueViolation(e, "Profile");
  }
}

export async function deleteSystemProfile(s: Staff, id: string) {
  const db = shopDb();
  if (await db.arrangementCompatibility.count({ where: { systemProfileId: id } })) {
    throw new ShopError("CONFLICT", "Profile is used by arrangements. Deactivate it instead.");
  }
  await db.systemProfile.delete({ where: { id } });
  await audit(actor(s), "system_profile.delete", { type: "SystemProfile", id });
}

export async function saveGenre(s: Staff, id: string | null, data: z.infer<typeof taxonomySchema>) {
  try {
    const g = id ? await shopDb().genre.update({ where: { id }, data }) : await shopDb().genre.create({ data });
    await audit(actor(s), id ? "genre.update" : "genre.create", { type: "Genre", id: g.id }, data);
    return g;
  } catch (e) {
    uniqueViolation(e, "Genre");
  }
}

export async function saveTag(s: Staff, id: string | null, data: z.infer<typeof taxonomySchema>) {
  try {
    const t = id ? await shopDb().tag.update({ where: { id }, data }) : await shopDb().tag.create({ data });
    await audit(actor(s), id ? "tag.update" : "tag.create", { type: "Tag", id: t.id }, data);
    return t;
  } catch (e) {
    uniqueViolation(e, "Tag");
  }
}

export async function deleteGenre(s: Staff, id: string) {
  // Detaches from arrangements (implicit many-to-many) then deletes.
  await shopDb().genre.delete({ where: { id } });
  await audit(actor(s), "genre.delete", { type: "Genre", id });
}

export async function deleteTag(s: Staff, id: string) {
  await shopDb().tag.delete({ where: { id } });
  await audit(actor(s), "tag.delete", { type: "Tag", id });
}

// ─── Arrangements ────────────────────────────────────────────────────────────

export async function saveArrangement(s: Staff, id: string | null, input: z.infer<typeof arrangementSchema>) {
  const db = shopDb();
  const { genreIds, tagIds, compatibility, searchKeywords, ...fields } = input;
  const keywords = [...new Set(searchKeywords.map((k) => k.toLowerCase()))];

  const existing = id ? await db.arrangement.findUnique({ where: { id } }) : null;
  if (id && !existing) throw new ShopError("NOT_FOUND", "Arrangement not found");

  try {
    const arrangement = await db.$transaction(async (tx) => {
      // Any rights decision (on create, or a change on update) records who made it and when.
      const rightsDecided = existing ? existing.rightsStatus !== fields.rightsStatus : fields.rightsStatus !== "NOT_REVIEWED";
      const data = {
        ...fields,
        searchKeywords: keywords,
        rightsReviewedAt: rightsDecided ? new Date() : existing?.rightsReviewedAt ?? null,
        rightsReviewedByStaffId: rightsDecided ? s.staffId : existing?.rightsReviewedByStaffId ?? null,
      };
      const a = id
        ? await tx.arrangement.update({
            where: { id },
            data: {
              ...data,
              genres: { set: genreIds.map((g) => ({ id: g })) },
              tags: { set: tagIds.map((t) => ({ id: t })) },
            },
          })
        : await tx.arrangement.create({
            data: {
              ...data,
              status: "DRAFT",
              genres: { connect: genreIds.map((g) => ({ id: g })) },
              tags: { connect: tagIds.map((t) => ({ id: t })) },
            },
          });
      await tx.arrangementCompatibility.deleteMany({ where: { arrangementId: a.id } });
      if (compatibility.length) {
        await tx.arrangementCompatibility.createMany({
          data: compatibility.map((c) => ({ arrangementId: a.id, systemProfileId: c.systemProfileId, notes: c.notes })),
        });
      }
      return a;
    });

    // A published arrangement edited into an invalid state is pulled back to DRAFT.
    let result = arrangement;
    if (arrangement.status === "PUBLISHED") {
      const issues = await arrangementPublishIssues(arrangement.id);
      if (issues.length) {
        result = await db.arrangement.update({ where: { id: arrangement.id }, data: { status: "DRAFT" } });
        await audit(actor(s), "arrangement.auto_unpublished", { type: "Arrangement", id: arrangement.id }, {
          issues: issues.map((i) => i.code),
        });
      }
    }
    await audit(actor(s), id ? "arrangement.update" : "arrangement.create", { type: "Arrangement", id: arrangement.id }, {
      sku: arrangement.sku, priceCents: arrangement.priceCents,
      ...(existing && existing.priceCents !== arrangement.priceCents ? { previousPriceCents: existing.priceCents } : {}),
      ...(existing && existing.rightsStatus !== arrangement.rightsStatus ? { rightsStatus: arrangement.rightsStatus } : {}),
    });
    return result;
  } catch (e) {
    uniqueViolation(e, "Arrangement");
  }
}

export async function arrangementPublishIssues(id: string): Promise<PublishIssue[]> {
  const a = await shopDb().arrangement.findUnique({
    where: { id },
    include: {
      arranger: { select: { active: true } },
      compatibilities: { include: { systemProfile: { select: { isGeneric: true, active: true } } } },
      assets: { include: { activeVersion: { select: { status: true } } } },
    },
  });
  if (!a) throw new ShopError("NOT_FOUND", "Arrangement not found");
  const validActiveKinds = new Set(a.assets.filter((x) => x.activeVersion?.status === "VALID").map((x) => x.kind));
  return validateArrangementForPublish({
    sku: a.sku,
    slug: a.slug,
    displayTitle: a.displayTitle,
    hasWork: Boolean(a.workId),
    hasArranger: Boolean(a.arrangerId),
    arrangerActive: a.arranger.active,
    priceCents: a.priceCents,
    rightsStatus: a.rightsStatus,
    licenseEndsAt: a.licenseEndsAt,
    compatibilityCount: a.compatibilities.filter((c) => c.systemProfile.active).length,
    hasGenericCompatibility: a.compatibilities.some((c) => c.systemProfile.isGeneric),
    validActiveKinds,
    requirePreview: shopConfig.requirePreviewToPublish,
  });
}

export async function setArrangementStatus(s: Staff, id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  const db = shopDb();
  if (status === "PUBLISHED") {
    const issues = await arrangementPublishIssues(id);
    if (issues.length) throw new ShopError("PUBLISH_BLOCKED", "Arrangement cannot be published yet", { issues });
  }
  const current = await db.arrangement.findUniqueOrThrow({ where: { id } });
  const a = await db.arrangement.update({
    where: { id },
    data: { status, ...(status === "PUBLISHED" && !current.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit(actor(s), `arrangement.${status.toLowerCase()}`, { type: "Arrangement", id }, { sku: a.sku, from: current.status });
  return a;
}

// ─── Bundles ─────────────────────────────────────────────────────────────────

export async function saveBundle(s: Staff, id: string | null, input: z.infer<typeof bundleSchema>) {
  const db = shopDb();
  const { arrangementIds, ...fields } = input;
  const found = await db.arrangement.count({ where: { id: { in: arrangementIds } } });
  if (found !== arrangementIds.length) throw new ShopError("VALIDATION_FAILED", "Unknown arrangement in bundle");
  try {
    const bundle = await db.$transaction(async (tx) => {
      const b = id
        ? await tx.bundle.update({ where: { id }, data: fields })
        : await tx.bundle.create({ data: { ...fields, status: "DRAFT" } });
      await tx.bundleItem.deleteMany({ where: { bundleId: b.id } });
      if (arrangementIds.length) {
        await tx.bundleItem.createMany({
          data: arrangementIds.map((arrangementId, position) => ({ bundleId: b.id, arrangementId, position })),
        });
      }
      return b;
    });
    let result = bundle;
    if (bundle.status === "PUBLISHED" && (await bundlePublishIssues(bundle.id)).length) {
      result = await db.bundle.update({ where: { id: bundle.id }, data: { status: "DRAFT" } });
      await audit(actor(s), "bundle.auto_unpublished", { type: "Bundle", id: bundle.id });
    }
    await audit(actor(s), id ? "bundle.update" : "bundle.create", { type: "Bundle", id: bundle.id }, {
      sku: bundle.sku, priceCents: bundle.priceCents, itemCount: arrangementIds.length,
    });
    return result;
  } catch (e) {
    uniqueViolation(e, "Bundle");
  }
}

export async function bundlePublishIssues(id: string) {
  const b = await shopDb().bundle.findUnique({
    where: { id },
    include: { items: { include: { arrangement: { select: { id: true, status: true, priceCents: true } } } } },
  });
  if (!b) throw new ShopError("NOT_FOUND", "Bundle not found");
  return validateBundleForPublish({
    sku: b.sku, slug: b.slug, title: b.title, priceCents: b.priceCents,
    items: b.items.map((i) => ({
      arrangementId: i.arrangement.id, published: i.arrangement.status === "PUBLISHED", priceCents: i.arrangement.priceCents,
    })),
  });
}

export async function setBundleStatus(s: Staff, id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  const db = shopDb();
  if (status === "PUBLISHED") {
    const issues = await bundlePublishIssues(id);
    if (issues.length) throw new ShopError("PUBLISH_BLOCKED", "Bundle cannot be published yet", { issues });
  }
  const current = await db.bundle.findUniqueOrThrow({ where: { id } });
  const b = await db.bundle.update({
    where: { id },
    data: { status, ...(status === "PUBLISHED" && !current.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await audit(actor(s), `bundle.${status.toLowerCase()}`, { type: "Bundle", id }, { sku: b.sku, from: current.status });
  return b;
}

// ─── Admin read models ───────────────────────────────────────────────────────

export async function listArrangementsAdmin(params: { q?: string; status?: string; page?: number }) {
  const db = shopDb();
  const where: Prisma.ArrangementWhereInput = {
    ...(params.status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(params.status)
      ? { status: params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(params.q
      ? {
          OR: [
            { displayTitle: { contains: params.q, mode: "insensitive" } },
            { sku: { contains: params.q, mode: "insensitive" } },
            { work: { title: { contains: params.q, mode: "insensitive" } } },
            { arranger: { name: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const page = Math.max(params.page ?? 1, 1);
  const [total, items] = await Promise.all([
    db.arrangement.count({ where }),
    db.arrangement.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * 50,
      take: 50,
      select: {
        id: true, sku: true, displayTitle: true, status: true, priceCents: true, currency: true, rightsStatus: true,
        updatedAt: true, featured: true,
        work: { select: { title: true } },
        arranger: { select: { name: true } },
      },
    }),
  ]);
  return { total, items, page, pageCount: Math.max(Math.ceil(total / 50), 1) };
}

export async function getArrangementAdmin(id: string) {
  return shopDb().arrangement.findUnique({
    where: { id },
    include: {
      work: true,
      arranger: true,
      genres: true,
      tags: true,
      compatibilities: { include: { systemProfile: true } },
      bundleItems: { include: { bundle: { select: { id: true, title: true, sku: true, status: true } } } },
    },
  });
}

export async function catalogLookups() {
  const db = shopDb();
  const [works, arrangers, genres, tags, profiles] = await Promise.all([
    db.work.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, originalArtist: true } }),
    db.arranger.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, active: true } }),
    db.genre.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
    db.systemProfile.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { works, arrangers, genres, tags, profiles };
}
