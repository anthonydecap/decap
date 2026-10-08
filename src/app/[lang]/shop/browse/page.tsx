import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { catalogQuerySchema } from "@/modules/shop/schemas";
import { catalogFacets, searchCatalog } from "@/modules/shop/services/catalog";
import { toCatalogQuery } from "@/modules/shop/ui/catalog-params";
import { ArrangementGrid } from "@/modules/shop/ui/store/ArrangementCard";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { AutoSubmitForm } from "@/modules/shop/ui/store/FilterForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse" };

type SP = Record<string, string | string[] | undefined>;

const selectClass =
  "block w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/10";

export default async function BrowsePage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<SP> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const raw = Object.fromEntries(
    Object.entries(await searchParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]).filter(([, v]) => v !== "" && v != null),
  );
  const parsed = catalogQuerySchema.safeParse(raw);
  const p = parsed.success ? parsed.data : {};
  const customer = await getCurrentCustomer();
  const [result, facets] = await Promise.all([searchCatalog(toCatalogQuery(p), customer?.id), catalogFacets()]);
  const action = shopPath(urlLang, "/browse");
  const pageHref = (page: number) => {
    const qs = new URLSearchParams({ ...(raw as Record<string, string>), page: String(page) });
    return `${action}?${qs.toString()}`;
  };
  const hasFilters = Object.keys(raw).some((k) => k !== "page" && k !== "sort");

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <FadeIn>
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
            {p.q ? `“${p.q}”` : t.browse}
          </h1>
          <p className="mt-3 text-neutral-600">{t.results(result.total)}</p>
        </FadeIn>

        <AutoSubmitForm action={action} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Filters */}
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-6 lg:sticky lg:top-20">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="q" className="text-sm font-medium text-neutral-800">{t.searchLabel}</label>
                <input id="q" name="q" type="search" defaultValue={p.q} placeholder={t.searchPlaceholder} className={selectClass} />
              </div>

              {facets.genres.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="genre" className="text-sm font-medium text-neutral-800">{t.genre}</label>
                  <select id="genre" name="genre" defaultValue={p.genre ?? ""} className={selectClass}>
                    <option value="">{t.viewAll}</option>
                    {facets.genres.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
                  </select>
                </div>
              )}
              {facets.arrangers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="arranger" className="text-sm font-medium text-neutral-800">{t.arranger}</label>
                  <select id="arranger" name="arranger" defaultValue={p.arranger ?? ""} className={selectClass}>
                    <option value="">{t.viewAll}</option>
                    {facets.arrangers.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                  </select>
                </div>
              )}
              {facets.compatibility.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="compatibility" className="text-sm font-medium text-neutral-800">{t.compatibility}</label>
                  <select id="compatibility" name="compatibility" defaultValue={p.compatibility ?? ""} className={selectClass}>
                    <option value="">{t.viewAll}</option>
                    {facets.compatibility.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
              )}
              {facets.eras.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="era" className="text-sm font-medium text-neutral-800">{t.era}</label>
                  <select id="era" name="era" defaultValue={p.era ?? ""} className={selectClass}>
                    <option value="">{t.viewAll}</option>
                    {facets.eras.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              )}
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-sm font-medium text-neutral-800">{t.priceRange}</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="minPrice" className="text-xs text-neutral-500">{t.minPrice}</label>
                    <input id="minPrice" name="minPrice" type="number" min={0} step="1" inputMode="decimal" defaultValue={p.minPrice} className={selectClass} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="maxPrice" className="text-xs text-neutral-500">{t.maxPrice}</label>
                    <input id="maxPrice" name="maxPrice" type="number" min={0} step="1" inputMode="decimal" defaultValue={p.maxPrice} className={selectClass} />
                  </div>
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-sm font-medium text-neutral-800">{t.year}</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="yearFrom" className="text-xs text-neutral-500">{t.yearFrom}</label>
                    <input id="yearFrom" name="yearFrom" type="number" min={1000} max={3000} defaultValue={p.yearFrom} className={selectClass} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="yearTo" className="text-xs text-neutral-500">{t.yearTo}</label>
                    <input id="yearTo" name="yearTo" type="number" min={1000} max={3000} defaultValue={p.yearTo} className={selectClass} />
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-neutral-800">{t.contentType}</legend>
                <div className="mt-2 flex flex-col gap-2">
                  {(["midi", "audio", "video"] as const).map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm text-neutral-700">
                      <input type="checkbox" name={f} value="1" defaultChecked={p[f] === "1"} className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
                      {t[f]}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="flex items-center gap-3">
                <button type="submit" className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">
                  {t.search}
                </button>
                {hasFilters && <Link href={action} className="text-sm text-neutral-600 hover:text-neutral-950">{t.clearFilters}</Link>}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-9">
            <div className="mb-6 flex items-center justify-end gap-2">
              <label htmlFor="sort" className="text-sm text-neutral-600">{t.sort}</label>
              <select id="sort" name="sort" defaultValue={p.sort ?? "featured"} className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-950 focus:border-neutral-950 focus:outline-none">
                <option value="featured">{t.sortFeatured}</option>
                <option value="newest">{t.sortNewest}</option>
                <option value="price_asc">{t.sortPriceAsc}</option>
                <option value="price_desc">{t.sortPriceDesc}</option>
                <option value="title">{t.sortTitle}</option>
              </select>
            </div>
            {result.items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
                <p className="font-display text-xl font-bold text-neutral-950">{t.noResults}</p>
                <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.noResultsBody}</p>
                {hasFilters && <Link href={action} className="mt-6 inline-block rounded-full border-2 border-neutral-950 px-6 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white">{t.clearFilters}</Link>}
              </div>
            ) : (
              <ArrangementGrid items={result.items} lang={urlLang} />
            )}
            {result.pageCount > 1 && (
              <nav className="mt-12 flex items-center justify-between border-t border-neutral-200 pt-6 text-sm" aria-label="Pagination">
                {result.page > 1 ? <Link href={pageHref(result.page - 1)} className="font-semibold text-neutral-950 hover:underline">{t.previous}</Link> : <span />}
                <span className="text-neutral-500">{result.page} / {result.pageCount}</span>
                {result.page < result.pageCount ? <Link href={pageHref(result.page + 1)} className="font-semibold text-neutral-950 hover:underline">{t.next}</Link> : <span />}
              </nav>
            )}
          </div>
        </AutoSubmitForm>
      </Container>
    </section>
  );
}
