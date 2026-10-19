"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeSlash } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { shopCopy } from "../copy";

const MASK = "••••-••••-••••-••••";

/**
 * The activation key stays masked until the owner clicks Reveal. Only then is it fetched
 * (POST, no-store, audited server-side) and held in component state: never in the URL,
 * storage or logs. Hide drops it from memory.
 */
export function ActivationKey({ lang, installationId }: { lang: string; installationId: string }) {
  const t = shopCopy(lang).sw;
  const [key, setKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<"ok" | "failed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (copied !== "ok") return;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const reveal = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ activationKey: string }>(`/api/shop/software/installations/${installationId}/key`, { method: "POST", body: {} });
      setKey(res.activationKey);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied("ok");
    } catch {
      setCopied("failed");
    }
  };

  const btn = "inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950 disabled:opacity-50";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs uppercase tracking-wider text-neutral-500">{t.activationKey}</p>
      <p className="break-all rounded-xl bg-neutral-100 px-4 py-3 font-mono text-base tracking-wide text-neutral-950 select-all">
        {key ?? <span aria-hidden>{MASK}</span>}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {key ? (
          <>
            <button type="button" onClick={copy} className={btn}>
              {copied === "ok" ? <Check size={14} weight="bold" aria-hidden /> : <Copy size={14} weight="bold" aria-hidden />}
              {copied === "ok" ? t.copied : t.copyKey}
            </button>
            <button type="button" onClick={() => { setKey(null); setCopied(null); }} className={btn}>
              <EyeSlash size={14} weight="bold" aria-hidden />
              {t.hideKey}
            </button>
          </>
        ) : (
          <button type="button" onClick={reveal} disabled={busy} aria-busy={busy} className={btn}>
            <Eye size={14} weight="bold" aria-hidden />
            {busy ? `${t.revealing}…` : t.revealKey}
          </button>
        )}
      </div>
      <p aria-live="polite" className="text-xs text-neutral-500">
        {copied === "failed" ? t.copyFailed : key ? t.keyHint : null}
      </p>
      {error && <p role="alert" className="text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}
