import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Plus } from "@phosphor-icons/react/ssr";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { resolveUrlLang } from "@/i18n";
import { shopDb } from "@/modules/shop/db";
import { playerDisplayName, playerLibrary } from "@/modules/shop/services/music-licenses";
import { formatDuration } from "@/modules/shop/ui/format";
import { requireAccountCustomer } from "@/modules/shop/ui/store/account-server";
import {
  addMusicHref,
  BackLink,
  btnPrimary,
  btnSecondary,
  MusicStatusBadge,
  Pager,
  playerPath,
  SearchBox,
  supportNewHref,
  textLink,
} from "@/modules/shop/ui/store/account-ui";
import { accountCopy } from "@/modules/shop/ui/store/copy-account";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Music Library", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 50;

/**
 * One player's music library: the live licenses of that player only, searched and paged on
 * the server (a player can hold thousands of arrangements). The player must belong to the
 * signed-in customer, and the library query is scoped to them as well.
 */
export default async function PlayerMusicPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; playerId: string }>;
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const { lang, playerId } = await params;
  const sp = await searchParams;
  const urlLang = resolveUrlLang(lang);
  const t = accountCopy(urlLang);
  const base = playerPath(urlLang, playerId, "/music");
  const customer = await requireAccountCustomer(urlLang, base);
  if (!UUID.test(playerId)) notFound();

  const player = await shopDb().registeredPlayer.findFirst({
    where: { id: playerId, customerId: customer.id },
    select: {
      id: true, friendlyName: true, registrationCode: true, status: true,
      playerType: { select: { name: true, supportsMusicLibrary: true } },
    },
  });
  if (!player) notFound();

  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const requestedPage = Math.max(Number.parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1, 1);
  const library = await playerLibrary(player.id, { q, page: requestedPage, pageSize: PAGE_SIZE, customerId: customer.id });
  const name = playerDisplayName(player);
  const canAdd = player.status === "ACTIVE" && player.playerType.supportsMusicLibrary;
  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <Container>
        <BackLink href={playerPath(urlLang, player.id)} label={t.backToPlayer(name)} />
        <FadeIn className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-neutral-500">{name}</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{t.libraryTitle}</h1>
            {(library.total > 0 || q) && (
              <p className="mt-3 text-lg tabular-nums text-neutral-600">{t.libraryCount(library.total)}</p>
            )}
          </div>
          {canAdd && (library.total > 0 || q) && (
            <Link href={addMusicHref(urlLang, player.id)} className={`${btnSecondary} self-start sm:self-auto`}>
              <Plus size={14} weight="bold" aria-hidden />
              {t.addMusic}
            </Link>
          )}
        </FadeIn>

        {library.total === 0 && !q ? (
          <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 px-6 py-16 text-center sm:py-20">
            <p className="font-display text-xl font-bold text-neutral-950">{t.playerNoMusic}</p>
            {canAdd && (
              <Link href={addMusicHref(urlLang, player.id)} className={`${btnPrimary} mt-8`}>
                {t.browseMusic}
                <ArrowRight size={14} weight="bold" aria-hidden />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mt-10">
              <SearchBox lang={urlLang} action={base} q={q} placeholder={t.searchLibraryPlaceholder} />
            </div>
            {library.items.length === 0 ? (
              <p className="mt-10 text-neutral-600">{t.noResults(q)}</p>
            ) : (
              <ul className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200">
                {library.items.map((l) => {
                  const a = l.arrangement;
                  const who = [a.work.originalArtist ?? a.work.title, a.arranger.name].filter(Boolean).join(", ");
                  return (
                    <li key={l.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-950">{a.displayTitle}</p>
                        <p className="text-sm text-neutral-600">{who}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-3 text-sm text-neutral-500">
                        {l.licenseSource === "PLAYER_STARTER_PACK" && (
                          <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-700">{t.starterTag}</span>
                        )}
                        {formatDuration(a.durationSeconds) && <span className="tabular-nums">{formatDuration(a.durationSeconds)}</span>}
                        <MusicStatusBadge lang={urlLang} status={l.status} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Pager lang={urlLang} page={library.page} pages={library.pages} href={pageHref} />
          </>
        )}

        <p className="mt-12">
          <Link href={supportNewHref(urlLang, { about: "music", player: player.id })} className={textLink}>
            {t.getHelpMusic}
          </Link>
        </p>
      </Container>
    </section>
  );
}
