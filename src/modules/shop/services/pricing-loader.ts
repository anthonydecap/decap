import "server-only";
import type { PricingCatalogArrangement, PricingCatalogBundle, PricingCatalogSoftware, PricingCartLine } from "../domain/cart-pricing";
import { shopDb, type ShopTx } from "../db";

/** Loads exactly the catalog data cart pricing needs, straight from the database. */
export async function loadPricingCatalog(lines: readonly PricingCartLine[], tx?: ShopTx) {
  const db = tx ?? shopDb();
  const arrangementIds = lines.filter((l) => l.type === "ARRANGEMENT").map((l) => (l as { arrangementId: string }).arrangementId);
  const bundleIds = lines.filter((l) => l.type === "BUNDLE").map((l) => (l as { bundleId: string }).bundleId);
  const softwareIds = lines.filter((l) => l.type === "SOFTWARE_LICENSE").map((l) => (l as { softwareProductId: string }).softwareProductId);
  const softwareRows = softwareIds.length
    ? await db.softwareProduct.findMany({
        where: { id: { in: softwareIds } },
        select: { id: true, slug: true, name: true, status: true, defaultLicensePriceCents: true, currency: true },
      })
    : [];
  const software = new Map<string, PricingCatalogSoftware>(
    softwareRows.map((p) => [p.id, {
      id: p.id, sku: `SW-${p.slug.toUpperCase()}`, title: `${p.name} license`,
      purchasable: p.status === "ACTIVE" && p.defaultLicensePriceCents != null && p.defaultLicensePriceCents > 0,
      priceCents: p.defaultLicensePriceCents ?? 0, currency: p.currency,
    }]),
  );

  const [arrangementRows, bundleRows] = await Promise.all([
    arrangementIds.length
      ? db.arrangement.findMany({
          where: { id: { in: arrangementIds } },
          select: { id: true, sku: true, displayTitle: true, status: true, priceCents: true, currency: true },
        })
      : Promise.resolve([]),
    bundleIds.length
      ? db.bundle.findMany({
          where: { id: { in: bundleIds } },
          select: {
            id: true, sku: true, title: true, status: true, priceCents: true, currency: true,
            items: {
              where: { arrangement: { status: "PUBLISHED" } },
              orderBy: { position: "asc" },
              select: { arrangement: { select: { id: true, sku: true, displayTitle: true, priceCents: true } } },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const arrangements = new Map<string, PricingCatalogArrangement>(
    arrangementRows.map((a) => [a.id, {
      id: a.id, sku: a.sku, title: a.displayTitle, published: a.status === "PUBLISHED",
      priceCents: a.priceCents, currency: a.currency,
    }]),
  );
  const bundles = new Map<string, PricingCatalogBundle>(
    bundleRows.map((b) => [b.id, {
      id: b.id, sku: b.sku, title: b.title, published: b.status === "PUBLISHED",
      priceCents: b.priceCents, currency: b.currency,
      items: b.items.map((i) => ({
        arrangementId: i.arrangement.id, sku: i.arrangement.sku, title: i.arrangement.displayTitle,
        retailCents: i.arrangement.priceCents,
      })),
    }]),
  );
  return { arrangements, bundles, software };
}
