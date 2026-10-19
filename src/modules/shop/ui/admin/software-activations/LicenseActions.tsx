"use client";

import { useId, useState } from "react";
import { apiFetch } from "../../api";
import { useMutation } from "../crm/useMutation";
import { btn, Field, inputClass, Notice } from "../primitives";

type Target = "ACTIVE" | "SUSPENDED" | "REVOKED";

const COPY: Record<Target, { button: string; confirm: string; busy: string; explain: string }> = {
  SUSPENDED: {
    button: "Suspend",
    confirm: "Suspend license",
    busy: "Suspending...",
    explain: "Active installations are suspended with it and no new activations can be approved. Already activated offline copies may keep working.",
  },
  REVOKED: {
    button: "Revoke",
    confirm: "Revoke license",
    busy: "Revoking...",
    explain:
      "Revoking is final: installations are deactivated, open activation requests are cancelled and future activation is blocked. Already activated offline copies may keep working. History is kept.",
  },
  ACTIVE: {
    button: "Reinstate",
    confirm: "Reinstate license",
    busy: "Reinstating...",
    explain: "Suspended installations become active again.",
  },
};

/** License status changes (with a reason) and the activation limit. */
export function LicenseActions({
  licenseId,
  licenseLabel,
  status,
  maxActivations,
  activeInstallations,
}: {
  licenseId: string;
  licenseLabel: string;
  status: string;
  maxActivations: number;
  activeInstallations: number;
}) {
  const id = useId();
  const { busy, error, setError, run } = useMutation();
  const [target, setTarget] = useState<Target | null>(null);
  const [reason, setReason] = useState("");
  const [editingMax, setEditingMax] = useState(false);
  const [max, setMax] = useState(String(maxActivations));

  if (status === "REVOKED") return <p className="text-xs text-neutral-500">Revoked licenses cannot change. Add a new license instead.</p>;

  const targets: Target[] = status === "SUSPENDED" ? ["ACTIVE", "REVOKED"] : ["SUSPENDED", "REVOKED"];
  const maxNumber = Number(max);
  const maxValid = Number.isInteger(maxNumber) && maxNumber >= 1 && maxNumber <= 50;

  function reset() {
    setTarget(null);
    setReason("");
    setEditingMax(false);
    setMax(String(maxActivations));
    setError(null);
  }

  async function submitStatus() {
    if (!target) return;
    const ok = await run(() => apiFetch(`/api/admin/shop/software/licenses/${licenseId}`, { body: { status: target, reason: reason.trim() } }));
    if (ok) reset();
  }

  async function submitMax() {
    const ok = await run(() => apiFetch(`/api/admin/shop/software/licenses/${licenseId}`, { method: "PATCH", body: { maxActivations: maxNumber } }));
    if (ok) setEditingMax(false);
  }

  if (target) {
    const c = COPY[target];
    return (
      <div className="flex w-full max-w-lg flex-col gap-3 rounded-xl border border-neutral-950 bg-white p-4">
        <p className="text-sm text-neutral-800">
          {c.confirm} <span className="font-semibold">{licenseLabel}</span>? {c.explain}
        </p>
        <Field label="Reason" htmlFor={`${id}-reason`} help="Required. Shown on the customer timeline and in the audit log.">
          <input id={`${id}-reason`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className={inputClass} autoComplete="off" />
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={target === "ACTIVE" ? btn.primary : btn.danger} disabled={busy || reason.trim().length < 3} aria-busy={busy} onClick={submitStatus}>
            {busy ? c.busy : c.confirm}
          </button>
          <button type="button" className={btn.ghost} disabled={busy} onClick={reset}>Cancel</button>
        </div>
      </div>
    );
  }

  if (editingMax) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <Field
          label="Maximum activations"
          htmlFor={`${id}-max`}
          help={`${activeInstallations} active now. Between 1 and 50.`}
          error={!maxValid ? "Enter a whole number between 1 and 50." : null}
        >
          <input id={`${id}-max`} type="number" min={1} max={50} value={max} onChange={(e) => setMax(e.target.value)} className={inputClass} />
        </Field>
        {maxValid && maxNumber < activeInstallations && (
          <Notice>This is lower than the number of active installations. Existing installations stay active; new approvals are blocked until one is retired.</Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn.primary} disabled={busy || !maxValid || maxNumber === maxActivations} aria-busy={busy} onClick={submitMax}>
            {busy ? "Saving..." : "Save limit"}
          </button>
          <button type="button" className={btn.ghost} disabled={busy} onClick={reset}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {targets.map((t) => (
        <button key={t} type="button" className={btn.ghost} onClick={() => { setError(null); setTarget(t); }}>
          {COPY[t].button}
        </button>
      ))}
      <button type="button" className={btn.ghost} onClick={() => { setError(null); setEditingMax(true); }}>
        Edit activation limit
      </button>
    </div>
  );
}
