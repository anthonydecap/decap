import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { getBundleDetail } from "@/modules/shop/services/catalog";
import { formatDuration, formatMoney } from "@/modules/shop/ui/format";
import { AddToCartButton } from "@/modules/shop/ui/store/AddToCartButton";
import { Artwork } from "@/modules/shop/ui/store/Artwork";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { PreviewButton } from "@/modules/shop/ui/store/PreviewPlayer";

export const dynamic = "force-dynamic";

type Params = { lang: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBundleDetail(slug);
  return b ? { title: b.title, description: b.subtitle ?? undefined } : { title: "Not found" };
}

export default async function CollectionPage({ params }: { params: Promise<Params> }) {
  const { lang, slug } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await getCurrentCustomer();
  const b = await getBundleDetail(slug, customer?.id);
  if (!b) notFound();
  const money = (c: number) => formatMoney(c, b.currency, urlLang);
  const partial = b.ownedCount > 0 && !b.allOwned && b.completion;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeIn className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Artwork src={b.coverUrl} title={b.title} rounded="rounded-3xl" eager />
            </div>
          </FadeIn>

          <div className="lg:col-span-7">
            <FadeIn>
              <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{b.title}</h1>
              {b.subtitle && <p className="mt-3 text-xl text-neutral-600">{b.subtitle}</p>}
              {b.description && <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed text-neutral-600">{b.description}</p>}

              {/* Pricing story */}
              <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm text-neutral-500">{t.normalTotal}</dt>
                    <dd className="mt-1 text-lg text-neutral-500 line-through">{money(b.retailTotalCents)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">{t.collectionPrice}</dt>
                    <dd className="mt-1 font-display text-2xl font-bold text-neutral-950">{money(b.priceCents)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-neutral-500">{t.youSave}</dt>
                    <dd className="mt-1 text-lg font-semibold text-neutral-950">{money(b.savingCents)}</dd>
                  </div>
                </dl>

                {b.allOwned ? (
                  <p className="mt-6 border-t border-neutral-200 pt-6 text-neutral-700">{t.allOwned}</p>
                ) : partial ? (
                  <div className="mt-6 flex flex-col gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">{t.youOwnXofY(b.ownedCount, b.itemCount)}</p>
                      <p className="mt-1 text-neutral-600">
                        {t.completeFor} <span className="font-semibold text-neutral-950">{money(b.completion!.payableCents)}</span>
                      </p>
                    </div>
                    <AddToCartButton lang={urlLang} item={{ type: "BUNDLE", bundleId: b.id }} />
                  </div>
                ) : (
                  <div className="mt-6 border-t border-neutral-200 pt-6">
                    <AddToCartButton lang={urlLang} item={{ type: "BUNDLE", bundleId: b.id }} />
                  </div>
                )}
                <p className="mt-4 text-xs text-neutral-500">{t.vatNote}</p>
              </div>
            </FadeIn>

            <FadeIn className="mt-12">
              <h2 className="font-display text-2xl font-bold text-neutral-950">{t.items(b.itemCount)}</h2>
              <ol className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
                {b.items.map((item, i) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <span className="w-6 shrink-0 text-right text-sm text-neutral-400">{i + 1}</span>
                    <div className="relative w-14 shrink-0">
                      <Artwork src={item.coverUrl} title="" rounded="rounded-lg" />
                      {item.previewAudioUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PreviewButton url={item.previewAudioUrl} label={`${t.play}: ${item.title}`} pauseLabel={t.pause} className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={shopPath(urlLang, `/arrangements/${item.slug}`)} className="block truncate font-medium text-neutral-950 hover:underline">
                        {item.title}
                      </Link>
                      <p className="truncate text-sm text-neutral-600">{[item.originalArtist ?? item.workTitle, item.arrangerName].filter(Boolean).join(", ")}</p>
                    </div>
                    <span className="hidden w-12 text-right text-sm text-neutral-500 sm:block">{formatDuration(item.durationSeconds)}</span>
                    {item.owned ? (
                      <span className="inline-flex w-24 items-center justify-end gap-1 text-sm font-semibold text-neutral-950">
                        <Check size={14} weight="bold" aria-hidden /> {t.ownedShort}
                      </span>
                    ) : (
                      <span className="w-24 text-right text-sm text-neutral-500">{money(item.priceCents)}</span>
                    )}
                  </li>
                ))}
              </ol>
            </FadeIn>
          </div>
        </div>
      </Container>
    </section>
  );
}
