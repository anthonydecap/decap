"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { apiFetch, errorMessage } from "../api";
import { accountCopy } from "./copy-account";
import { inputClass } from "./ProfileForm";

type Item = { licenseId: string; title: string; subtitle: string };
type Player = { id: string; name: string; detail: string };
type Result = { assigned: number; skipped: { licenseId: string; title: string; reason: "ALREADY_LICENSED" | "INCOMPATIBLE" }[] };

/**
 * First placement of music bought "for later" on one of the customer's players. This is a
 * one-time choice: the API refuses anything already on a player, and the server re-checks
 * that the player and the music are the customer's own.
 */
export function AssignMusicForm({ lang, items, players }: { lang: string; items: Item[]; players: Player[] }) {
  const t = accountCopy(lang);
  const router = useRouter();
  const id = useId();
  const [playerId, setPlayerId] = useState(players.length === 1 ? players[0]!.id : "");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(items.map((i) => i.licenseId)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ count: number; player: string; skipped: Result["skipped"] } | null>(null);

  const allSelected = selected.size === items.length;
  const toggle = (licenseId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(licenseId)) next.delete(licenseId);
      else next.add(licenseId);
      return next;
    });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!playerId) return setError(t.playerRequired);
        const licenseIds = items.map((i) => i.licenseId).filter((x) => selected.has(x));
        if (!licenseIds.length) return setError(t.assignNothing);
        setBusy(true);
        setError(null);
        try {
          const res = await apiFetch<Result>("/api/shop/account/music/assign", { body: { licenseIds, playerId } });
          setDone({ count: res.assigned, player: players.find((p) => p.id === playerId)?.name ?? "", skipped: res.skipped });
          router.refresh();
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      {done && (
        <div role="status" className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
          {done.count > 0 && (
            <p className="flex items-center gap-2 font-semibold text-neutral-950">
              <CheckCircle size={18} weight="bold" aria-hidden />
              {t.assignDone(done.count, done.player)}
            </p>
          )}
          {done.skipped.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-neutral-600">
              {done.skipped.map((s) => (
                <li key={s.licenseId}>
                  {s.reason === "INCOMPATIBLE" ? t.assignSkippedIncompatible(s.title) : t.assignSkippedAlready(s.title)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-neutral-800">{t.assignSelectLabel}</legend>
        {items.length > 1 && (
          <label className="mt-3 flex items-center gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.licenseId)))}
              className="h-4 w-4 accent-neutral-950"
            />
            {t.selectAll}
          </label>
        )}
        <ul className="mt-3 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {items.map((i) => (
            <li key={i.licenseId}>
              <label className="flex cursor-pointer items-start gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(i.licenseId)}
                  onChange={() => toggle(i.licenseId)}
                  className="mt-1 h-4 w-4 shrink-0 accent-neutral-950"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-neutral-950">{i.title}</span>
                  {i.subtitle && <span className="block text-sm text-neutral-600">{i.subtitle}</span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-player`} className="text-sm font-medium text-neutral-800">{t.assignPlayerLabel}</label>
        <select
          id={`${id}-player`}
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
          required
          className={`${inputClass} sm:max-w-md`}
        >
          {players.length > 1 && <option value="" disabled>{t.choosePlayer}</option>}
          {players.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.detail})</option>)}
        </select>
        <p className="text-xs text-neutral-500">{t.assignLockNote}</p>
      </div>

      {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
      <button
        type="submit"
        disabled={busy || selected.size === 0}
        aria-busy={busy}
        className="self-start rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {busy ? `${t.assignBusy}…` : t.assignSubmit}
      </button>
    </form>
  );
}
