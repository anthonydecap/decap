import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info, Plus, Tray } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { customerMusic, customerMusicPlayers } from "@/modules/shop/services/music-licenses";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import { btnPrimary, btnSecondary, helpLicensingPath, Pager, playerPath, textLink } from "@/modules/shop/ui/store/account-ui";
import { AssignMusicForm } from "@/modules/shop/ui/store/AssignMusicForm";
import { shopPath } from "@/modules/shop/ui/store/copy";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";
import { inputClass } from "@/modules/shop/ui/store/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Music", robots: { index: false } };

const PAGE_SIZE = 50;

/**
 * Account-wide "My Music": each arrangement with the players it is licensed on, so the
 * customer sees everything without implying music moves freely between players. Music
 * bought for later is listed separately and can be placed on a player once.
 */
export default async function MyMusicPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string | string[]; player?: string | string[]; page?: string | string[] }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = accountCopy(urlLang);
  const base = shopPath(urlLang, "/account/music");
  const customer = await requireAccountCustomer(urlLang, base);

  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const [players, rows] = await Promise.all([customerMusicPlayers(customer.id), customerMusic(customer.id, { q })]);
  // Only the customer's own players are accepted as a filter.
  const filterPlayer = players.find((p) => p.id === sp.player) ?? null;
  const byId = new Map(players.map((p) => [p.id, p]));
  const eligible = players.filter((p) => p.eligible && p.supportsMusicLibrary);

  const licensed = rows.filter((r) => r.playerIds.length > 0 && (!filterPlayer || r.playerIds.includes(filterPlayer.id)));
  const waiting = rows.flatMap((r) =>
    r.unassigned.map((u) => ({
      licenseId: u.id,
      needsReview: u.needsReview,
      title: r.arrangement.displayTitle,
      subtitle: [r.arrangement.work.originalArtist ?? r.arrangement.work.title, r.arrangement.arranger.name].filter(Boolean).join(", "),
    })),
  );
  const placeable = waiting.filter((w) => !w.needsReview);
  const forDmi = waiting.filter((w) => w.needsReview);

  const pages = Math.max(Math.ceil(licensed.length / PAGE_SIZE), 1);
  const page = Math.min(Math.max(Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1, 1), pages);
  const visible = licensed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (filterPlayer) qs.set("player", filterPlayer.id);
    if (q) qs.set("q", q);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${base}?${s}` : base;
  };
  const hasAnyMusic = rows.length > 0 || q !== "";
  const filtered = Boolean(filterPlayer || q);

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <FadeIn className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.myMusicTitle}</h1>
            <p className="mt-4 text-lg text-neutral-600">{t.myMusicBody}</p>
          </div>
          {hasAnyMusic && (
            <Link href={shopPath(urlLang, "/browse")} className={`${btnSecondary} self-start sm:self-auto`}>
              {t.browseMusic}
            </Link>
          )}
        </FadeIn>

        {waiting.length > 0 && (
          <section id="waiting" aria-labelledby="waiting-title" className="mt-12 scroll-mt-24 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 lg:rounded-3xl">
            <div className="flex items-start gap-3">
              <Tray size={22} className="mt-1 shrink-0 text-neutral-700" aria-hidden />
              <div>
                <h2 id="waiting-title" className="font-display text-2xl font-bold text-neutral-950">{t.waitingSection}</h2>
                <p className="mt-1 text-neutral-600">{eligible.length ? t.waitingSectionBody : t.waitingSectionNoPlayers}</p>
              </div>
            </div>
            {placeable.length > 0 && (
              <div className="mt-6">
                {eligible.length > 0 ? (
                  <AssignMusicForm
                    lang={urlLang}
                    items={placeable.map(({ licenseId, title, subtitle }) => ({ licenseId, title, subtitle }))}
                    players={eligible.map((p) => ({ id: p.id, name: p.name, detail: `${p.typeName}, ${t.registration(p.maskedRegistration)}` }))}
                  />
                ) : (
                  <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                    {placeable.map((w) => (
                      <li key={w.licenseId} className="px-4 py-3">
                        <p className="font-medium text-neutral-950">{w.title}</p>
                        {w.subtitle && <p className="text-sm text-neutral-600">{w.subtitle}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {forDmi.length > 0 && (
              <div className="mt-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
                  <Info size={16} weight="bold" aria-hidden />
                  {t.needsReviewTag}
                </p>
                <ul className="mt-3 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
                  {forDmi.map((w) => (
                    <li key={w.licenseId} className="px-4 py-3">
                      <p className="font-medium text-neutral-950">{w.title}</p>
                      {w.subtitle && <p className="text-sm text-neutral-600">{w.subtitle}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {!hasAnyMusic ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-16 text-center sm:py-20">
            <p className="font-display text-xl font-bold text-neutral-950">{t.myMusicEmpty}</p>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.myMusicEmptyBody}</p>
            <Link href={shopPath(urlLang, "/browse")} className={`${btnPrimary} mt-8`}>
              {t.browseMusic}
              <ArrowRight size={14} weight="bold" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mt-12">
            <form action={base} method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
              {players.length > 1 && (
                <div className="flex flex-col gap-2 sm:w-64">
                  <label htmlFor="music-player" className="text-sm font-medium text-neutral-800">{t.playerFilter}</label>
                  <select id="music-player" name="player" defaultValue={filterPlayer?.id ?? ""} className={inputClass}>
                    <option value="">{t.allPlayers}</option>
                    {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 sm:max-w-sm">
                <label htmlFor="music-q" className="text-sm font-medium text-neutral-800">{t.searchLabel}</label>
                <input id="music-q" name="q" type="search" defaultValue={q} maxLength={100} placeholder={t.searchMusicPlaceholder} className={inputClass} />
              </div>
              <div className="flex items-center gap-4">
                <button type="submit" className={btnPrimary}>{t.show}</button>
                {filtered && <Link href={base} className={textLink}>{t.clearSearch}</Link>}
              </div>
            </form>

            {licensed.length === 0 ? (
              <p className="mt-10 text-neutral-600">{q ? t.noResults(q) : filterPlayer ? t.playerNoMusic : t.musicSummaryNone}</p>
            ) : (
              <>
                <p className="mt-8 text-sm tabular-nums text-neutral-500">
                  {t.showing((page - 1) * PAGE_SIZE + 1, (page - 1) * PAGE_SIZE + visible.length, licensed.length)}
                </p>
                <ul className="mt-3 divide-y divide-neutral-200 border-t border-neutral-200">
                  {visible.map(({ arrangement: a, playerIds }) => {
                    const on = playerIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
                    const others = eligible.filter((p) => !playerIds.includes(p.id));
                    return (
                      <li key={a.id} className="grid grid-cols-1 gap-3 py-5 md:grid-cols-12 md:gap-6">
                        <div className="min-w-0 md:col-span-5">
                          <p className="font-display text-lg font-bold text-neutral-950">{a.displayTitle}</p>
                          <p className="text-sm text-neutral-600">
                            {[a.work.originalArtist ?? a.work.title, a.arranger.name].filter(Boolean).join(", ")}
                          </p>
                        </div>
                        <div className="text-sm md:col-span-4">
                          <p className="text-neutral-500">{t.licensedOn}</p>
                          <ul className="mt-1 flex flex-col gap-0.5">
                            {on.map((p) => (
                              <li key={p.id}>
                                <Link href={playerPath(urlLang, p.id)} className="font-medium text-neutral-950 hover:underline">
                                  <span aria-hidden>• </span>
                                  {p.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        {others.length > 0 && (
                          <div className="flex flex-col gap-1.5 text-sm md:col-span-3 md:items-end">
                            {others.map((p) => (
                              <Link
                                key={p.id}
                                href={`${shopPath(urlLang, `/arrangements/${a.slug}`)}?player=${encodeURIComponent(p.id)}`}
                                className="inline-flex items-center gap-1.5 font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950"
                              >
                                <Plus size={12} weight="bold" aria-hidden />
                                {t.addTo(p.name)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <Pager lang={urlLang} page={page} pages={pages} href={pageHref} />
              </>
            )}

            {eligible.length > 1 && (
              <p className="mt-10 max-w-2xl text-sm text-neutral-600">
                {t.additionalNote}{" "}
                <Link href={helpLicensingPath(urlLang, "#another-player")} className="font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950">
                  {t.learnHowItWorks}
                </Link>
              </p>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
