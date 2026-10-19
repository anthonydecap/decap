import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { Check } from "@phosphor-icons/react/ssr";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { getArrangementDetail } from "@/modules/shop/services/catalog";
import { arrangementStateByPlayer, type ShopPlayerContext } from "@/modules/shop/services/music-shop";
import { playerJourney } from "@/modules/shop/services/player-products";
import { storefrontPlayerContext } from "@/modules/shop/services/storefront-player";
import { formatDuration, formatMoney } from "@/modules/shop/ui/format";
import { Artwork } from "@/modules/shop/ui/store/Artwork";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
import { playerCopy, playerLinks } from "@/modules/shop/ui/store/copy-player";
import { LicenseNote, NoPlayerPurchase, SignedOutPurchase } from "@/modules/shop/ui/store/PurchaseGates";
import { PurchasePicker } from "@/modules/shop/ui/store/PurchasePicker";
import { PreviewButton, PreviewProgress } from "@/modules/shop/ui/store/PreviewPlayer";

export const dynamic = "force-dynamic";

type Params = { lang: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArrangementDetail(slug);
  if (!a) return { title: "Not found" };
  return {
    title: a.title,
    description: a.subtitle ?? `${a.title}, arranged by ${a.arrangerName}.`,
  };
}

export default async function ArrangementPage({
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
  const customer = await getCurrentCustomer();
  const ctx = customer ? await storefrontPlayerContext(customer.id, player) : null;
  const a = await getArrangementDetail(slug, ctx);
  if (!a) notFound();
  const byPlayer = ctx && ctx.players.length > 0 ? await arrangementStateByPlayer(ctx, a) : [];
  const journey = ctx && ctx.players.length === 0 ? await playerJourney(ctx.customerId) : null;
  const selected = byPlayer.find((s) => s.player.id === ctx?.selectedPlayerId) ?? null;

  const facts: [string, string][] = [];
  const dur = formatDuration(a.durationSeconds);
  if (dur) facts.push([t.duration, dur]);
  if (a.tempoBpm) facts.push([t.tempo, `${a.tempoBpm} BPM`]);
  if (a.musicalKey) facts.push([t.key, a.musicalKey]);
  if (a.timeSignature) facts.push([t.timeSignature, a.timeSignature]);
  if (a.difficulty) facts.push([t.difficulty, `${a.difficulty} / 5`]);
  const contains = [a.flags.midi && t.midi, a.flags.audio && t.audio, a.flags.video && t.video].filter(Boolean) as string[];
  if (contains.length) facts.push([t.contains, contains.join(", ")]);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Media: artwork + preview (dark media surface, no gradient) */}
          <FadeIn className="lg:col-span-6">
            <div className="relative">
              <Artwork src={a.coverUrl} title={a.title} subtitle={a.originalArtist} rounded="rounded-3xl" eager />
              {(selected ? selected.state === "LICENSED" : a.player.state === "LICENSED") && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-950">
                  <Check size={12} weight="bold" aria-hidden />
                  {playerCopy(urlLang).licensed}
                </span>
              )}
            </div>
            {a.previewAudioUrl ? (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-neutral-950 p-4">
                <PreviewButton url={a.previewAudioUrl} label={t.play} pauseLabel={t.pause} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{t.play}</p>
                  <div className="mt-2"><PreviewProgress url={a.previewAudioUrl} /></div>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-neutral-500">{t.noPreview}</p>
            )}
            {a.previewVideoUrl && (
              <video
                src={a.previewVideoUrl}
                controls
                preload="none"
                playsInline
                className="mt-4 aspect-video w-full rounded-2xl bg-neutral-950"
              />
            )}
          </FadeIn>

          {/* Details */}
          <FadeIn className="lg:col-span-6">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{a.title}</h1>
            {a.subtitle && <p className="mt-3 text-xl text-neutral-600">{a.subtitle}</p>}
            <p className="mt-4 text-neutral-600">
              {a.originalArtist && <><span className="text-neutral-500">{t.originalArtist}:</span> {a.originalArtist}{a.workYear ? ` (${a.workYear})` : ""}<br /></>}
              <span className="text-neutral-500">{t.arrangedBy}:</span>{" "}
              <Link href={shopPath(urlLang, `/browse?arranger=${a.arrangerSlug}`)} className="text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950">
                {a.arrangerName}
              </Link>
            </p>

            <PurchasePanel lang={urlLang} a={a} ctx={ctx} byPlayer={byPlayer} journey={journey} />
            <p className="mt-3 text-xs text-neutral-500">{t.vatNote} SKU {a.sku}</p>

            {facts.length > 0 && (
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-neutral-200 pt-8 sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm text-neutral-500">{k}</dt>
                    <dd className="mt-1 font-medium text-neutral-950">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {a.genres.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {a.genres.map((g) => (
                  <li key={g.slug}>
                    <Link href={shopPath(urlLang, `/browse?genre=${g.slug}`)} className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 transition hover:bg-neutral-200">
                      {g.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {a.description && (
              <div className="mt-10 max-w-prose whitespace-pre-line text-base leading-relaxed text-neutral-600">{a.description}</div>
            )}

            <div className="mt-10 rounded-2xl border border-neutral-200 p-6">
              <h2 className="font-display text-lg font-bold text-neutral-950">{t.compatibility}</h2>
              {a.compatibility.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-600">{t.compatibleWithAll}</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2 text-sm text-neutral-700">
                  {a.compatibility.map((c) => (
                    <li key={c.code}>
                      <span className="font-medium text-neutral-950">{c.isGeneric ? t.compatibleWithAll : c.name}</span>
                      {c.manufacturer && !c.isGeneric && <span className="text-neutral-500">, {c.manufacturer}</span>}
                      {c.notes && <span className="block text-neutral-500">{c.notes}</span>}
                    </li>
                  ))}
                </ul>
              )}
              {a.compatibilityNotes && <p className="mt-3 text-sm text-neutral-600">{a.compatibilityNotes}</p>}
            </div>

            {a.bundles.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-bold text-neutral-950">{t.inCollections}</h2>
                <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
                  {a.bundles.map((b) => (
                    <li key={b.id}>
                      <Link href={shopPath(urlLang, `/collections/${b.slug}`)} className="flex items-center justify-between gap-4 py-3 text-sm transition hover:text-neutral-950">
                        <span className="font-medium text-neutral-950">{b.title}</span>
                        <span className="shrink-0 text-neutral-600">
                          {t.items(b.itemCount)}, {formatMoney(b.priceCents, b.currency, urlLang)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

type Detail = NonNullable<Awaited<ReturnType<typeof getArrangementDetail>>>;
type PlayerState = Awaited<ReturnType<typeof arrangementStateByPlayer>>[number];

/**
 * Price + "Where will this play?" + one button. Signed out: sign in. No player yet: how to
 * get one (never a dead end). Otherwise the picker, fed with server-computed state and
 * price per player.
 */
function PurchasePanel({ lang, a, ctx, byPlayer, journey }: {
  journey: Awaited<ReturnType<typeof playerJourney>>;
  lang: string;
  a: Detail;
  ctx: ShopPlayerContext | null;
  byPlayer: PlayerState[];
}) {
  const item = { type: "ARRANGEMENT" as const, arrangementId: a.id };
  if (!ctx) return <SignedOutPurchase lang={lang} priceCents={a.priceCents} currency={a.currency} returnTo={shopPath(lang, `/arrangements/${a.slug}`)} />;
  if (ctx.players.length === 0) {
    return <NoPlayerPurchase lang={lang} priceCents={a.priceCents} currency={a.currency} item={item} alreadyBought={a.player.state === "LICENSED"} assignLaterAllowed={ctx.assignLaterAllowed} journey={journey} />;
  }
  return (
    <>
      <PurchasePicker
        lang={lang}
        item={item}
        currency={a.currency}
        retailCents={a.priceCents}
        initialPlayerId={ctx.selectedPlayerId}
        options={byPlayer.map((s) => ({ player: s.player, state: s.state, priceCents: s.priceCents }))}
        libraryHrefs={Object.fromEntries(byPlayer.map((s) => [s.player.id, playerLinks.playerMusic(lang, s.player.id)]))}
      />
      <LicenseNote lang={lang} />
    </>
  );
}
