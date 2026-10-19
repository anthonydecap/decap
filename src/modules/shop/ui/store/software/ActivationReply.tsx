"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ApiError, apiFetch, errorMessage } from "../../api";
import { shopCopy } from "../copy";
import { inputClass } from "../ProfileForm";

/**
 * DMI asked the customer something: reply (optionally with a corrected code), or cancel
 * the activation altogether. The server re-checks ownership and state.
 */
export function ActivationReply({ lang, requestId }: { lang: string; requestId: string }) {
  const all = shopCopy(lang);
  const t = all.sw;
  const router = useRouter();
  const uid = useId();
  const [busy, setBusy] = useState<"reply" | "cancel" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const ids = { message: `${uid}-reply`, code: `${uid}-code` };

  const post = async (body: unknown, kind: "reply" | "cancel") => {
    setBusy(kind);
    setError(null);
    try {
      await apiFetch(`/api/shop/software/activations/${requestId}`, { method: "POST", body });
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const map: Record<string, string> = {};
        for (const x of err.details as { path: string; message: string }[]) {
          if (x.path === "message") map.message = x.message;
          if (x.path === "registrationCode") map.code = x.message;
        }
        setFieldErrors(map);
      }
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const message = String(f.get("message") ?? "").trim();
          const code = String(f.get("registrationCode") ?? "").trim();
          const errs: Record<string, string> = {};
          if (!message) errs.message = t.replyRequired;
          if (code && code.length < 4) errs.code = t.codeRequired;
          setFieldErrors(errs);
          if (Object.keys(errs).length) return;
          void post({ action: "respond", message, ...(code ? { registrationCode: code } : {}) }, "reply");
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.message} className="text-sm font-medium text-neutral-800">{t.yourReply}</label>
          <textarea
            id={ids.message}
            name="message"
            rows={4}
            maxLength={2000}
            className={inputClass}
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={fieldErrors.message ? `${ids.message}-error` : undefined}
          />
          {fieldErrors.message && <p id={`${ids.message}-error`} className="text-xs font-medium text-neutral-950">{fieldErrors.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.code} className="text-sm font-medium text-neutral-800">
            {t.correctedCode} <span className="font-normal text-neutral-500">({all.optional})</span>
          </label>
          <input
            id={ids.code}
            name="registrationCode"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={80}
            className={clsx(inputClass, "font-mono tracking-wide")}
            aria-invalid={fieldErrors.code ? true : undefined}
            aria-describedby={fieldErrors.code ? `${ids.code}-error` : `${ids.code}-hint`}
          />
          <p id={`${ids.code}-hint`} className="text-xs text-neutral-500">{t.correctedCodeHint}</p>
          {fieldErrors.code && <p id={`${ids.code}-error`} className="text-xs font-medium text-neutral-950">{fieldErrors.code}</p>}
        </div>
        {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
        <button
          type="submit"
          disabled={busy !== null}
          aria-busy={busy === "reply"}
          className="self-start rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy === "reply" ? `${all.sending}…` : t.sendReply}
        </button>
      </form>

      <div className="border-t border-neutral-200 pt-4">
        {confirming ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-neutral-700">{t.cancelConfirm}</p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy !== null}
                aria-busy={busy === "cancel"}
                onClick={() => void post({ action: "cancel" }, "cancel")}
                className="rounded-full border-2 border-neutral-950 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white disabled:opacity-50"
              >
                {busy === "cancel" ? `${t.cancelling}…` : t.cancelActivation}
              </button>
              <button type="button" disabled={busy !== null} onClick={() => setConfirming(false)} className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950">
                {t.hideForm}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-950 hover:decoration-neutral-950"
          >
            {t.cancelActivation}
          </button>
        )}
      </div>
    </div>
  );
}
