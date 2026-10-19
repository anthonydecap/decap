"use client";

import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { CaretDown, Check, X } from "@phosphor-icons/react";
import type { CartPlayer } from "./CartProvider";
import { playerCopy } from "./copy-player";

export type PlayerOption = {
  player: CartPlayer;
  /** Short state shown next to the name, e.g. "licensed" or "€3.95". */
  note?: string;
  /** Shown but not choosable (e.g. not compatible). */
  disabled?: boolean;
};

const toOptions = (players: readonly (CartPlayer | PlayerOption)[]): PlayerOption[] =>
  players.map((p) => ("player" in p ? p : { player: p }));

/**
 * The one player selector of the shop: "Buying music for", "For:" on product pages and the
 * cart line chooser. Lists only the eligible players it is given (friendly name, type,
 * masked registration). One player: plain text, nothing to choose. Several: a labelled
 * native select (keyboard and mobile friendly).
 */
export function PlayerSelector({
  lang,
  players,
  value,
  onChange,
  label,
  hideLabel = false,
  placeholder,
  disabled = false,
  size = "md",
  className,
}: {
  lang: string;
  players: readonly (CartPlayer | PlayerOption)[];
  value: string | null;
  onChange: (playerId: string) => void;
  label?: string;
  hideLabel?: boolean;
  /** Shown when nothing is selected yet (several players, no choice made). */
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const t = playerCopy(lang);
  const id = useId();
  const options = toOptions(players);
  if (options.length === 0) return null;
  const selected = options.find((o) => o.player.id === value)?.player ?? null;
  const labelText = label ?? t.player;

  if (options.length === 1) {
    const only = options[0]!.player;
    return (
      <div className={clsx("flex min-w-0 flex-wrap items-baseline gap-x-2", className)}>
        {!hideLabel && <span className="text-sm text-neutral-500">{labelText}:</span>}
        <span className={clsx("font-semibold text-neutral-950", size === "sm" ? "text-sm" : "text-base")}>{only.name}</span>
        <span className="text-xs text-neutral-500">{t.playerMeta(only.typeName, only.maskedRegistration)}</span>
      </div>
    );
  }

  return (
    <div className={clsx("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className={clsx("text-sm text-neutral-500", hideLabel && "sr-only")}>{labelText}</label>
      <div className="relative min-w-0">
        <select
          id={id}
          value={selected?.id ?? ""}
          disabled={disabled}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className={clsx(
            "block w-full min-w-0 cursor-pointer appearance-none truncate rounded-full border border-neutral-300 bg-white pl-4 pr-10 font-semibold text-neutral-950 transition hover:border-neutral-950 focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 disabled:cursor-wait disabled:opacity-60",
            size === "sm" ? "py-1.5 text-sm" : "py-2.5 text-base",
          )}
        >
          {!selected && <option value="" disabled>{placeholder ?? t.choosePlayer}</option>}
          {options.map((o) => (
            <option key={o.player.id} value={o.player.id} disabled={o.disabled}>
              {o.player.name} ({o.player.typeName}, {o.player.maskedRegistration}){o.note ? `, ${o.note}` : ""}
            </option>
          ))}
        </select>
        <CaretDown size={14} weight="bold" aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-950" />
      </div>
    </div>
  );
}

/**
 * "Which player is this music for?" A modal radio group, used when music is added without
 * a chosen player (several players) and for "Add to another player".
 */
export function PlayerChoiceDialog({
  lang,
  players,
  initialPlayerId = null,
  title,
  body,
  confirmLabel,
  busy = false,
  error,
  onConfirm,
  onClose,
}: {
  lang: string;
  players: readonly (CartPlayer | PlayerOption)[];
  initialPlayerId?: string | null;
  title?: string;
  body?: string;
  confirmLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: (playerId: string) => void;
  onClose: () => void;
}) {
  const t = playerCopy(lang);
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const options = toOptions(players);
  const firstEnabled = options.find((o) => !o.disabled)?.player.id ?? null;
  const [choice, setChoice] = useState<string | null>(
    options.some((o) => o.player.id === initialPlayerId && !o.disabled) ? initialPlayerId : options.filter((o) => !o.disabled).length === 1 ? firstEnabled : null,
  );

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md overscroll-contain rounded-3xl border border-neutral-200 bg-white p-0 text-left text-neutral-950 shadow-2xl backdrop:bg-neutral-950/40 backdrop:backdrop-blur-sm"
    >
      <form
        className="p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (choice) onConfirm(choice);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">{title ?? t.whichPlayerTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            aria-label={t.close}
          >
            <X size={18} weight="bold" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-sm text-neutral-600">{body ?? t.whichPlayerBody}</p>
        <fieldset className="mt-6">
          <legend className="sr-only">{title ?? t.whichPlayerTitle}</legend>
          <div className="flex flex-col gap-2">
            {options.map((o) => {
              const checked = choice === o.player.id;
              return (
                <label
                  key={o.player.id}
                  className={clsx(
                    "flex items-start gap-3 rounded-2xl border px-4 py-3 transition",
                    o.disabled ? "cursor-not-allowed border-neutral-200 opacity-60" : "cursor-pointer",
                    checked ? "border-neutral-950 ring-1 ring-neutral-950" : !o.disabled && "border-neutral-300 hover:border-neutral-950",
                  )}
                >
                  <input
                    type="radio"
                    name="player"
                    value={o.player.id}
                    checked={checked}
                    disabled={o.disabled}
                    onChange={() => setChoice(o.player.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-neutral-950"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-neutral-950">{o.player.name}</span>
                    <span className="block text-sm text-neutral-500">{t.playerMeta(o.player.typeName, o.player.maskedRegistration)}</span>
                  </span>
                  {o.note && <span className="shrink-0 pt-0.5 text-sm text-neutral-700">{o.note}</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
        {error && <p role="alert" className="mt-4 text-sm font-medium text-neutral-950">{error}</p>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full px-6 py-3 font-semibold text-neutral-700 transition hover:text-neutral-950">
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={!choice || busy}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? <span>{confirmLabel ?? t.continue}…</span> : <><Check size={16} weight="bold" aria-hidden />{confirmLabel ?? t.continue}</>}
          </button>
        </div>
      </form>
    </dialog>
  );
}
