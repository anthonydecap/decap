"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, MusicNotes, X } from "@phosphor-icons/react";
import { ApiError, errorMessage } from "../api";
import { useCart, type CartPlayer } from "./CartProvider";
import { shopCopy, shopPath } from "./copy";
import { dmiCopy } from "./copy-dmi";
import { playerCopy, playerLinks } from "./copy-player";
import { PlayerChoiceDialog, type PlayerOption } from "./PlayerSelector";
import { useShoppingPlayer } from "./ShoppingPlayer";

type Props = {
  lang: string;
  item: { type: "ARRANGEMENT"; arrangementId: string } | { type: "BUNDLE"; bundleId: string };
  /** Already licensed for the target player: shows "Licensed" instead of a button. */
  owned?: boolean;
  /** Where "Licensed" links to (defaults to My Music). */
  licensedHref?: string;
  /**
   * The player this music is for. Omitted: the shopping context's player. null: no player
   * (assign later). The server re-checks it either way.
   */
  targetPlayerId?: string | null;
  /** Always ask which player first (e.g. "Add to another player"), from these options. */
  chooseFrom?: PlayerOption[];
  /** Remember the player picked in the dialog as the shopping player (default true). */
  rememberChoice?: boolean;
  label?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "lg";
  className?: string;
};

export function AddToCartButton({
  lang, item, owned, licensedHref, targetPlayerId, chooseFrom, rememberChoice = true, label, variant = "primary", size = "lg", className,
}: Props) {
  const t = shopCopy(lang);
  const tp = playerCopy(lang);
  const { add, contains } = useCart();
  const shopping = useShoppingPlayer();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ players: (CartPlayer | PlayerOption)[] } | null>(null);
  const [needsPlayer, setNeedsPlayer] = useState(false);
  const pathname = usePathname();
  const refId = item.type === "ARRANGEMENT" ? item.arrangementId : item.bundleId;
  const target = targetPlayerId !== undefined ? targetPlayerId : shopping.selectedPlayerId;
  const mustChoose = !chooseFrom && target == null && shopping.signedIn && shopping.players.length > 1;
  const inCart = !chooseFrom && !mustChoose && contains(refId, shopping.signedIn ? target : undefined);

  const base = size === "lg"
    ? "rounded-full px-8 py-3 text-base font-semibold"
    : "rounded-full px-4 py-1.5 text-sm font-semibold";

  if (owned) {
    return (
      <Link href={licensedHref ?? playerLinks.myMusic(lang)} className={clsx(base, "inline-flex items-center gap-2 border border-neutral-300 text-neutral-950 transition hover:border-neutral-950", className)}>
        <Check size={size === "lg" ? 18 : 14} weight="bold" aria-hidden />
        {tp.licensed}
      </Link>
    );
  }
  if (inCart) {
    return (
      <Link href={shopPath(lang, "/cart")} className={clsx(base, "inline-flex items-center gap-2 border-2 border-neutral-950 text-neutral-950 transition hover:bg-neutral-950 hover:text-white", className)}>
        <Check size={size === "lg" ? 18 : 14} weight="bold" aria-hidden />
        {t.inCart}
      </Link>
    );
  }

  const addFor = async (playerId: string | null, fromDialog: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await add({ ...item, ...(playerId ? { targetPlayerId: playerId } : {}) });
      setDialog(null);
      if (fromDialog && rememberChoice && playerId && playerId !== shopping.selectedPlayerId) {
        await shopping.select(playerId).catch(() => undefined);
      }
    } catch (err) {
      const players = err instanceof ApiError && err.code === "PLAYER_REQUIRED"
        ? ((err.details as { players?: CartPlayer[] } | undefined)?.players ?? [])
        : [];
      if (!fromDialog && players.length > 0) setDialog({ players });
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const text = label ?? (size === "sm" ? tp.add : t.addToCart);
  const buttonClass = clsx(
    base,
    "transition-[background-color,color,transform] duration-300 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950",
    variant === "primary"
      ? "bg-neutral-950 text-white hover:bg-neutral-800"
      : "border-2 border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white",
    size === "lg" && variant === "primary" && "hover:scale-105",
  );

  // Music is licensed to a player: signed out means sign in first.
  if (!shopping.signedIn) {
    return (
      <div className={clsx("flex flex-col gap-2", size === "lg" ? "items-start" : "items-end", className)}>
        {/* Full navigation: Auth0 routes are served by the proxy, not the client router. */}
        <a href={`/auth/login?returnTo=${encodeURIComponent(pathname)}`} onClick={(e) => e.stopPropagation()} className={clsx(buttonClass, "inline-flex")} aria-label={`${text}: ${dmiCopy(lang).signInToBuy}`}>
          {text}
        </a>
      </div>
    );
  }
  // Signed in without a player (and no "assign later"): explain what to get, never a dead end.
  const blockedNoPlayer = shopping.players.length === 0 && !shopping.assignLaterAllowed && targetPlayerId !== null;

  return (
    <div className={clsx("flex flex-col gap-2", size === "lg" ? "items-start" : "items-end", className)}>
      <button
        type="button"
        disabled={busy}
        aria-haspopup={chooseFrom || mustChoose || blockedNoPlayer ? "dialog" : undefined}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (blockedNoPlayer) setNeedsPlayer(true);
          else if (chooseFrom) setDialog({ players: chooseFrom });
          else if (mustChoose) setDialog({ players: shopping.players });
          else void addFor(target ?? null, false);
        }}
        className={buttonClass}
      >
        {busy && !dialog ? `${text}…` : text}
      </button>
      {error && !dialog && <p role="alert" className="max-w-xs text-xs font-medium text-neutral-950">{error}</p>}
      {needsPlayer && <NeedsPlayerDialog lang={lang} onClose={() => setNeedsPlayer(false)} />}
      {dialog && (
        <PlayerChoiceDialog
          lang={lang}
          players={dialog.players}
          initialPlayerId={chooseFrom ? null : shopping.selectedPlayerId}
          confirmLabel={chooseFrom ? tp.continue : t.addToCart}
          busy={busy}
          error={error}
          onConfirm={(id) => void addFor(id, true)}
          onClose={() => { setDialog(null); setError(null); }}
        />
      )}
    </div>
  );
}

/** "Music plays on Virtual Orchestrion": what to get (or finish activating) before buying music. */
function NeedsPlayerDialog({ lang, onClose }: { lang: string; onClose: () => void }) {
  const t = dmiCopy(lang);
  const { getPlayer } = useShoppingPlayer();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);
  const name = getPlayer?.name ?? "Virtual Orchestrion";
  const stage = getPlayer?.stage ?? "buy";
  const title = stage === "activate" ? t.activateTitle(name) : stage === "activating" ? t.activatingTitle(name) : stage === "paused" ? t.pausedTitle(name) : t.needsPlayerTitle(name);
  const body = stage === "activate" ? t.activateBody : stage === "activating" ? t.activatingBody : stage === "paused" ? t.pausedBody : t.needsPlayerBody(name);
  const href = stage === "buy" ? getPlayer?.href : getPlayer?.accountHref;
  const cta = stage === "buy" ? t.getPlayer(name) : stage === "activate" ? t.enterCode : t.licenseAndKey;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md overscroll-contain rounded-3xl border border-neutral-200 bg-white p-0 text-left text-neutral-950 shadow-2xl backdrop:bg-neutral-950/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-950">
            <MusicNotes size={22} aria-hidden />
          </span>
          <button type="button" onClick={onClose} aria-label={t.close} className="-mr-2 -mt-1 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950">
            <X size={18} weight="bold" aria-hidden />
          </button>
        </div>
        <h2 id={titleId} className="mt-5 font-display text-2xl font-bold text-neutral-950">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{body}</p>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link href={playerLinks.help(lang)} className="text-center text-sm font-semibold text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-950">
            {t.howItWorks}
          </Link>
          {href && (
            <Link href={href} className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3 font-semibold text-white transition hover:bg-neutral-800">
              {cta}
              <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </dialog>
  );
}
