"use client";

import Link from "next/link";
import { useState } from "react";
import { Info } from "@phosphor-icons/react";
import type { ExcludedLine, PricedLine } from "../../domain/cart-pricing";
import { errorMessage } from "../api";
import { formatMoney } from "../format";
import { useCart, type CartPlayer } from "./CartProvider";
import { shopCopy, shopPath, softwarePath } from "./copy";
import { playerCopy, playerLinks } from "./copy-player";
import { PlayerSelector } from "./PlayerSelector";

type Group = {
  key: string;
  kind: "player" | "later" | "choose" | "software" | "plain";
  player: CartPlayer | null;
  lines: PricedLine[];
  covered: ExcludedLine[];
  needsPlayer: ExcludedLine[];
};

/**
 * The cart, grouped by the player each license is for ("For Living Room Piano", "Assign
 * later"). Every price is the server's; the browser only says "remove line" or "this line
 * is for player P". The same arrangement may appear once per player.
 */
export function CartView({ lang, signedIn }: { lang: string; signedIn: boolean }) {
  const t = shopCopy(lang);
  const tp = playerCopy(lang);
  // The provider already loads the cart; notices it collected stay visible for this visit.
  const { cart, loading, remove, setTarget, removedNotices: removed, priceNotices } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const money = (c: number) => formatMoney(c, cart?.pricing.currency ?? "EUR", lang);
  const players = cart?.players ?? [];
  const playerName = (id: string | null | undefined) => players.find((p) => p.id === id)?.name ?? tp.thisPlayer;

  if (loading && !cart) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        {[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />)}
      </div>
    );
  }

  const lines = cart?.pricing.lines ?? [];
  const kept = (cart?.pricing.excluded ?? []).filter((e) => !e.removeFromCart);
  const needsPlayer = kept.filter((e) => e.reason === "PLAYER_REQUIRED");
  const covered = kept.filter((e) => e.reason !== "PLAYER_REQUIRED");
  const partial = (cart?.pricing.notices ?? []).filter((n) => n.code === "PARTIALLY_OWNED");

  const removedText = (r: ExcludedLine) => {
    switch (r.reason) {
      case "ALREADY_OWNED": return r.targetPlayerId ? tp.removedOwnedFor(playerName(r.targetPlayerId)) : t.removedOwned;
      case "INCOMPATIBLE": return tp.removedIncompatible(playerName(r.targetPlayerId));
      case "PLAYER_UNAVAILABLE": return tp.removedPlayerUnavailable;
      default: return t.removedUnavailable;
    }
  };

  const notices = (
    <>
      {removed.map((r) => (
        <p key={r.cartItemId} role="status" className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          <span className="font-medium text-neutral-950">{r.title}.</span> {removedText(r)}
        </p>
      ))}
      {priceNotices.map((n) => (
        <p key={`p-${n.cartItemId}`} role="status" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm text-neutral-950">
          <span className="font-medium">{n.title}.</span> {t.priceChanged(money(n.previousCents), money(n.currentCents))}
        </p>
      ))}
    </>
  );

  if (lines.length === 0 && kept.length === 0) {
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

  // Group lines by target player, in order of first appearance.
  const groups = new Map<string, Group>();
  const groupFor = (key: string, kind: Group["kind"], player: CartPlayer | null) => {
    let g = groups.get(key);
    if (!g) {
      g = { key, kind, player, lines: [], covered: [], needsPlayer: [] };
      groups.set(key, g);
    }
    return g;
  };
  const musicGroup = (target: string | null | undefined) => {
    if (!signedIn) return groupFor("plain", "plain", null);
    if (target) return groupFor(`p:${target}`, "player", players.find((p) => p.id === target) ?? null);
    return groupFor("later", "later", null);
  };
  if (needsPlayer.length) groupFor("choose", "choose", null).needsPlayer.push(...needsPlayer);
  for (const l of lines) {
    if (l.type === "SOFTWARE_LICENSE") groupFor("software", "software", null).lines.push(l);
    else musicGroup(l.targetPlayerId).lines.push(l);
  }
  for (const c of covered) musicGroup(c.targetPlayerId).covered.push(c);
  const ordered = [...groups.values()].sort((a, b) => rank(a.kind) - rank(b.kind));
  const showHeaders = signedIn && ordered.some((g) => g.kind !== "software" && g.kind !== "plain");

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const removeButton = (id: string) => (
    <button
      type="button"
      onClick={() => run(id, () => remove(id))}
      disabled={busyId === id}
      className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950 disabled:opacity-50"
    >
      {t.remove}
    </button>
  );

  const header = (g: Group) => {
    if (!showHeaders) return null;
    if (g.kind === "player") {
      return (
        <div className="pb-3">
          <h2 className="font-display text-lg font-bold text-neutral-950">{tp.forPlayer(g.player?.name ?? tp.thisPlayer)}</h2>
          {g.player && <p className="text-sm text-neutral-500">{tp.playerMeta(g.player.typeName, g.player.maskedRegistration)}</p>}
        </div>
      );
    }
    if (g.kind === "later") {
      return (
        <div className="pb-3">
          <h2 className="font-display text-lg font-bold text-neutral-950">{tp.assignLater}</h2>
          <p className="text-sm text-neutral-500">{tp.assignLaterBody}</p>
        </div>
      );
    }
    if (g.kind === "choose") {
      return (
        <div className="pb-3">
          <h2 className="font-display text-lg font-bold text-neutral-950">{tp.needsPlayer}</h2>
          <p className="text-sm text-neutral-500">{tp.needsPlayerBody}</p>
        </div>
      );
    }
    if (g.kind === "software") return <h2 className="pb-3 font-display text-lg font-bold text-neutral-950">{tp.softwareGroup}</h2>;
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-8">
        {notices}
        {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
        <div className="flex flex-col gap-10">
          {ordered.map((g) => (
            <section key={g.key} aria-label={g.kind === "player" ? tp.forPlayer(g.player?.name ?? tp.thisPlayer) : undefined}>
              {header(g)}
              <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
                {g.needsPlayer.map((e) => (
                  <li key={e.cartItemId} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold text-neutral-950">{e.title}</p>
                      {players.length === 1 ? (
                        <button
                          type="button"
                          onClick={() => run(e.cartItemId, () => setTarget(e.cartItemId, players[0]!.id))}
                          disabled={busyId === e.cartItemId}
                          className="mt-3 rounded-full border-2 border-neutral-950 px-5 py-1.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white disabled:opacity-50"
                        >
                          {tp.addTo(players[0]!.name)}
                        </button>
                      ) : players.length > 1 ? (
                        <PlayerSelector
                          lang={lang}
                          players={players}
                          value={null}
                          label={tp.thisMusicIsFor}
                          size="sm"
                          disabled={busyId === e.cartItemId}
                          onChange={(id) => run(e.cartItemId, () => setTarget(e.cartItemId, id))}
                          className="mt-3 max-w-xs"
                        />
                      ) : (
                        <div className="mt-2 text-sm text-neutral-600">
                          <p className="flex items-start gap-2">
                            <Info size={16} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-neutral-950" />
                            {tp.noPlayerTitle}
                          </p>
                          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-6">
                            <Link href={softwarePath(lang)} className="font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4">{tp.downloadDmiPlayer}</Link>
                            <Link href={playerLinks.help(lang)} className="font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4">{tp.howLicensingWorks}</Link>
                          </p>
                        </div>
                      )}
                      <div className="mt-3">{removeButton(e.cartItemId)}</div>
                    </div>
                  </li>
                ))}
                {g.lines.map((l) => {
                  const p = partial.find((n) => n.cartItemId === l.cartItemId);
                  const additional = l.allocations.filter((a) => a.additionalPlayer).length;
                  return (
                    <li key={l.cartItemId} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-display text-lg font-bold text-neutral-950">{l.title}</p>
                        {l.bundle ? (
                          <>
                            <p className="mt-1 text-sm text-neutral-600">{t.collectionLine(l.allocations.length, l.bundle.itemCount)}</p>
                            {p && p.code === "PARTIALLY_OWNED" && <p className="mt-1 text-sm text-neutral-600">{t.partiallyOwned(p.ownedCount, p.itemCount)}</p>}
                            {(l.bundle.incompatibleCount ?? 0) > 0 && <p className="mt-1 text-sm text-neutral-600">{tp.notAvailableCount(l.bundle.incompatibleCount!)}</p>}
                          </>
                        ) : l.type === "SOFTWARE_LICENSE" ? (
                          <p className="mt-1 text-sm text-neutral-600">{t.sw.cartLine}</p>
                        ) : (
                          <p className="mt-1 text-sm text-neutral-500">SKU {l.sku}</p>
                        )}
                        {additional > 0 && (
                          <p className="mt-2 inline-block rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs font-semibold text-neutral-800">
                            {l.bundle ? tp.additionalInCollection(additional) : tp.additionalBadge}
                          </p>
                        )}
                        <div className="mt-3">{removeButton(l.cartItemId)}</div>
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
                {g.covered.map((c) => (
                  <li key={c.cartItemId} className="flex items-start justify-between gap-4 py-5">
                    <div>
                      <p className="font-medium text-neutral-950">{c.title}</p>
                      <p className="mt-1 text-sm text-neutral-600">{t.includedInBundle(c.coveredByBundleTitle ?? t.collections)}</p>
                    </div>
                    <div className="shrink-0">{removeButton(c.cartItemId)}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
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
          {needsPlayer.length > 0 ? (
            <p role="status" className="mt-8 rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-800">{tp.choosePlayersFirst}</p>
          ) : lines.length > 0 && (signedIn ? (
            <Link href={shopPath(lang, "/checkout")} className="mt-8 block rounded-full bg-neutral-950 px-8 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-neutral-800">
              {t.checkout}
            </Link>
          ) : (
            <a href={`/auth/login?returnTo=${encodeURIComponent(shopPath(lang, "/checkout"))}`} className="mt-8 block rounded-full bg-neutral-950 px-8 py-3 text-center font-semibold text-white transition-all duration-300 hover:bg-neutral-800">
              {t.signInToCheckout}
            </a>
          ))}
          <p className="mt-4 text-xs text-neutral-500">{t.vatNote}</p>
          {!signedIn && lines.length > 0 && <p className="mt-2 text-xs text-neutral-500">{tp.licensingOneLine}</p>}
        </div>
      </aside>
    </div>
  );
}

const rank = (k: Group["kind"]) => ({ choose: 0, player: 1, plain: 1, later: 2, software: 3 })[k];
