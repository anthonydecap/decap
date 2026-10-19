import clsx from "clsx";
import Link from "next/link";
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  DownloadSimple,
  MinusCircle,
  PauseCircle,
  PianoKeys,
  Plus,
  Question,
  Archive,
} from "@phosphor-icons/react/ssr";
import type { MusicPlayer } from "../../services/music-licenses";
import { shopPath, softwarePath } from "./copy";
import { accountCopy } from "./copy-account";
import { dmiCopy } from "./copy-dmi";

/**
 * Shared building blocks for the "My DMI" pages (server components). Status is always
 * spelled out in text with an icon, never carried by color alone.
 */

export const card = "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 lg:rounded-3xl";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950";
export const textLink =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-950";
export const eyebrow = "text-xs font-medium uppercase tracking-wider text-neutral-500";

export const playerPath = (lang: string, playerId: string, sub = "") => shopPath(lang, `/account/players/${playerId}${sub}`);
export const addMusicHref = (lang: string, playerId: string) => `${shopPath(lang, "/browse")}?player=${encodeURIComponent(playerId)}`;
export const helpLicensingPath = (lang: string, hash = "") => `${shopPath(lang, "/help/music-licensing")}${hash}`;
export const supportNewHref = (lang: string, q: Record<string, string | undefined>) => {
  const qs = new URLSearchParams(Object.entries(q).filter((e): e is [string, string] => Boolean(e[1]))).toString();
  return `${shopPath(lang, "/account/support/new")}${qs ? `?${qs}` : ""}`;
};

const STATUS_ICON = { ACTIVE: CheckCircle, PENDING: Clock, SUSPENDED: PauseCircle, RETIRED: Archive } as const;

export function PlayerStatusBadge({ lang, status, className }: { lang: string; status: string; className?: string }) {
  const t = accountCopy(lang);
  const Icon = STATUS_ICON[status as keyof typeof STATUS_ICON] ?? Question;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        status === "ACTIVE" ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-700",
        className,
      )}
    >
      <Icon size={14} weight="bold" aria-hidden />
      {t.playerStatus[status] ?? t.playerStatus.PENDING}
    </span>
  );
}

export function MusicStatusBadge({ lang, status }: { lang: string; status: string }) {
  const t = accountCopy(lang);
  const live = status === "ACTIVE";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        live ? "bg-neutral-100 text-neutral-800" : "bg-neutral-200 text-neutral-700",
      )}
    >
      {live ? <CheckCircle size={13} weight="bold" aria-hidden /> : <Clock size={13} weight="bold" aria-hidden />}
      {t.musicStatus[status] ?? t.musicStatus.ACTIVE}
    </span>
  );
}

/** "Virtual Orchestrion: Licensed" with an icon. Separate from music licenses on purpose. */
export function SoftwareLine({ lang, player }: { lang: string; player: MusicPlayer }) {
  const t = accountCopy(lang);
  if (!player.softwareProduct) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      {player.softwareLicensed ? (
        <CheckCircle size={16} weight="bold" className="shrink-0 text-neutral-900" aria-hidden />
      ) : (
        <MinusCircle size={16} weight="bold" className="shrink-0 text-neutral-400" aria-hidden />
      )}
      {player.softwareLicensed ? t.softwareLicensed(player.softwareProduct.name) : t.softwareNotLicensed(player.softwareProduct.name)}
    </span>
  );
}

export function PlayerIcon({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800", className)}>
      <PianoKeys size={22} aria-hidden />
    </span>
  );
}

/** Status as a dot + word: calm, readable, never color alone. */
export function PlayerStatusDot({ lang, status }: { lang: string; status: string }) {
  const t = dmiCopy(lang);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600">
      <span aria-hidden className={clsx("h-2 w-2 rounded-full", status === "ACTIVE" ? "bg-emerald-500" : status === "RETIRED" ? "bg-neutral-300" : "bg-amber-500")} />
      {t.status[status] ?? status}
    </span>
  );
}

/**
 * One player (= DMI player software on a computer) on My DMI and the players list. Name
 * first, how much music it has, and the one thing people come for: add music to it.
 */
export function PlayerCard({ lang, player, musicCount }: { lang: string; player: MusicPlayer; musicCount: number }) {
  const t = accountCopy(lang);
  const d = dmiCopy(lang);
  const canAdd = player.eligible && player.supportsMusicLibrary;
  return (
    <article className="group relative flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-neutral-300 hover:shadow-md has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-neutral-950 sm:p-8">
      <div className="flex items-start gap-4">
        <PlayerIcon />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h3 className="min-w-0 truncate font-display text-2xl font-bold text-neutral-950">
              <Link href={playerPath(lang, player.id)} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none">
                {player.name}
              </Link>
            </h3>
            <PlayerStatusDot lang={lang} status={player.status} />
          </div>
          <p className="mt-1 truncate text-sm text-neutral-500">
            {player.friendlyName ? `${player.typeName} · ` : ""}{t.registration(player.maskedRegistration)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <p>
          <span className="block font-display text-5xl font-bold leading-none tracking-tight text-neutral-950 tabular-nums">{musicCount}</span>
          <span className="mt-2 block text-sm text-neutral-500">{d.songsWord(musicCount)}</span>
        </p>
        <div className="relative z-10 flex flex-wrap gap-2">
          {canAdd && (
            <Link href={addMusicHref(lang, player.id)} className={btnPrimary}>
              <Plus size={14} weight="bold" aria-hidden />
              {d.addMusic}
            </Link>
          )}
          <Link href={playerPath(lang, player.id)} className={btnSecondary}>
            {d.open}
            <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
        </div>
      </div>
      {player.status === "SUSPENDED" && <p className="mt-5 text-sm text-neutral-500">{d.pausedNote}</p>}
      {!player.friendlyName && player.status === "ACTIVE" && (
        <Link href={`${playerPath(lang, player.id)}#name`} className="relative z-10 mt-5 self-start text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950">
          {d.nameIt}
        </Link>
      )}
    </article>
  );
}

/** Dashed tile after the players: how to get another one (install + activate Virtual Orchestrion). */
export function AddPlayerTile({ lang, className }: { lang: string; className?: string }) {
  const d = dmiCopy(lang);
  return (
    <div className={clsx("flex h-full flex-col justify-between rounded-3xl border border-dashed border-neutral-300 p-6 sm:p-8", className)}>
      <div>
        <p className="font-display text-xl font-bold text-neutral-950">{d.addPlayerTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{d.addPlayerBody}</p>
      </div>
      <Link href={softwarePath(lang)} className={clsx(textLink, "mt-6 self-start")}>
        <DownloadSimple size={14} weight="bold" aria-hidden />
        {d.addPlayerCta}
      </Link>
    </div>
  );
}

/** §76: no registered player yet. One primary action (download), one way to learn more. */
export function NoPlayersState({ lang, className }: { lang: string; className?: string }) {
  const t = accountCopy(lang);
  return (
    <div className={clsx("rounded-3xl border border-dashed border-neutral-300 px-6 py-14 text-center sm:py-20", className)}>
      <PlayerIcon className="mx-auto" />
      <p className="mx-auto mt-5 max-w-md font-display text-xl font-bold text-neutral-950">{t.noPlayersTitle}</p>
      <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.noPlayersBody}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href={softwarePath(lang)} className={btnPrimary}>
          <DownloadSimple size={16} weight="bold" aria-hidden />
          {t.downloadPlayer}
        </Link>
        <Link href={helpLicensingPath(lang, "#registration")} className={btnSecondary}>
          {t.learnRegistration}
        </Link>
      </div>
    </div>
  );
}

/** Server-side search box: a plain GET form, so it works without JavaScript. */
export function SearchBox({
  lang,
  action,
  q,
  placeholder,
  hidden = {},
}: {
  lang: string;
  action: string;
  q: string;
  placeholder: string;
  hidden?: Record<string, string>;
}) {
  const t = accountCopy(lang);
  return (
    <form action={action} method="get" role="search" className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <label htmlFor="library-q" className="sr-only">{t.searchLabel}</label>
      <input
        id="library-q"
        name="q"
        type="search"
        defaultValue={q}
        placeholder={placeholder}
        maxLength={100}
        className="w-full rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-500 focus:border-neutral-950 focus:outline-none sm:max-w-sm"
      />
      <div className="flex items-center gap-3">
        <button type="submit" className={btnPrimary}>{t.search}</button>
        {q && (
          <Link href={`${action}${Object.keys(hidden).length ? `?${new URLSearchParams(hidden)}` : ""}`} className={textLink}>
            {t.clearSearch}
          </Link>
        )}
      </div>
    </form>
  );
}

export function Pager({ lang, page, pages, href }: { lang: string; page: number; pages: number; href: (page: number) => string }) {
  const t = accountCopy(lang);
  if (pages <= 1) return null;
  return (
    <nav aria-label={t.pagination} className="mt-8 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btnSecondary} rel="prev">
          <CaretLeft size={14} weight="bold" aria-hidden />
          {t.previous}
        </Link>
      ) : <span />}
      <span className="tabular-nums text-neutral-600">{t.pageOf(page, pages)}</span>
      {page < pages ? (
        <Link href={href(page + 1)} className={btnSecondary} rel="next">
          {t.next}
          <CaretRight size={14} weight="bold" aria-hidden />
        </Link>
      ) : <span />}
    </nav>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-950">
      <CaretLeft size={14} weight="bold" aria-hidden />
      {label}
    </Link>
  );
}
