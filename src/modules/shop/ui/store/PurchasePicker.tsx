"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CheckCircle, MinusCircle, ShoppingBagOpen } from "@phosphor-icons/react";
import { errorMessage } from "../api";
import { formatMoney } from "../format";
import { useCart, type CartPlayer } from "./CartProvider";
import { shopPath } from "./copy";
import { dmiCopy } from "./copy-dmi";
import { playerCopy } from "./copy-player";
import { useShoppingPlayer } from "./ShoppingPlayer";

export type PickState = "AVAILABLE" | "ADDITIONAL" | "LICENSED" | "INCOMPATIBLE";

export type PickOption = {
  player: CartPlayer;
  state: PickState;
  /** What this player pays (server-computed). */
  priceCents: number;
  /** Collections: per-player breakdown for the summary under the list. */
  collection?: { willAdd: number; already: number; notAvailable: number; extra: number };
};

/**
 * "Where will this play?" One row per player with what it costs for that player, so the
 * choice and its consequence are visible together; then one button that says exactly what
 * happens ("Add to Living Room Piano · €8.95"). All prices come from the server; picking a
 * row also makes it the shopping player for the rest of the visit.
 */
export function PurchasePicker({
  lang,
  item,
  currency,
  retailCents,
  options,
  initialPlayerId,
  libraryHrefs,
}: {
  lang: string;
  item: { type: "ARRANGEMENT"; arrangementId: string } | { type: "BUNDLE"; bundleId: string };
  currency: string;
  /** Normal price, struck through when a player pays less. */
  retailCents: number;
  options: PickOption[];
  initialPlayerId: string | null;
  /** playerId → where "Open <player>'s music" goes (plain data: this is a client component). */
  libraryHrefs: Record<string, string>;
}) {
  const t = dmiCopy(lang);
  const tp = playerCopy(lang);
  const { add, contains } = useCart();
  const shopping = useShoppingPlayer();
  const buyable = (o: PickOption) => o.state === "AVAILABLE" || o.state === "ADDITIONAL";
  const initial =
    options.find((o) => o.player.id === initialPlayerId) ??
    options.find(buyable) ??
    options[0] ??
    null;
  const [selectedId, setSelectedId] = useState<string | null>(options.length > 1 && !initialPlayerId && options.filter(buyable).length > 1 ? null : initial?.player.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const money = (c: number) => formatMoney(c, currency, lang);
  const selected = options.find((o) => o.player.id === selectedId) ?? null;
  const refId = item.type === "ARRANGEMENT" ? item.arrangementId : item.bundleId;
  const inCart = selected ? contains(refId, selected.player.id) : false;

  const choose = (id: string) => {
    setSelectedId(id);
    setError(null);
    if (id !== shopping.selectedPlayerId) void shopping.select(id).catch(() => undefined);
  };

  const onAdd = async () => {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await add({ ...item, targetPlayerId: selected.player.id });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const shownPrice = selected && buyable(selected) ? selected.priceCents : Math.min(...options.filter(buyable).map((o) => o.priceCents), retailCents);

  return (
    <div className="mt-8">
      <p className="flex items-baseline gap-3 font-display text-4xl font-bold tracking-tight text-neutral-950">
        {money(shownPrice)}
        {shownPrice < retailCents && <span className="text-lg font-normal text-neutral-400 line-through">{money(retailCents)}</span>}
      </p>

      <fieldset className="mt-8">
        <legend className="text-sm font-semibold text-neutral-950">{options.length === 1 ? t.wherePlaysOne : t.wherePlays}</legend>
        <div className="mt-3 flex flex-col gap-2" role="radiogroup">
          {options.map((o) => {
            const isSelected = o.player.id === selectedId;
            const disabled = o.state === "INCOMPATIBLE";
            return (
              <label
                key={o.player.id}
                className={clsx(
                  "group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950",
                  disabled ? "cursor-not-allowed border-neutral-200 bg-neutral-50" : "cursor-pointer",
                  isSelected ? "border-neutral-950 bg-white ring-1 ring-neutral-950" : !disabled && "border-neutral-200 bg-white hover:border-neutral-400",
                )}
              >
                <input
                  type="radio"
                  name={`play-${refId}`}
                  value={o.player.id}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => choose(o.player.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                    isSelected ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300 bg-white",
                  )}
                >
                  {isSelected && <Check size={11} weight="bold" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={clsx("block truncate font-semibold", disabled ? "text-neutral-500" : "text-neutral-950")}>{o.player.name}</span>
                  <span className="block truncate text-xs text-neutral-500">{tp.playerMeta(o.player.typeName, o.player.maskedRegistration)}</span>
                </span>
                <span className="shrink-0 text-right text-sm">
                  {o.state === "LICENSED" ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-neutral-950">
                      <CheckCircle size={16} weight="fill" aria-hidden />
                      {item.type === "BUNDLE" ? t.alreadyHasAll : t.alreadyHasIt}
                    </span>
                  ) : o.state === "INCOMPATIBLE" ? (
                    <span className="inline-flex items-center gap-1.5 text-neutral-500">
                      <MinusCircle size={16} aria-hidden />
                      {t.notAvailable}
                    </span>
                  ) : (
                    <>
                      <span className="block font-semibold tabular-nums text-neutral-950">{money(o.priceCents)}</span>
                      {o.collection ? (
                        <span className="block text-xs text-neutral-500">{t.collectionAdds(o.collection.willAdd)}</span>
                      ) : o.state === "ADDITIONAL" && o.priceCents < retailCents ? (
                        <span className="block text-xs text-neutral-500">{t.extraPlayerPrice}</span>
                      ) : null}
                    </>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {selected?.collection && buyable(selected) && (
        <ul className="mt-4 flex flex-col gap-1.5 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <li className="font-medium text-neutral-950">{t.collectionWillAdd(selected.collection.willAdd)}</li>
          {selected.collection.already > 0 && <li>{t.collectionAlready(selected.collection.already)}</li>}
          {selected.collection.extra > 0 && <li>{t.collectionExtra(selected.collection.extra)}</li>}
          {selected.collection.notAvailable > 0 && <li>{t.collectionNotAvailable(selected.collection.notAvailable)}</li>}
        </ul>
      )}

      <div className="mt-6" aria-live="polite">
        {!selected ? (
          <button type="button" disabled className="w-full rounded-full bg-neutral-200 px-8 py-4 text-base font-semibold text-neutral-500 sm:w-auto">
            {t.pickFirst}
          </button>
        ) : selected.state === "LICENSED" ? (
          <Link href={libraryHrefs[selected.player.id] ?? shopPath(lang, "/account/music")} className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-neutral-950 px-8 py-3.5 text-base font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white sm:w-auto">
            {t.openInLibrary(selected.player.name)}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        ) : selected.state === "INCOMPATIBLE" ? null : inCart ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-2 font-semibold text-neutral-950">
              <CheckCircle size={20} weight="fill" aria-hidden />
              {t.addedToCart}
            </span>
            <Link href={shopPath(lang, "/cart")} className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-neutral-800">
              <ShoppingBagOpen size={18} weight="bold" aria-hidden />
              {t.viewCart}
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-4 text-base font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-neutral-800 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 disabled:opacity-60 sm:w-auto"
          >
            <span className="truncate">{t.addToPlayer(selected.player.name)}</span>
            <span aria-hidden className="text-white/50">·</span>
            <span className="tabular-nums">{money(selected.priceCents)}</span>
          </button>
        )}
        {error && <p role="alert" className="mt-3 text-sm font-medium text-neutral-950">{error}</p>}
      </div>
    </div>
  );
}
