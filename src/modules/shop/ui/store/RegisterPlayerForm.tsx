"use client";

import { UploadSimple } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { apiFetch, errorMessage } from "../api";
import { accountCopy } from "./copy-account";
import { inputClass } from "./ProfileForm";

/**
 * Licence v1 (contract C7 §5.1): the customer registers a Decap Player by uploading the
 * `.decapreq` the player saved. The file is read in the browser and sent as text; the server
 * checks that the player ID belongs to the key before anything is stored.
 */
export function RegisterPlayerForm({ lang }: { lang: string }) {
  const t = accountCopy(lang);
  const router = useRouter();
  const id = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  return (
    <form
      className="flex max-w-xl flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setDone(null);
        const file = fileInput.current?.files?.[0];
        if (!file) {
          setError(t.registerNoFile);
          return;
        }
        setBusy(true);
        try {
          const request = file.size > 8192 ? "" : await file.text();
          const res = await apiFetch<{ created: boolean; customerNumber: string }>("/api/shop/account/players", {
            method: "POST",
            body: { request, friendlyName: name.trim() || null },
          });
          setDone(res.created ? t.registerDone(res.customerNumber) : t.registerAgain);
          setName("");
          if (fileInput.current) fileInput.current.value = "";
          router.refresh();
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor={`${id}-file`} className="text-sm font-medium text-neutral-800">{t.registerFileLabel}</label>
      <input
        id={`${id}-file`}
        ref={fileInput}
        type="file"
        accept=".decapreq,application/json"
        className="text-sm text-neutral-800 file:mr-4 file:rounded-full file:border file:border-neutral-300 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-neutral-950 hover:file:border-neutral-950"
      />
      <label htmlFor={`${id}-name`} className="mt-2 text-sm font-medium text-neutral-800">{t.registerNameLabel}</label>
      <input
        id={`${id}-name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        autoComplete="off"
        className={inputClass}
      />
      {error && <p role="alert" className="text-sm font-medium text-neutral-950">{error}</p>}
      {done && <p role="status" className="text-sm font-medium text-neutral-950">{done}</p>}
      <div>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          <UploadSimple size={16} weight="bold" aria-hidden />
          {busy ? `${t.registerBusy}…` : t.registerSubmit}
        </button>
      </div>
    </form>
  );
}
