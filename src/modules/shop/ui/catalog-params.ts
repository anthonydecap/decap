import type { z } from "zod";
import type { catalogQuerySchema } from "../schemas";
import type { CatalogQuery } from "../services/catalog";

/** URL search params (prices in euros) → catalog query (cents). */
export function toCatalogQuery(p: z.infer<typeof catalogQuerySchema>): CatalogQuery {
  return {
    q: p.q || undefined,
    genre: p.genre || undefined,
    arranger: p.arranger || undefined,
    work: p.work,
    compatibility: p.compatibility || undefined,
    minPriceCents: p.minPrice != null ? Math.round(p.minPrice * 100) : undefined,
    maxPriceCents: p.maxPrice != null ? Math.round(p.maxPrice * 100) : undefined,
    era: p.era || undefined,
    yearFrom: p.yearFrom,
    yearTo: p.yearTo,
    midi: p.midi === "1",
    audio: p.audio === "1",
    video: p.video === "1",
    sort: p.sort,
    page: p.page,
  };
}
