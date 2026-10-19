import Link from "next/link";
import { ArrowRight, Check, Key } from "@phosphor-icons/react/ssr";
import type { PlayerJourneyStage, PlayerProduct } from "../../services/player-products";
import { formatMoney } from "../format";
import { AddToCartButton } from "./AddToCartButton";
import { softwarePath } from "./copy";
import { dmiCopy } from "./copy-dmi";
import { playerLinks } from "./copy-player";
import { accountSoftwarePath } from "./software/links";
import { SoftwareIcon } from "./software/SoftwareIcon";

const linkClass = "font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-950";

function Price({ cents, currency, lang }: { cents: number; currency: string; lang: string }) {
  return <p className="font-display text-4xl font-bold tracking-tight text-neutral-950">{formatMoney(cents, currency, lang)}</p>;
}

/** Signed out: the price, one sentence on player licensing, sign in. */
export function SignedOutPurchase({ lang, priceCents, currency, returnTo }: { lang: string; priceCents: number; currency: string; returnTo: string }) {
  const t = dmiCopy(lang);
  return (
    <div className="mt-8">
      <Price cents={priceCents} currency={currency} lang={lang} />
      <div className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
        <p className="font-semibold text-neutral-950">{t.signInTitle}</p>
        <p className="mt-1 text-sm text-neutral-600">{t.signInBody}</p>
        {/* Full navigation: Auth0 routes are served by the proxy, not the client router. */}
        <a
          href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
          className="mt-5 inline-flex rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white transition hover:bg-neutral-800"
        >
          {t.signInTitle}
        </a>
        <p className="mt-4 text-sm"><Link href={playerLinks.help(lang)} className={linkClass}>{t.howItWorks}</Link></p>
      </div>
    </div>
  );
}

/**
 * Signed in without a player. Music plays on the player software, so the panel shows that
 * program and the one next step on the way to it: buy it, activate it, or wait for DMI.
 * "Buy now, choose the player later" only when the policy allows it.
 */
export function NoPlayerPurchase({ lang, priceCents, currency, item, alreadyBought, assignLaterAllowed, journey }: {
  lang: string;
  priceCents: number;
  currency: string;
  item: { type: "ARRANGEMENT"; arrangementId: string } | { type: "BUNDLE"; bundleId: string };
  alreadyBought: boolean;
  assignLaterAllowed: boolean;
  journey: { product: PlayerProduct; stage: PlayerJourneyStage } | null;
}) {
  const t = dmiCopy(lang);
  const name = journey?.product.name ?? "Virtual Orchestrion";
  const stage = journey?.stage ?? "buy";
  const productHref = journey ? softwarePath(lang, `/${journey.product.slug}`) : softwarePath(lang);
  const accountHref = journey ? accountSoftwarePath(lang, journey.product.slug) : accountSoftwarePath(lang);
  const title = stage === "activate" ? t.activateTitle(name) : stage === "activating" ? t.activatingTitle(name) : stage === "paused" ? t.pausedTitle(name) : t.needsPlayerTitle(name);
  const body = stage === "activate" ? t.activateBody : stage === "activating" ? t.activatingBody : stage === "paused" ? t.pausedBody : t.needsPlayerBody(name);

  return (
    <div className="mt-8">
      <Price cents={priceCents} currency={currency} lang={lang} />
      {alreadyBought ? (
        <p className="mt-6 flex items-start gap-2 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 text-neutral-800">
          <Check size={18} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-neutral-950" />
          {t.boughtForLater}
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50">
          <div className="flex items-start gap-4 p-6">
            <SoftwareIcon src={journey?.product.iconUrl ?? null} />
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-neutral-950">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{body}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-neutral-200 bg-white px-6 py-4">
            {stage === "buy" && (
              <>
                <Link href={productHref} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
                  {t.getPlayer(name)}
                  <ArrowRight size={14} weight="bold" aria-hidden />
                </Link>
                {journey?.product.priceCents != null && (
                  <span className="text-sm text-neutral-500">{formatMoney(journey.product.priceCents, journey.product.currency, lang)}</span>
                )}
              </>
            )}
            {stage === "activate" && (
              <Link href={`${accountHref}#activate`} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800">
                <Key size={14} weight="bold" aria-hidden />
                {t.enterCode}
              </Link>
            )}
            {(stage === "activating" || stage === "paused") && (
              <Link href={accountHref} className={linkClass}>{t.licenseAndKey}</Link>
            )}
            <Link href={playerLinks.help(lang)} className="text-sm text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950">{t.howItWorks}</Link>
          </div>
          {assignLaterAllowed && (
            <div className="border-t border-neutral-200 bg-white px-6 py-4">
              <AddToCartButton lang={lang} item={item} targetPlayerId={null} label={t.buyNowLater} variant="secondary" size="sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LicenseNote({ lang }: { lang: string }) {
  const t = dmiCopy(lang);
  return (
    <p className="mt-5 max-w-md text-sm text-neutral-500">
      {t.licenseNote} <Link href={playerLinks.help(lang)} className={linkClass}>{t.howItWorks}</Link>
    </p>
  );
}
