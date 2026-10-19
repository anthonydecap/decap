"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { CaretDown, Check, MusicNotes } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../api";
import type { CartPlayer } from "./CartProvider";
import { shopPath } from "./copy";
import { dmiCopy } from "./copy-dmi";
import { playerCopy } from "./copy-player";
import { PlayerSelector, type PlayerOption } from "./PlayerSelector";

/** Customers without a player: the player software to get, and how far they are. */
export type GetPlayerInfo = {
  name: string;
  /** Public product page. */
  href: string;
  /** Their license / activation page for it. */
  accountHref: string;
  stage: "buy" | "activate" | "activating" | "paused";
};

type ShoppingPlayerValue = {
  getPlayer: GetPlayerInfo | null;
  signedIn: boolean;
  players: CartPlayer[];
  selectedPlayerId: string | null;
  selectedPlayer: CartPlayer | null;
  assignLaterAllowed: boolean;
  /** Remembers the player (server cookie) and re-renders the page for it. */
  select: (playerId: string) => Promise<void>;
  pending: boolean;
};

const ShoppingPlayerContext = createContext<ShoppingPlayerValue | null>(null);

/**
 * "Buying music for": the player the storefront is scoped to. The server resolves the same
 * choice for every page (`?player=` first, then the remembered cookie) and computes all
 * states and prices; this only mirrors it so buttons know which player to add for.
 */
export function ShoppingPlayerProvider({
  signedIn,
  players,
  rememberedPlayerId,
  assignLaterAllowed,
  getPlayer = null,
  children,
}: {
  getPlayer?: GetPlayerInfo | null;
  signedIn: boolean;
  players: CartPlayer[];
  rememberedPlayerId: string | null;
  assignLaterAllowed: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  // Layouts survive client navigations, so keep our own copy of the remembered choice.
  const [remembered, setRemembered] = useState(rememberedPlayerId);
  const [prevProp, setPrevProp] = useState(rememberedPlayerId);
  if (prevProp !== rememberedPlayerId) {
    setPrevProp(rememberedPlayerId);
    setRemembered(rememberedPlayerId);
  }

  const valid = useCallback((id: string | null | undefined) => (id && players.some((p) => p.id === id) ? id : null), [players]);
  const fromUrl = valid(params.get("player"));
  const selectedPlayerId = fromUrl ?? valid(remembered) ?? (players.length === 1 ? players[0]!.id : null);

  // "Add Music" links arrive with ?player=: remember it for the rest of the visit.
  const rememberedOnce = useRef<string | null>(null);
  useEffect(() => {
    if (!signedIn || !fromUrl || fromUrl === remembered || rememberedOnce.current === fromUrl) return;
    rememberedOnce.current = fromUrl;
    apiFetch("/api/shop/player-context", { method: "POST", body: { playerId: fromUrl } })
      .then(() => setRemembered(fromUrl))
      .catch(() => undefined);
  }, [signedIn, fromUrl, remembered]);

  const select = useCallback(async (playerId: string) => {
    await apiFetch("/api/shop/player-context", { method: "POST", body: { playerId } });
    setRemembered(playerId);
    startTransition(() => {
      if (params.has("player")) {
        const next = new URLSearchParams(params.toString());
        next.delete("player");
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      } else {
        router.refresh();
      }
    });
  }, [params, pathname, router]);

  const value = useMemo<ShoppingPlayerValue>(() => ({
    getPlayer,
    signedIn,
    players,
    selectedPlayerId,
    selectedPlayer: players.find((p) => p.id === selectedPlayerId) ?? null,
    assignLaterAllowed,
    select,
    pending,
  }), [getPlayer, signedIn, players, selectedPlayerId, assignLaterAllowed, select, pending]);

  return <ShoppingPlayerContext.Provider value={value}>{children}</ShoppingPlayerContext.Provider>;
}

const ANONYMOUS: ShoppingPlayerValue = {
  getPlayer: null,
  signedIn: false, players: [], selectedPlayerId: null, selectedPlayer: null, assignLaterAllowed: false,
  select: async () => undefined, pending: false,
};

export function useShoppingPlayer(): ShoppingPlayerValue {
  return useContext(ShoppingPlayerContext) ?? ANONYMOUS;
}

/**
 * The shared selector bound to the shopping context: choosing a player remembers it and
 * re-renders the page, so every state and price is recomputed on the server.
 */
export function ShoppingPlayerSelector({
  lang,
  label,
  hideLabel,
  options,
  size,
  className,
}: {
  lang: string;
  label?: string;
  hideLabel?: boolean;
  /** Per-player notes (e.g. "licensed") for the product page; defaults to the plain list. */
  options?: PlayerOption[];
  size?: "sm" | "md";
  className?: string;
}) {
  const { players, selectedPlayerId, select, pending } = useShoppingPlayer();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className={className} aria-busy={pending || undefined}>
      <PlayerSelector
        lang={lang}
        players={options ?? players}
        value={selectedPlayerId}
        label={label}
        hideLabel={hideLabel}
        size={size}
        disabled={pending}
        onChange={(id) => {
          setError(null);
          select(id).catch((e) => setError(errorMessage(e)));
        }}
      />
      {error && <p role="alert" className="mt-1 text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}

/**
 * "Shopping for: Living Room Piano ▾" in the shop header, next to the cart. Always visible
 * while browsing, never a separate bar. Signed-in customers with at least one player only.
 */
export function PlayerSwitcher({ lang }: { lang: string }) {
  const t = dmiCopy(lang);
  const tp = playerCopy(lang);
  const { signedIn, players, selectedPlayer, select, pending, getPlayer } = useShoppingPlayer();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!signedIn) return null;
  if (players.length === 0) {
    if (!getPlayer) return null;
    return (
      <Link
        href={getPlayer.stage === "buy" ? getPlayer.href : getPlayer.accountHref}
        className="inline-flex max-w-[10rem] items-center gap-2 rounded-full border border-dashed border-neutral-400 px-3 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950 sm:max-w-none"
      >
        <MusicNotes size={15} weight="bold" aria-hidden className="shrink-0" />
        <span className="truncate">{getPlayer.stage === "buy" ? t.getAPlayer : t.activatePill(getPlayer.name)}</span>
      </Link>
    );
  }
  const label = selectedPlayer?.name ?? t.chooseAPlayer;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "inline-flex max-w-[8.5rem] items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition sm:max-w-[16rem]",
          selectedPlayer ? "border-neutral-300 text-neutral-950 hover:border-neutral-950" : "border-neutral-950 bg-neutral-950 text-white",
          pending && "opacity-60",
        )}
      >
        <MusicNotes size={15} weight="bold" aria-hidden className="shrink-0" />
        <span className="sr-only">{t.shoppingFor}: </span>
        <span className="truncate font-semibold">{label}</span>
        <CaretDown size={12} weight="bold" aria-hidden className={clsx("shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={menuId} role="menu" aria-label={t.shoppingFor} className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
          <p className="px-4 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-neutral-500">{t.shoppingFor}</p>
          <ul className="px-2">
            {players.map((p) => {
              const active = p.id === selectedPlayer?.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => {
                      setOpen(false);
                      if (active) return;
                      setError(null);
                      select(p.id).catch((e) => setError(errorMessage(e)));
                    }}
                    className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", active ? "bg-neutral-100" : "hover:bg-neutral-50")}
                  >
                    <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", active ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300")}>
                      {active && <Check size={11} weight="bold" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-neutral-950">{p.name}</span>
                      <span className="block truncate text-xs text-neutral-500">{tp.playerMeta(p.typeName, p.maskedRegistration)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 border-t border-neutral-200 px-4 py-3">
            <Link href={shopPath(lang, "/account")} onClick={() => setOpen(false)} className="text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950">
              {t.managePlayers}
            </Link>
          </div>
        </div>
      )}
      {error && <p role="alert" className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-neutral-950 px-3 py-2 text-xs text-white">{error}</p>}
    </div>
  );
}
