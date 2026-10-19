import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { getBundleDetail } from "@/modules/shop/services/catalog";
import { bundleQuoteForPlayer, type BundleQuote, type ShopPlayerContext } from "@/modules/shop/services/music-shop";
import { playerJourney } from "@/modules/shop/services/player-products";
import { storefrontPlayerContext } from "@/modules/shop/services/storefront-player";
import { formatDuration, formatMoney } from "@/modules/shop/ui/format";
import { Artwork } from "@/modules/shop/ui/store/Artwork";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { playerCopy, playerLinks } from "@/modules/shop/ui/store/copy-player";
import { LicenseNote, NoPlayerPurchase, SignedOutPurchase } from "@/modules/shop/ui/store/PurchaseGates";
import { PurchasePicker, type PickOption } from "@/modules/shop/ui/store/PurchasePicker";
import { PreviewButton } from "@/modules/shop/ui/store/PreviewPlayer";

export const dynamic = "force-dynamic";

type Params = { lang: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBundleDetail(slug);
  return b ? { title: b.title, description: b.subtitle ?? undefined } : { title: "Not found" };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ player?: string | string[] }>;
}) {
  const { lang, slug } = await params;
  const { player } = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const tp = playerCopy(urlLang);
  const customer = await getCurrentCustomer();
  const ctx = customer ? await storefrontPlayerContext(customer.id, player) : null;
  const b = await getBundleDetail(slug, ctx);
  if (!b) notFound();
  const money = (c: number) => formatMoney(c, b.currency, urlLang);
  // Completion price for every player, priced exactly like the cart (server-side).
  const quotes = ctx && b.items.length > 0
    ? await Promise.all(ctx.players.map(async (p) => ({ player: p, quote: await bundleQuoteForPlayer(ctx.customerId, b.id, p.id) })))
    : [];
  const journey = ctx && ctx.players.length === 0 ? await playerJourney(ctx.customerId) : null;
  const quote = quotes.find((q) => q.player.id === ctx?.selectedPlayerId)?.quote ?? null;
  const itemState = (item: (typeof b.items)[number]) => {
    if (item.player.state === "LICENSED") return { kind: "licensed" as const };
    if (quote?.available) {
      const cents = quote.allocations[item.id];
      return cents === undefined ? { kind: "unavailable" as const } : { kind: "price" as const, cents };
    }
    return { kind: "price" as const, cents: item.priceCents };
  };

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

              <p className="mt-6 text-sm text-neutral-600">
                {t.items(b.itemCount)}
                <span className="mx-2 text-neutral-300" aria-hidden>|</span>
                {t.normalTotal} <span className="line-through">{money(b.retailTotalCents)}</span>
                <span className="mx-2 text-neutral-300" aria-hidden>|</span>
                {t.youSave} <span className="font-semibold text-neutral-950">{money(b.savingCents)}</span>
              </p>
              <CollectionPurchase lang={urlLang} bundle={b} ctx={ctx} quotes={quotes} journey={journey} />
              <p className="mt-3 text-xs text-neutral-500">{t.vatNote}</p>
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
                    {(() => {
                      const st = itemState(item);
                      if (st.kind === "licensed") {
                        return (
                          <span className="inline-flex w-28 items-center justify-end gap-1 text-sm font-semibold text-neutral-950">
                            <Check size={14} weight="bold" aria-hidden /> {tp.licensed}
                          </span>
                        );
                      }
                      if (st.kind === "unavailable") return <span className="w-28 text-right text-sm text-neutral-500">{tp.itemNotAvailable}</span>;
                      return <span className="w-28 text-right text-sm text-neutral-500">{money(st.cents)}</span>;
                    })()}
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

type Bundle = NonNullable<Awaited<ReturnType<typeof getBundleDetail>>>;

/** Per player: what completing this collection costs and adds, then one button. */
function CollectionPurchase({ lang, bundle: b, ctx, quotes, journey }: {
  journey: Awaited<ReturnType<typeof playerJourney>>;
  lang: string;
  bundle: Bundle;
  ctx: ShopPlayerContext | null;
  quotes: { player: ShopPlayerContext["players"][number]; quote: BundleQuote }[];
}) {
  const item = { type: "BUNDLE" as const, bundleId: b.id };
  if (!ctx) return <SignedOutPurchase lang={lang} priceCents={b.priceCents} currency={b.currency} returnTo={shopPath(lang, `/collections/${b.slug}`)} />;
  if (ctx.players.length === 0) {
    return <NoPlayerPurchase lang={lang} priceCents={b.priceCents} currency={b.currency} item={item} alreadyBought={b.allOwned} assignLaterAllowed={ctx.assignLaterAllowed} journey={journey} />;
  }
  const options: PickOption[] = quotes.map(({ player, quote: q }) => ({
    player,
    state: q.available ? (q.additionalPlayer > 0 ? "ADDITIONAL" : "AVAILABLE") : q.reason === "ALREADY_OWNED" ? "LICENSED" : "INCOMPATIBLE",
    priceCents: q.chargedCents,
    collection: { willAdd: q.willAdd, already: q.alreadyLicensed, notAvailable: q.incompatible, extra: q.additionalPlayer },
  }));
  return (
    <>
      <PurchasePicker
        lang={lang}
        item={item}
        currency={b.currency}
        retailCents={b.priceCents}
        initialPlayerId={ctx.selectedPlayerId}
        options={options}
        libraryHrefs={Object.fromEntries(quotes.map(({ player }) => [player.id, playerLinks.playerMusic(lang, player.id)]))}
      />
      <LicenseNote lang={lang} />
    </>
  );
}
