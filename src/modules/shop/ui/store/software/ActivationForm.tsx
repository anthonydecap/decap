"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ArrowsClockwise, Plus } from "@phosphor-icons/react";
import { ApiError, apiFetch, errorMessage } from "../../api";
import { shopCopy } from "../copy";
import { inputClass } from "../ProfileForm";
import { accountSoftwarePath } from "./links";

export type ComputerOption = { id: string; label: string };

type FormProps = {
  lang: string;
  slug: string;
  licenseId: string;
  productName: string;
  instructions: string | null;
  computers: ComputerOption[];
  /** "required": every activation is in use; "optional": the customer may say what it replaces. */
  replace: "none" | "optional" | "required";
  title?: string;
  intro?: string;
  onCancel?: () => void;
};

/**
 * The customer pastes the Registration Code shown by the installed software. On success the
 * page reloads with `?submitted=<license>` so the server shows the confirmation.
 */
export function ActivationForm(props: FormProps) {
  const t = shopCopy(props.lang).sw;
  const router = useRouter();
  const uid = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const ids = { code: `${uid}-code`, message: `${uid}-message`, replaces: `${uid}-replaces` };

  const errorFor = (name: keyof typeof ids) =>
    fieldErrors[name] ? <p id={`${ids[name]}-error`} className="text-xs font-medium text-neutral-950">{fieldErrors[name]}</p> : null;
  const describe = (name: keyof typeof ids, hint?: boolean) =>
    fieldErrors[name] ? `${ids[name]}-error` : hint ? `${ids[name]}-hint` : undefined;

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const code = String(f.get("registrationCode") ?? "").trim();
        const message = String(f.get("message") ?? "").trim();
        const replaces = String(f.get("replacesInstallationId") ?? "");
        const errs: Record<string, string> = {};
        if (code.length < 4) errs.code = t.codeRequired;
        if (props.replace === "required" && !replaces) errs.replaces = t.replaceRequired;
        setFieldErrors(errs);
        if (Object.keys(errs).length) return;
        setBusy(true);
        setError(null);
        try {
          await apiFetch(`/api/shop/software/licenses/${props.licenseId}/activation`, {
            method: "POST",
            body: { registrationCode: code, message: message || null, replacesInstallationId: replaces || null },
          });
          router.replace(`${accountSoftwarePath(props.lang, props.slug)}?submitted=${props.licenseId}`);
          router.refresh();
        } catch (err) {
          if (err instanceof ApiError && Array.isArray(err.details)) {
            const map: Record<string, string> = {};
            for (const x of err.details as { path: string; message: string }[]) {
              if (x.path === "registrationCode") map.code = x.message;
              else if (x.path === "message") map.message = x.message;
              else if (x.path === "replacesInstallationId") map.replaces = x.message;
            }
            setFieldErrors(map);
          }
          setError(errorMessage(err));
          setBusy(false);
        }
      }}
    >
      {(props.title || props.intro) && (
        <div>
          {props.title && <h3 className="font-display text-lg font-bold text-neutral-950">{props.title}</h3>}
          {props.intro && <p className="mt-1 text-sm text-neutral-600">{props.intro}</p>}
        </div>
      )}
      <p className="whitespace-pre-line rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
        {props.instructions?.trim() || t.genericInstructions(props.productName)}
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor={ids.code} className="text-sm font-medium text-neutral-800">{t.registrationCode}</label>
        <input
          id={ids.code}
          name="registrationCode"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={80}
          className={clsx(inputClass, "font-mono tracking-wide")}
          aria-invalid={fieldErrors.code ? true : undefined}
          aria-describedby={describe("code", true)}
        />
        <p id={`${ids.code}-hint`} className="text-xs text-neutral-500">{t.registrationCodeHint}</p>
        {errorFor("code")}
      </div>

      {props.replace !== "none" && props.computers.length > 0 && (
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.replaces} className="text-sm font-medium text-neutral-800">{t.replacesLabel}</label>
          <select
            id={ids.replaces}
            name="replacesInstallationId"
            defaultValue=""
            className={inputClass}
            aria-invalid={fieldErrors.replaces ? true : undefined}
            aria-describedby={describe("replaces", true)}
          >
            {props.replace === "required"
              ? <option value="" disabled>{t.replacesChoose}</option>
              : <option value="">{t.replacesNone}</option>}
            {props.computers.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <p id={`${ids.replaces}-hint`} className="text-xs text-neutral-500">
            {props.replace === "required" ? t.replacesHintFull : t.replacesHint}
          </p>
          {errorFor("replaces")}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor={ids.message} className="text-sm font-medium text-neutral-800">
          {t.messageForDmi} <span className="font-normal text-neutral-500">({shopCopy(props.lang).optional})</span>
        </label>
        <textarea
          id={ids.message}
          name="message"
          rows={3}
          maxLength={2000}
          className={inputClass}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={describe("message", true)}
        />
        <p id={`${ids.message}-hint`} className="text-xs text-neutral-500">{t.messageForDmiHint}</p>
        {errorFor("message")}
      </div>

      <div className="flex flex-col gap-4">
        {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? `${t.submitting}…` : t.submitActivation}
          </button>
          {props.onCancel && (
            <button type="button" onClick={props.onCancel} disabled={busy} className="rounded-full px-4 py-3 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950">
              {t.hideForm}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

/** Licensed: "Replace a computer" and, when an activation is free, "Activate another computer". */
export function ComputerChange(props: Omit<FormProps, "replace" | "title" | "intro" | "onCancel"> & { canAdd: boolean }) {
  const t = shopCopy(props.lang).sw;
  const [mode, setMode] = useState<"replace" | "add" | null>(null);
  const canReplace = props.computers.length > 0;
  if (!canReplace && !props.canAdd) return null;

  if (mode) {
    return (
      <div className="rounded-2xl border border-neutral-200 p-5 sm:p-6">
        <ActivationForm
          {...props}
          replace={mode === "replace" ? "required" : "none"}
          title={mode === "replace" ? t.replaceComputer : t.addComputer}
          intro={mode === "replace" ? t.replaceIntro : undefined}
          onCancel={() => setMode(null)}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {canReplace && (
        <button type="button" onClick={() => setMode("replace")} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950">
          <ArrowsClockwise size={14} weight="bold" aria-hidden />
          {t.replaceComputer}
        </button>
      )}
      {props.canAdd && (
        <button type="button" onClick={() => setMode("add")} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950">
          <Plus size={14} weight="bold" aria-hidden />
          {t.addComputer}
        </button>
      )}
    </div>
  );
}
