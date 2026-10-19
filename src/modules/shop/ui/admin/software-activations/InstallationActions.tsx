"use client";

import { useId, useState } from "react";
import { apiFetch } from "../../api";
import { useMutation } from "../crm/useMutation";
import { btn, Field, inputClass, Notice } from "../primitives";

type Action = "retire" | "suspend" | "reactivate";

const COPY: Record<Action, { button: string; confirm: string; busy: string; explain: string }> = {
  retire: {
    button: "Retire",
    confirm: "Retire installation",
    busy: "Retiring...",
    explain: "Retiring frees the activation slot and keeps the installation as history. It cannot be undone.",
  },
  suspend: {
    button: "Suspend",
    confirm: "Suspend installation",
    busy: "Suspending...",
    explain: "The customer can no longer reveal the key. An already activated offline copy may keep working.",
  },
  reactivate: {
    button: "Reactivate",
    confirm: "Reactivate installation",
    busy: "Reactivating...",
    explain: "The installation becomes active again and the customer can reveal its key.",
  },
};

/** Retire / suspend / reactivate one installation, each with a required reason. */
export function InstallationActions({ installationId, status, label }: { installationId: string; status: string; label: string }) {
  const id = useId();
  const { busy, error, setError, run } = useMutation();
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");

  if (status === "RETIRED") return null;
  const available: Action[] = status === "ACTIVE" ? ["suspend", "retire"] : status === "SUSPENDED" ? ["reactivate", "retire"] : ["retire"];

  async function submit() {
    if (!action) return;
    const ok = await run(() => apiFetch(`/api/admin/shop/software/installations/${installationId}`, { body: { action, reason: reason.trim() } }));
    if (ok) {
      setAction(null);
      setReason("");
    }
  }

  if (!action) {
    return (
      <div className="flex flex-wrap gap-1">
        {available.map((a) => (
          <button key={a} type="button" className={btn.ghost} onClick={() => { setError(null); setAction(a); }}>
            {COPY[a].button}
          </button>
        ))}
      </div>
    );
  }

  const c = COPY[action];
  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-neutral-950 bg-white p-4">
      <p className="text-sm text-neutral-800">
        {c.confirm} <span className="font-mono font-semibold">{label}</span>? {c.explain}
      </p>
      <Field label="Reason" htmlFor={`${id}-reason`} help="Required. Shown on the customer timeline and in the audit log.">
        <input id={`${id}-reason`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className={inputClass} autoComplete="off" />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={action === "reactivate" ? btn.primary : btn.danger} disabled={busy || reason.trim().length < 3} aria-busy={busy} onClick={submit}>
          {busy ? c.busy : c.confirm}
        </button>
        <button type="button" className={btn.ghost} disabled={busy} onClick={() => { setAction(null); setReason(""); setError(null); }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
