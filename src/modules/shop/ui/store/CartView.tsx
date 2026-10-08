"use client";

import Link from "next/link";
import { useState } from "react";
import { errorMessage } from "../api";
import { formatMoney } from "../format";
import { useCart } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";

export function CartView({ lang, signedIn }: { lang: string; signedIn: boolean }) {
  const t = shopCopy(lang);
  // The provider already loads the cart; notices it collected stay visible for this visit.
  const { cart, loading, remove, removedNotices: removed, priceNotices } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const money = (c: number) => formatMoney(c, cart?.pricing.currency ?? "EUR", lang);

  if (loading && !cart) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        {[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />)}
      </div>
    );
  }

  const lines = cart?.pricing.lines ?? [];
  const covered = (cart?.pricing.excluded ?? []).filter((e) => !e.removeFromCart);
  const partial = (cart?.pricing.notices ?? []).filter((n) => n.code === "PARTIALLY_OWNED");

  const notices = (
    <>
      {removed.map((r) => (
        <p key={r.cartItemId} role="status" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          <span className="font-medium text-neutral-950">{r.title}.</span>{" "}
          {r.reason === "ALREADY_OWNED" ? t.removedOwned : t.removedUnavailable}
        </p>
      ))}
      {priceNotices.map((n) => (
        <p key={`p-${n.cartItemId}`} role="status" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm text-neutral-950">
          <span className="font-medium">{n.title}.</span> {t.priceChanged(money(n.previousCents), money(n.currentCents))}
        </p>
      ))}
    </>
  );

  if (lines.length === 0 && covered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {notices}
        <div className="rounded-3xl border border-dashed border-neutral-300 px-6 py-20 text-center">
          <p className="font-display text-xl font-bold text-neutral-950">{t.cartEmpty}</p>
          <p className="mx-auto mt-2 max-w-md text-neutral-600">{t.cartEmptyBody}</p>
          <Link href={shopPath(lang, "/browse")} className="mt-8 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800">
            {t.browseCatalog}
          </Link>
        </div>
      </div>
    );
  }

  const onRemove = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await remove(id);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {notices}
        {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {lines.map((l) => {
            const p = partial.find((n) => n.cartItemId === l.cartItemId);
            return (
              <li key={l.cartItemId} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-neutral-950">{l.title}</p>
                  {l.bundle ? (
                    <>
                      <p className="mt-1 text-sm text-neutral-600">{t.collectionLine(l.allocations.length, l.bundle.itemCount)}</p>
                      {p && p.code === "PARTIALLY_OWNED" && <p className="mt-1 text-sm text-neutral-600">{t.partiallyOwned(p.ownedCount, p.itemCount)}</p>}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-500">SKU {l.sku}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(l.cartItemId)}
                    disabled={busyId === l.cartItemId}
                    className="mt-3 text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950 disabled:opacity-50"
                  >
                    {t.remove}
                  </button>
                </div>
                <div className="text-left sm:text-right">
                  {l.retailValueCents > l.chargedCents && (
                    <p className="text-sm text-neutral-500 line-through">{money(l.retailValueCents)}</p>
                  )}
                  <p className="text-lg font-semibold text-neutral-950">{money(l.chargedCents)}</p>
                </div>
              </li>
            );
          })}
          {covered.map((c) => (
            <li key={c.cartItemId} className="flex items-start justify-between gap-4 py-5">
              <div>
                <p className="font-medium text-neutral-950">{c.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{t.includedInBundle(c.coveredByBundleTitle ?? t.collections)}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(c.cartItemId)}
                disabled={busyId === c.cartItemId}
                className="shrink-0 text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950 disabled:opacity-50"
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="lg:col-span-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 sm:p-8">
          <h2 className="font-display text-lg font-bold text-neutral-950">{t.orderSummary}</h2>
          <dl className="mt-6 flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><dt className="text-neutral-600">{t.subtotal}</dt><dd className="text-neutral-950">{money(cart!.pricing.retailTotalCents)}</dd></div>
            {cart!.pricing.discountCents > 0 && (
              <div className="flex justify-between"><dt className="text-neutral-600">{t.savings}</dt><dd className="text-neutral-950">-{money(cart!.pricing.discountCents)}</dd></div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-4 text-base">
              <dt className="font-semibold text-neutral-950">{t.total}</dt>
              <dd className="font-display text-xl font-bold text-neutral-950">{money(cart!.pricing.totalCents)}</dd>
            </div>
          </dl>
          {lines.length > 0 && (signedIn ? (
            <Link href={shopPath(lang, "/checkout")} className="mt-8 block rounded-full bg-neutral-950 px-8 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-neutral-800">
              {t.checkout}
            </Link>
          ) : (
            <a href={`/auth/login?returnTo=${encodeURIComponent(shopPath(lang, "/checkout"))}`} className="mt-8 block rounded-full bg-neutral-950 px-8 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-neutral-800">
              {t.signInToCheckout}
            </a>
          ))}
          <p className="mt-4 text-xs text-neutral-500">{t.vatNote}</p>
        </div>
      </aside>
    </div>
  );
}
