import clsx from "clsx";
import Link from "next/link";
import { ArrowRight, ChatCircleText, CheckCircle, Circle, DownloadSimple, Key, MusicNotes, Plus } from "@phosphor-icons/react/ssr";
import type { CustomerSoftwareStatus } from "../../domain/software-status";
import type { MusicPlayer } from "../../services/music-licenses";
import { formatMoney } from "../format";
import { addMusicHref, btnPrimary, btnSecondary, playerPath, PlayerStatusDot, textLink } from "./account-ui";
import { shopCopy } from "./copy";
import { dmiCopy } from "./copy-dmi";
import { BuyLicenseButton } from "./software/BuyLicenseButton";
import { accountSoftwarePath, softwareDownloadHref, supportForSoftwareHref } from "./software/links";
import { SoftwareIcon } from "./software/SoftwareIcon";

export type DmiSoftwareItem = {
  product: {
    id: string;
    slug: string;
    name: string;
    shortDescription: string | null;
    iconUrl: string | null;
    licensePriceCents: number | null;
    currency: string;
    currentVersion: string | null;
  };
  /** NOT_OWNED: a player product the customer has not touched yet (shown to guide them). */
  status: CustomerSoftwareStatus | "NOT_OWNED";
  isPlayer: boolean;
  players: { player: MusicPlayer; musicCount: number }[];
};

const NO_LICENSE = new Set(["NOT_OWNED", "NOT_DOWNLOADED", "DOWNLOADED", "TRIAL"]);
type Step = "buy" | "install" | "activate" | "music";

/**
 * One program on My DMI. Every program is bought and activated the same way; a player
 * program additionally lists the computers it is activated on, each a player with its own
 * music. Until the first player exists, the card shows the short road to get there.
 */
export function SoftwareCard({ lang, item }: { lang: string; item: DmiSoftwareItem }) {
  const t = dmiCopy(lang);
  const sw = shopCopy(lang).sw;
  const { product: p, status, isPlayer } = item;
  const detail = accountSoftwarePath(lang, p.slug);
  const livePlayers = item.players.filter((x) => x.player.status !== "RETIRED");
  const hasLicense = !NO_LICENSE.has(status);
  const forSale = p.licensePriceCents != null && p.licensePriceCents > 0;
  const statusLabel = status === "NOT_OWNED" ? t.notOwnedYet : sw.statuses[status]?.label ?? "";

  return (
    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div className="flex min-w-0 items-start gap-4">
          <SoftwareIcon src={p.iconUrl} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 className="font-display text-2xl font-bold text-neutral-950">
                <Link href={detail} className="hover:underline hover:decoration-neutral-300 hover:underline-offset-4">{p.name}</Link>
              </h3>
              {isPlayer && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-2.5 py-0.5 text-xs font-semibold text-white">
                  <MusicNotes size={12} weight="bold" aria-hidden />
                  {t.isPlayerTag}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              {statusLabel}
              {isPlayer && livePlayers.length > 0 && <> · {t.computers(livePlayers.length)}</>}
            </p>
            {isPlayer && livePlayers.length === 0 && <p className="mt-3 max-w-md text-sm text-neutral-600">{t.isPlayerHint}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {p.currentVersion && (
            // Plain navigation: the download route signs a short-lived URL.
            <a href={softwareDownloadHref(p.slug, lang, "account")} className={btnSecondary}>
              <DownloadSimple size={14} weight="bold" aria-hidden />
              {t.download}
            </a>
          )}
          {hasLicense && (
            <Link href={detail} className={btnSecondary}>
              <Key size={14} weight="bold" aria-hidden />
              {t.licenseAndKey}
            </Link>
          )}
          {!isPlayer && !hasLicense && forSale && (
            <BuyLicenseButton lang={lang} productId={p.id} size="sm" variant="primary" label={t.buyLicenseFor(formatMoney(p.licensePriceCents!, p.currency, lang))} />
          )}
        </div>
      </div>

      {isPlayer && livePlayers.length > 0 && (
        <ul className="border-t border-neutral-200 bg-neutral-50/60">
          {livePlayers.map(({ player, musicCount }) => (
            <li key={player.id} className="flex flex-col gap-4 border-b border-neutral-200 px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <Link href={playerPath(lang, player.id)} className="group min-w-0">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="truncate font-display text-lg font-bold text-neutral-950 group-hover:underline group-hover:decoration-neutral-300 group-hover:underline-offset-4">{player.name}</span>
                  <PlayerStatusDot lang={lang} status={player.status} />
                </span>
                <span className="mt-0.5 block text-sm text-neutral-500">
                  {musicCount === 0 ? t.noSongsYet : t.songs(musicCount)} · {player.maskedRegistration}
                </span>
              </Link>
              <span className="flex shrink-0 flex-wrap gap-2">
                {player.eligible && (
                  <Link href={addMusicHref(lang, player.id)} className={btnPrimary}>
                    <Plus size={14} weight="bold" aria-hidden />
                    {t.addMusic}
                  </Link>
                )}
                <Link href={playerPath(lang, player.id)} className={btnSecondary}>
                  {t.open}
                  <ArrowRight size={14} weight="bold" aria-hidden />
                </Link>
              </span>
            </li>
          ))}
        </ul>
      )}

      {isPlayer && livePlayers.length === 0 && <PlayerJourney lang={lang} item={item} />}

      {!isPlayer && (status === "REGISTRATION_CODE_NEEDED" || status === "ATTENTION" || status === "ACTION_REQUIRED") && (
        <div className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-4 sm:px-8">
          <Link href={`${detail}#activate`} className={textLink}>
            {status === "ACTION_REQUIRED" ? t.replyToDmi : t.enterCode}
            <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
        </div>
      )}
    </article>
  );
}

/** Buy, install, activate, add music: where the customer is and the one thing to do next. */
function PlayerJourney({ lang, item }: { lang: string; item: DmiSoftwareItem }) {
  const t = dmiCopy(lang);
  const { product: p, status } = item;
  const detail = accountSoftwarePath(lang, p.slug);
  const current: Step = NO_LICENSE.has(status) ? "buy" : "activate";
  const order: Step[] = ["buy", "install", "activate", "music"];
  const at = order.indexOf(current);
  const labels: Record<Step, string> = { buy: t.stepBuy, install: t.stepInstall, activate: t.stepActivate, music: t.stepMusic };
  const forSale = p.licensePriceCents != null && p.licensePriceCents > 0;

  let action: React.ReactNode = null;
  if (current === "buy") {
    action = (
      <div className="flex flex-wrap items-center gap-4">
        {forSale && <BuyLicenseButton lang={lang} productId={p.id} variant="primary" size="sm" label={t.buyLicenseFor(formatMoney(p.licensePriceCents!, p.currency, lang))} />}
        {p.currentVersion && (
          <a href={softwareDownloadHref(p.slug, lang, "account")} className={textLink}>{t.tryFirst}</a>
        )}
      </div>
    );
  } else if (status === "REGISTRATION_CODE_NEEDED" || status === "ATTENTION") {
    action = (
      <Link href={`${detail}#activate`} className={btnPrimary}>
        <Key size={14} weight="bold" aria-hidden />
        {t.enterCode}
      </Link>
    );
  } else if (status === "ACTION_REQUIRED") {
    action = (
      <Link href={`${detail}#activate`} className={btnPrimary}>
        <ChatCircleText size={14} weight="bold" aria-hidden />
        {t.replyToDmi}
      </Link>
    );
  } else if (status === "SUSPENDED") {
    action = (
      <p className="text-sm text-neutral-600">
        {t.pausedLicense} <Link href={supportForSoftwareHref(lang, { software: p.id })} className={textLink}>{shopCopy(lang).sw.contactSupport}</Link>
      </p>
    );
  } else {
    action = <p className="text-sm text-neutral-600">{t.activatingNow}</p>;
  }

  return (
    <div className="border-t border-neutral-200 bg-neutral-50/60 px-6 py-6 sm:px-8">
      <p className="text-sm text-neutral-600">{t.journeyIntro(p.name)}</p>
      <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {order.map((step, i) => {
          const done = i < at;
          const now = i === at;
          return (
            <li key={step} className="flex items-center gap-2 text-sm" aria-current={now ? "step" : undefined}>
              {done ? (
                <CheckCircle size={20} weight="fill" aria-hidden className="shrink-0 text-neutral-950" />
              ) : (
                <Circle size={20} weight={now ? "bold" : "regular"} aria-hidden className={clsx("shrink-0", now ? "text-neutral-950" : "text-neutral-300")} />
              )}
              <span className={clsx(now ? "font-semibold text-neutral-950" : done ? "text-neutral-700" : "text-neutral-500")}>
                {labels[step]}
                {done && <span className="sr-only"> ({t.stepDone})</span>}
                {now && <span className="sr-only"> ({t.stepNow})</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-6">{action}</div>
    </div>
  );
}
