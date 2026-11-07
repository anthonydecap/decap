"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";

type Settings = { edition: "standard" | "pro"; midiOut: boolean; validUntil: string | null; dmiUserId: number | null };

/**
 * Staff actions on one licence order: the suggested settings (they end up in the decaplic
 * command), uploading the signed .decaplic, refusing. The server checks everything again.
 */
export function LicenceOrderActions({ orderId, waiting, settings }: { orderId: string; waiting: boolean; settings: Settings }) {
  const router = useRouter();
  const id = useId();
  const file = useRef<HTMLInputElement>(null);
  const [s, setS] = useState(settings);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const run = async (what: string, fn: () => Promise<string>) => {
    setBusy(what);
    setError(null);
    setDone(null);
    try {
      setDone(await fn());
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  if (!waiting) {
    return (
      <dl className="space-y-2 text-sm">
        <div><dt className="text-xs text-neutral-500">Edition</dt><dd>{settings.edition}</dd></div>
        <div><dt className="text-xs text-neutral-500">MIDI out</dt><dd>{settings.midiOut ? "yes" : "no"}</dd></div>
        <div><dt className="text-xs text-neutral-500">Valid until</dt><dd>{settings.validUntil ?? "no end date"}</dd></div>
        <div><dt className="text-xs text-neutral-500">DMI user ID</dt><dd>{settings.dmiUserId ?? "none"}</dd></div>
      </dl>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field label="Edition" htmlFor={`${id}-ed`}>
        <select id={`${id}-ed`} className={inputClass} value={s.edition} onChange={(e) => setS({ ...s, edition: e.target.value as Settings["edition"] })}>
          <option value="standard">standard</option>
          <option value="pro">pro</option>
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={s.midiOut} onChange={(e) => setS({ ...s, midiOut: e.target.checked })} />
        MIDI out
      </label>
      <Field label="Valid until (empty = no end date)" htmlFor={`${id}-until`}>
        <input id={`${id}-until`} type="date" className={inputClass} value={s.validUntil ?? ""} onChange={(e) => setS({ ...s, validUntil: e.target.value || null })} />
      </Field>
      <Field label="Old DMI user ID (empty = none)" htmlFor={`${id}-dmi`}>
        <input
          id={`${id}-dmi`}
          inputMode="numeric"
          className={inputClass}
          value={s.dmiUserId ?? ""}
          onChange={(e) => setS({ ...s, dmiUserId: e.target.value ? Number(e.target.value.replace(/\D/g, "")) || null : null })}
        />
      </Field>
      <button
        type="button"
        className={btn.secondary}
        disabled={!!busy}
        onClick={() => run("save", async () => {
          await apiFetch(`/api/admin/shop/licences/${orderId}`, { method: "PATCH", body: s });
          return "Settings saved. The command below is updated.";
        })}
      >
        {busy === "save" ? "Saving…" : "Save settings"}
      </button>

      <hr className="border-neutral-100" />
      <Field label="Signed licence (.decaplic)" htmlFor={`${id}-file`}>
        <input id={`${id}-file`} ref={file} type="file" accept=".decaplic" className="text-sm" />
      </Field>
      <button
        type="button"
        className={btn.primary}
        disabled={!!busy}
        onClick={() => run("upload", async () => {
          const f = file.current?.files?.[0];
          if (!f) throw new Error("Choose the .decaplic file first.");
          const res = await apiFetch<{ licenseId: string }>(`/api/admin/shop/licences/${orderId}/upload`, { body: { licence: await f.text() } });
          return `Licence ${res.licenseId} checked and stored. The customer has been emailed.`;
        })}
      >
        {busy === "upload" ? "Checking…" : "Upload licence"}
      </button>

      <hr className="border-neutral-100" />
      <Field label="Refuse, with a reason" htmlFor={`${id}-reason`}>
        <input id={`${id}-reason`} className={inputClass} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
      </Field>
      <button
        type="button"
        className={btn.ghost}
        disabled={!!busy || reason.trim().length < 3}
        onClick={() => run("refuse", async () => {
          await apiFetch(`/api/admin/shop/licences/${orderId}/refuse`, { body: { reason } });
          return "Order refused.";
        })}
      >
        {busy === "refuse" ? "Refusing…" : "Refuse order"}
      </button>

      {error && <Notice tone="error">{error}</Notice>}
      {done && <Notice tone="success">{done}</Notice>}
    </div>
  );
}
