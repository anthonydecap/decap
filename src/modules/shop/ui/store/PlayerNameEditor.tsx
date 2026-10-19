"use client";

import { PencilSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { apiFetch, errorMessage } from "../api";
import { accountCopy } from "./copy-account";
import { inputClass } from "./ProfileForm";

/**
 * The player name as the page heading, with an inline rename. The friendly name is the only
 * thing a customer may change about a player; the API checks the player is theirs.
 */
export function PlayerNameEditor({
  lang,
  playerId,
  name,
  friendlyName,
}: {
  lang: string;
  playerId: string;
  name: string;
  friendlyName: string | null;
}) {
  const t = accountCopy(lang);
  const router = useRouter();
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(friendlyName ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);

  const close = () => {
    setEditing(false);
    setError(null);
    requestAnimationFrame(() => editButton.current?.focus());
  };

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="break-words font-display text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{name}</h1>
        <button
          ref={editButton}
          type="button"
          onClick={() => {
            setValue(friendlyName ?? "");
            setEditing(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
        >
          <PencilSimple size={14} weight="bold" aria-hidden />
          {t.rename}
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await apiFetch(`/api/shop/account/players/${playerId}`, {
            method: "PATCH",
            body: { friendlyName: value.trim() || null },
          });
          setEditing(false);
          router.refresh();
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <h1 className="sr-only">{name}</h1>
      <label htmlFor={`${id}-name`} className="text-sm font-medium text-neutral-800">{t.renameLabel}</label>
      <input
        id={`${id}-name`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={60}
        autoFocus
        autoComplete="off"
        placeholder={name}
        aria-describedby={`${id}-hint`}
        aria-invalid={error ? true : undefined}
        className={inputClass}
      />
      <p id={`${id}-hint`} className="text-xs text-neutral-500">{t.renameHint}</p>
      {error && <p role="alert" className="text-sm font-medium text-neutral-950">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? `${t.saving}…` : t.save}
        </button>
        <button type="button" onClick={close} className="rounded-full border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950">
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
