import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { getArrangementDetail } from "@/modules/shop/services/catalog";
import { formatDuration, formatMoney } from "@/modules/shop/ui/format";
import { AddToCartButton } from "@/modules/shop/ui/store/AddToCartButton";
import { Artwork } from "@/modules/shop/ui/store/Artwork";
import { shopCopy, shopPath } from "@/modules/shop/ui/store/copy";
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

export default async function ArrangementPage({ params }: { params: Promise<Params> }) {
  const { lang, slug } = await params;
  const urlLang = resolveUrlLang(lang);
  const t = shopCopy(urlLang);
  const customer = await getCurrentCustomer();
  const a = await getArrangementDetail(slug, customer?.id);
  if (!a) notFound();

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
              {a.owned && (
                <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-950">{t.ownedShort}</span>
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

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <p className="font-display text-3xl font-bold text-neutral-950">{formatMoney(a.priceCents, a.currency, urlLang)}</p>
              <AddToCartButton lang={urlLang} owned={a.owned} item={{ type: "ARRANGEMENT", arrangementId: a.id }} />
            </div>
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
