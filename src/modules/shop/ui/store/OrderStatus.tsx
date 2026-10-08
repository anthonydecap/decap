"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { apiFetch } from "../api";
import { useCart } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";

type Status = { status: string; fulfilled: boolean; orderNumber: string };

/**
 * Polls the server's view of the order. It never fulfills anything: entitlements are
 * granted by the Stripe webhook, this page only reflects that.
 */
export function OrderStatus({ lang, orderId, initial, redirectStatus }: {
  lang: string;
  orderId: string;
  initial: Status;
  redirectStatus: string | null;
}) {
  const t = shopCopy(lang);
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

  return (
    <div className="max-w-xl" aria-live="polite">
      {s.fulfilled ? (
        <div className="flex items-start gap-3">
          <CheckCircle size={28} weight="fill" className="mt-0.5 shrink-0 text-neutral-950" aria-hidden />
          <p className="text-lg text-neutral-700">{t.completeDone}</p>
        </div>
      ) : (
        <div>
          <p className="text-lg text-neutral-700">{slow ? t.completeSlow : t.completePending}</p>
          {!slow && <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-neutral-200"><div className="h-full w-1/3 animate-pulse rounded-full bg-neutral-950" /></div>}
        </div>
      )}
      <p className="mt-4 text-sm text-neutral-500">{s.orderNumber}</p>
      <Link href={shopPath(lang, "/account/library")} className="mt-10 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-800">
        {t.goToLibrary}
      </Link>
    </div>
  );
}
