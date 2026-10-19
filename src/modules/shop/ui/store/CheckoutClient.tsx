"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CartPricingResult, ExcludedLine, PricedLine } from "../../domain/cart-pricing";
import { apiFetch, ApiError, errorMessage } from "../api";
import { formatMoney } from "../format";
import type { CartPlayer } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";
import { playerCopy } from "./copy-player";

type Prepared = { orderId: string; orderNumber: string; clientSecret: string; pricing: CartPricingResult; free?: boolean };

let stripePromise: Promise<Stripe | null> | null = null;
const getStripe = (key: string) => (stripePromise ??= loadStripe(key));

/**
 * Embedded checkout: the server reprices the cart and creates the PaymentIntent; the Payment
 * Element collects payment. Success here only navigates; the webhook fulfills.
 */
export function CheckoutClient({ lang, publishableKey, testMode, players = [] }: {
  lang: string;
  publishableKey: string;
  testMode: boolean;
  /** The customer's players, to name the target of each license. */
  players?: CartPlayer[];
}) {
  const t = shopCopy(lang);
  const tp = playerCopy(lang);
  const router = useRouter();
  const [prepared, setPrepared] = useState<Prepared | null>(null);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    apiFetch<Prepared>("/api/shop/checkout/prepare", { method: "POST", body: {} })
      .then((p) => {
        setPrepared(p);
        // Nothing to pay: the order is already fulfilled on the server.
        if (p.free) router.replace(shopPath(lang, `/checkout/complete?order=${p.orderId}`));
      })
      .catch((e) => {
        const code = e instanceof ApiError ? e.code : undefined;
        setError({ message: code === "PLAYER_REQUIRED" ? tp.playerRequiredError : errorMessage(e), code });
      });
  }, [lang, router, tp.playerRequiredError]);

  const options = useMemo(
    () =>
      prepared
        ? {
            clientSecret: prepared.clientSecret,
            appearance: {
              theme: "stripe" as const,
              variables: {
                colorPrimary: "#0a0a0a",
                colorText: "#0a0a0a",
                colorTextSecondary: "#525252",
                colorDanger: "#0a0a0a",
                borderRadius: "12px",
                fontFamily: "ui-sans-serif, system-ui, sans-serif",
              },
            },
          }
        : null,
    [prepared],
  );

  if (error) {
    return (
      <div className="rounded-2xl border border-neutral-950 p-6">
        <p role="alert" className="font-medium text-neutral-950">{error.message}</p>
        <Link href={shopPath(lang, "/cart")} className="mt-6 inline-block rounded-full border-2 border-neutral-950 px-6 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white">
          {t.backToCart}
        </Link>
      </div>
    );
  }

  if (prepared?.free) {
    return <p role="status" className="text-lg text-neutral-700">{tp.freeOrder}…</p>;
  }

  if (!prepared || !options) {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12" aria-busy="true">
        <div className="lg:col-span-7"><div className="h-80 animate-pulse rounded-2xl bg-neutral-100" /></div>
        <div className="lg:col-span-5"><div className="h-56 animate-pulse rounded-2xl bg-neutral-100" /></div>
        <p className="sr-only">{t.preparing}</p>
      </div>
    );
  }

  const money = (c: number) => formatMoney(c, prepared.pricing.currency, lang);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h2 className="font-display text-xl font-bold text-neutral-950">{t.payment}</h2>
        {testMode && <p className="mt-2 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">{t.testMode}</p>}
        <div className="mt-6">
          <Elements stripe={getStripe(publishableKey)} options={options}>
            <PaymentForm lang={lang} orderId={prepared.orderId} amountLabel={money(prepared.pricing.totalCents)} />
          </Elements>
        </div>
      </div>
      <aside className="lg:col-span-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-lg font-bold text-neutral-950">{t.orderSummary}</h2>
          <p className="mt-1 text-sm text-neutral-500">{prepared.orderNumber}</p>
          <OrderSummaryGroups lang={lang} pricing={prepared.pricing} players={players} money={money} />
          <dl className="mt-6 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
            {prepared.pricing.discountCents > 0 && (
              <div className="flex justify-between"><dt className="text-neutral-600">{t.savings}</dt><dd className="tabular-nums">-{money(prepared.pricing.discountCents)}</dd></div>
            )}
            <div className="flex justify-between text-base">
              <dt className="font-semibold text-neutral-950">{t.total}</dt>
              <dd className="font-display text-xl font-bold text-neutral-950">{money(prepared.pricing.totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-neutral-500">{t.vatNote}</p>
        </div>
      </aside>
    </div>
  );
}

function PaymentForm({ lang, orderId, amountLabel }: { lang: string; orderId: string; amountLabel: string }) {
  const t = shopCopy(lang);
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const completeUrl = shopPath(lang, `/checkout/complete?order=${orderId}`);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setBusy(true);
        setMessage(null);
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          redirect: "if_required",
          confirmParams: { return_url: `${window.location.origin}${completeUrl}` },
        });
        if (error) {
          setMessage(error.message ?? t.completeFailed);
          setBusy(false);
          return;
        }
        // Navigating only; fulfillment happens in the Stripe webhook.
        router.push(`${completeUrl}&payment_intent=${paymentIntent?.id ?? ""}`);
      }}
    >
      <PaymentElement options={{ layout: "tabs" }} />
      {message && <p role="alert" className="mt-4 text-sm font-medium text-neutral-950">{message}</p>}
      <button
        type="submit"
        disabled={!stripe || busy}
        className="mt-8 w-full rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-neutral-800 active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? `${t.processing}…` : t.pay(amountLabel)}
      </button>
    </form>
  );
}

/**
 * "No checkout surprises": which player receives each license, additional-player prices,
 * and what is not charged because that player already has it.
 */
function OrderSummaryGroups({ lang, pricing, players, money }: {
  lang: string;
  pricing: CartPricingResult;
  players: CartPlayer[];
  money: (c: number) => string;
}) {
  const t = shopCopy(lang);
  const tp = playerCopy(lang);
  const nameOf = (id: string | null | undefined) => players.find((p) => p.id === id)?.name ?? tp.thisPlayer;
  type G = { key: string; playerId: string | null; software: boolean; lines: PricedLine[]; skipped: ExcludedLine[] };
  const groups = new Map<string, G>();
  const at = (key: string, playerId: string | null, software = false) => {
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { key, playerId, software, lines: [], skipped: [] }));
    return g;
  };
  for (const l of pricing.lines) {
    if (l.type === "SOFTWARE_LICENSE") at("software", null, true).lines.push(l);
    else at(l.targetPlayerId ? `p:${l.targetPlayerId}` : "later", l.targetPlayerId ?? null).lines.push(l);
  }
  for (const e of pricing.excluded) {
    if (e.type !== "SOFTWARE_LICENSE" && (e.reason === "ALREADY_OWNED" || e.reason === "INCLUDED_IN_BUNDLE")) {
      at(e.targetPlayerId ? `p:${e.targetPlayerId}` : "later", e.targetPlayerId ?? null).skipped.push(e);
    }
  }
  const ordered = [...groups.values()].sort((a, b) => Number(a.software) - Number(b.software));

  return (
    <div className="mt-6 flex flex-col gap-6">
      {ordered.map((g) => (
        <section key={g.key} className="flex flex-col gap-3">
          {g.software ? (
            ordered.length > 1 && <h3 className="text-sm font-semibold text-neutral-950">{tp.softwareGroup}</h3>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-neutral-950">{g.playerId ? nameOf(g.playerId) : tp.assignLater}</h3>
              <p className="mt-0.5 text-xs text-neutral-500">{g.playerId ? tp.licenseIsFor(nameOf(g.playerId)) : tp.assignLaterExplain}</p>
            </div>
          )}
          <ul className="flex flex-col gap-3">
            {g.lines.map((l) => {
              const additional = l.allocations.filter((a) => a.additionalPlayer).length;
              const owned = l.bundle?.ownedCount ?? 0;
              return (
                <li key={l.cartItemId} className="flex justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-950">{l.title}</p>
                    {l.bundle && <p className="text-neutral-500">{t.collectionLine(l.allocations.length, l.bundle.itemCount)}</p>}
                    {owned > 0 && <p className="text-neutral-500">{tp.collectionPartlyLicensed(owned)}</p>}
                    {additional > 0 && (
                      <p className="text-neutral-500">{l.bundle ? tp.additionalInCollection(additional) : tp.additionalBadge}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {l.retailValueCents > l.chargedCents && <p className="text-xs text-neutral-500 line-through">{money(l.retailValueCents)}</p>}
                    <p className="text-neutral-950">{money(l.chargedCents)}</p>
                  </div>
                </li>
              );
            })}
            {g.skipped.map((e) => (
              <li key={e.cartItemId} className="flex justify-between gap-4 text-sm text-neutral-500">
                <div className="min-w-0">
                  <p>{e.title}</p>
                  <p className="text-xs">
                    {e.reason === "ALREADY_OWNED" ? tp.alreadyLicensedFor(nameOf(e.targetPlayerId)) : t.includedInBundle(e.coveredByBundleTitle ?? t.collections)}
                  </p>
                </div>
                <p className="shrink-0">{tp.notCharged}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
