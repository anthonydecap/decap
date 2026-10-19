import Link from "next/link";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { catalogFacets, featuredArrangements, newestArrangements, publishedBundles } from "@/modules/shop/services/catalog";
import { storefrontPlayerContext } from "@/modules/shop/services/storefront-player";
import { formatDuration, formatMoney } from "@/modules/shop/ui/format";
import { AddToCartButton } from "@/modules/shop/ui/store/AddToCartButton";
import { ArrangementCard } from "@/modules/shop/ui/store/ArrangementCard";
import { Artwork } from "@/modules/shop/ui/store/Artwork";
import { BundleCard } from "@/modules/shop/ui/store/BundleCard";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { playerCopy, playerLinks } from "@/modules/shop/ui/store/copy-player";
import { PreviewButton } from "@/modules/shop/ui/store/PreviewPlayer";
import { SearchForm } from "@/modules/shop/ui/store/SearchForm";

export const dynamic = "force-dynamic";

export default async function ShopLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ player?: string | string[] }>;
}) {
  const { lang } = await params;
  const { player } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const tp = playerCopy(urlLang);
  const customer = await getCurrentCustomer();
  const ctx = customer ? await storefrontPlayerContext(customer.id, player) : null;
  const playerId = ctx ? ctx.selectedPlayerId : undefined;
  const [featured, newest, bundles, facets] = await Promise.all([
    featuredArrangements(ctx, 4),
    newestArrangements(ctx, 6),
    publishedBundles({ take: 4 }),
    catalogFacets(),
  ]);
  const heroBundle = bundles[0] ?? null;
  const heroPick = heroBundle ? null : featured[0] ?? newest[0] ?? null;
  const featuredList = featured.length ? featured : newest.slice(0, 4);
  const isEmpty = featured.length === 0 && newest.length === 0 && bundles.length === 0;

  return (
    <>
      {/* Hero: left copy + search, right featured collection */}
      <section className="py-12 sm:py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <FadeIn className="lg:col-span-7">
              <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">{t.heroBody}</p>
              <SearchForm lang={urlLang} className="mt-10 max-w-xl" />
            </FadeIn>
            <FadeIn className="lg:col-span-5">
              {heroBundle ? (
                <Link href={shopPath(urlLang, `/collections/${heroBundle.slug}`)} className="group block">
                  <Artwork src={heroBundle.coverUrl} title={heroBundle.title} rounded="rounded-3xl" eager />
                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-bold text-neutral-950">{heroBundle.title}</p>
                      <p className="text-sm text-neutral-500">{t.items(heroBundle.itemCount)}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-neutral-950">{formatMoney(heroBundle.priceCents, heroBundle.currency, urlLang)}</p>
                  </div>
                </Link>
              ) : heroPick ? (
                <ArrangementCard item={heroPick} lang={urlLang} playerId={playerId} />
              ) : null}
            </FadeIn>
          </div>
        </Container>
      </section>

      {isEmpty && (
        <section className="pb-24">
          <Container>
            <div className="rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
              <p className="font-display text-xl font-bold text-neutral-950">{t.emptyCatalog}</p>
              <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.emptyCatalogBody}</p>
            </div>
          </Container>
        </section>
      )}

      {featuredList.length > 0 && (
        <section className="border-t border-neutral-200 py-16 sm:py-24">
          <Container>
            <FadeIn className="mb-10 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-bold leading-tight text-neutral-950 sm:text-4xl">{t.featured}</h2>
              <Link href={shopPath(urlLang, "/browse")} className="shrink-0 text-sm font-semibold text-neutral-950 hover:underline">{t.viewAll}</Link>
            </FadeIn>
            <FadeInStagger faster className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featuredList.map((item) => (
                <FadeIn key={item.id}><ArrangementCard item={item} lang={urlLang} playerId={playerId} /></FadeIn>
              ))}
            </FadeInStagger>
          </Container>
        </section>
      )}

      {bundles.length > 0 && (
        <section className="bg-neutral-50 py-16 sm:py-24">
          <Container>
            <FadeIn className="mb-10 max-w-2xl">
              <h2 className="font-display text-3xl font-bold leading-tight text-neutral-950 sm:text-4xl">{t.saveWithCollections}</h2>
              <p className="mt-4 text-lg text-neutral-600">{t.saveWithCollectionsBody}</p>
            </FadeIn>
            <FadeInStagger faster className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {bundles.map((b) => <FadeIn key={b.id}><BundleCard bundle={b} lang={urlLang} /></FadeIn>)}
            </FadeInStagger>
          </Container>
        </section>
      )}

      {newest.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              <FadeIn className="lg:col-span-4">
                <h2 className="font-display text-3xl font-bold leading-tight text-neutral-950 sm:text-4xl">{t.newArrivals}</h2>
                {facets.genres.length > 0 && (
                  <div className="mt-8">
                    <p className="text-sm font-medium text-neutral-800">{t.byGenre}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {facets.genres.map((g) => (
                        <li key={g.slug}>
                          <Link
                            href={shopPath(urlLang, `/browse?genre=${g.slug}`)}
                            className="inline-block rounded-full border border-neutral-300 px-3.5 py-1.5 text-sm text-neutral-800 transition hover:border-neutral-950 hover:text-neutral-950"
                          >
                            {g.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </FadeIn>
              <FadeIn className="lg:col-span-8">
                <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {newest.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 py-4">
                        <div className="relative w-16 shrink-0 sm:w-20">
                          <Artwork src={item.coverUrl} title="" rounded="rounded-xl" />
                          {item.previewAudioUrl && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <PreviewButton url={item.previewAudioUrl} label={`${t.play}: ${item.title}`} pauseLabel={t.pause} className="h-9 w-9" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link href={shopPath(urlLang, `/arrangements/${item.slug}`)} className="block truncate font-display font-bold text-neutral-950 hover:underline">
                            {item.title}
                          </Link>
                          <p className="truncate text-sm text-neutral-600">
                            {[item.originalArtist ?? item.workTitle, item.arrangerName].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <p className="hidden w-14 text-right text-sm text-neutral-500 sm:block">{formatDuration(item.durationSeconds)}</p>
                        <p className="w-24 text-right text-sm font-semibold text-neutral-950">
                          {item.player.state === "LICENSED" ? (
                            <span className="font-normal text-neutral-600">{tp.licensed}</span>
                          ) : (
                            formatMoney(item.player.state === "ADDITIONAL" ? item.player.priceCents : item.priceCents, item.currency, urlLang)
                          )}
                        </p>
                        {item.player.state !== "INCOMPATIBLE" && (
                          <AddToCartButton
                            lang={urlLang}
                            size="sm"
                            owned={item.player.state === "LICENSED"}
                            licensedHref={playerId ? playerLinks.playerMusic(urlLang, playerId) : undefined}
                            targetPlayerId={playerId}
                            item={{ type: "ARRANGEMENT", arrangementId: item.id }}
                            className="hidden sm:flex"
                          />
                        )}
                      </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
