"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle, Key } from "@phosphor-icons/react";
import { apiFetch } from "../api";
import { useCart } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";
import { playerCopy, playerLinks } from "./copy-player";
import { accountSoftwarePath } from "./software/links";

/** A software license line of the order: the customer still has to activate it. */
export type OrderSoftwareLine = { name: string; slug: string };

/** A music line of the order with the player it was bought for (snapshot at purchase). */
export type OrderMusicLine = {
  id: string;
  title: string;
  playerId: string | null;
  playerName: string | null;
  maskedRegistration: string | null;
};

type Status = { status: string; fulfilled: boolean; orderNumber: string };

/**
 * Polls the server's view of the order. It never fulfills anything: entitlements are
 * granted by the Stripe webhook, this page only reflects that.
 */
export function OrderStatus({ lang, orderId, initial, redirectStatus, software = [], hasMusic = true, music = [] }: {
  lang: string;
  orderId: string;
  initial: Status;
  redirectStatus: string | null;
  software?: OrderSoftwareLine[];
  hasMusic?: boolean;
  music?: OrderMusicLine[];
}) {
  const t = shopCopy(lang);
  const tp = playerCopy(lang);
  const targetIds = [...new Set(music.map((m) => m.playerId))];
  const onlyPlayer = targetIds.length === 1 && targetIds[0] ? music[0]! : null;
  const { refresh } = useCart();
  const [s, setS] = useState(initial);
  const [slow, setSlow] = useState(false);
  const failed = redirectStatus === "failed" || s.status === "FAILED" || s.status === "CANCELED";

  useEffect(() => {
    if (s.fulfilled || failed) {
      if (s.fulfilled) void refresh();
      return;
    }
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        setSlow(true);
        clearInterval(timer);
        return;
      }
      try {
        const next = await apiFetch<Status>(`/api/shop/orders/${orderId}`);
        setS(next);
        if (next.fulfilled) clearInterval(timer);
      } catch {
        // keep polling
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [orderId, s.fulfilled, failed, refresh]);

  if (failed) {
    return (
      <div className="max-w-xl">
        <p className="text-lg text-neutral-700">{t.completeFailed}</p>
        <Link href={shopPath(lang, "/cart")} className="mt-8 inline-block rounded-full border-2 border-neutral-950 px-8 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white">
          {t.backToCart}
        </Link>
      </div>
    );
  }

  const softwareOnly = !hasMusic && software.length > 0;

  return (
    <div className="max-w-xl" aria-live="polite">
      {s.fulfilled ? (
        hasMusic && (
          <div className="flex items-start gap-3">
            <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-neutral-950" aria-hidden />
            <p className="text-lg text-neutral-700">{tp.completeDone}</p>
          </div>
        )
      ) : (
        <div>
          <p className="text-lg text-neutral-700">
            {softwareOnly ? (slow ? t.sw.completeSlow : t.sw.completePending) : slow ? t.completeSlow : tp.completePending}
          </p>
          {!slow && <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-neutral-200"><div className="h-full w-1/3 animate-pulse rounded-full bg-neutral-950" /></div>}
        </div>
      )}

      {music.length > 0 && (
        <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
          {music.map((m) => (
            <li key={m.id} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="font-medium text-neutral-950">{m.title}</span>
              <span className="text-sm text-neutral-600">
                {m.playerName ? (
                  <>
                    {tp.forLabel}: <span className="font-semibold text-neutral-950">{m.playerName}</span>
                    {m.maskedRegistration && <span className="text-neutral-500"> · {m.maskedRegistration}</span>}
                  </>
                ) : tp.assignLater}
              </span>
            </li>
          ))}
        </ul>
      )}

      {s.fulfilled && software.map((p) => (
        <div key={p.slug} className={hasMusic ? "mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8" : "mt-2"}>
          <div className="flex items-start gap-3">
            <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-neutral-950" aria-hidden />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-neutral-950">{t.sw.purchasedTitle(p.name)}</p>
              <p className="mt-1 text-lg text-neutral-700">{t.sw.oneMoreStep}</p>
            </div>
          </div>
          <ol className="mt-6 flex flex-col gap-3">
            {t.sw.purchaseSteps(p.name).map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-neutral-800">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-950">{i + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-neutral-600">{t.sw.stillTrial}</p>
          <Link
            href={`${accountSoftwarePath(lang, p.slug)}#activate`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-800"
          >
            <Key size={18} weight="bold" aria-hidden />
            {t.sw.enterRegistrationCode}
          </Link>
          <p className="mt-4 text-sm text-neutral-500">{t.sw.doItLater}</p>
        </div>
      ))}

      <p className="mt-4 text-sm text-neutral-500">{s.orderNumber}</p>
      {hasMusic ? (
        <Link
          href={onlyPlayer?.playerId ? playerLinks.playerMusic(lang, onlyPlayer.playerId) : playerLinks.myMusic(lang)}
          className="mt-10 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-800"
        >
          {onlyPlayer?.playerName ? tp.openPlayerMusic(onlyPlayer.playerName) : tp.goToMyMusic}
        </Link>
      ) : (
        !s.fulfilled && (
          <Link href={accountSoftwarePath(lang)} className="mt-10 inline-block rounded-full border-2 border-neutral-950 px-8 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white">
            {t.sw.goToMySoftware}
          </Link>
        )
      )}
    </div>
  );
}
