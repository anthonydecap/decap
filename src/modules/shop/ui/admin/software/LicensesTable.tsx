"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { formatDate } from "../../format";
import { textareaClass } from "../catalog/ui";
import { btn, Field, inputClass, Notice, StatusBadge, Table, td, th, tr } from "../primitives";
import { licenseSourceLabel } from "./labels";

export type LicenseRow = {
  id: string;
  number: string;
  status: "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED" | "REVOKED";
  licenseSource: string;
  purchasedAt: string;
  maxActivations: number;
  activeInstallations: number;
  customer: { id: string; label: string; email: string };
  product: { id: string; name: string };
  order: { id: string; number: string } | null;
};

type Target = "SUSPENDED" | "REVOKED" | "ACTIVE";
type OpenPanel = { kind: "status"; target: Target } | { kind: "max" };

const TARGET_INFO: Record<Target, { verb: string; busy: string; explain: string }> = {
  SUSPENDED: {
    verb: "Suspend",
    busy: "Suspending…",
    explain: "Active installations are suspended and the customer cannot request new activations. You can reinstate it later.",
  },
  REVOKED: {
    verb: "Revoke",
    busy: "Revoking…",
    explain: "Permanent. Installations are deactivated and open activation requests are cancelled. A revoked license cannot be reinstated.",
  },
  ACTIVE: {
    verb: "Reinstate",
    busy: "Reinstating…",
    explain: "Suspended installations become active again. Without installations the license returns to pending activation.",
  },
};

function StatusForm({ l, target, onClose }: { l: LicenseRow; target: Target; onClose: () => void }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const info = TARGET_INFO[target];

  async function submit() {
    if (!window.confirm(`${info.verb} ${l.number} for ${l.customer.label}?${target === "REVOKED" ? " This cannot be undone." : ""}`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/software/licenses/${l.id}`, { body: { status: target, reason: reason.trim() } });
      router.refresh();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-3 whitespace-normal py-2">
      <p className="font-display text-sm font-bold text-neutral-950">{info.verb} {l.number}</p>
      <p className="text-xs text-neutral-600">{info.explain}</p>
      <Field label="Reason" htmlFor={`lr-${l.id}`} help="Required. Recorded on the customer timeline and in the audit log.">
        <textarea id={`lr-${l.id}`} rows={2} className={textareaClass} value={reason} maxLength={500} onChange={(e) => setReason(e.target.value)} />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2">
        <button type="button" className={target === "ACTIVE" ? btn.primary : btn.danger} disabled={busy || reason.trim().length < 3} onClick={submit}>
          {busy ? info.busy : info.verb}
        </button>
        <button type="button" className={btn.secondary} disabled={busy} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

function MaxForm({ l, onClose }: { l: LicenseRow; onClose: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState(String(l.maxActivations));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const n = Number(value);
  const invalid = !Number.isInteger(n) || n < 1 || n > 50;

  async function submit() {
    if (n < l.activeInstallations && !window.confirm(`${l.number} has ${l.activeInstallations} active installations. Lowering the limit to ${n} does not deactivate them, but blocks new activations. Continue?`)) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/software/licenses/${l.id}`, { method: "PATCH", body: { maxActivations: n } });
      router.refresh();
      onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-sm flex-col gap-3 whitespace-normal py-2">
      <Field label="Max activations" htmlFor={`lm-${l.id}`} error={invalid ? "Between 1 and 50" : null} help={`Currently ${l.activeInstallations} active.`}>
        <input id={`lm-${l.id}`} type="number" min={1} max={50} className={`${inputClass} tabular-nums`} value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2">
        <button type="button" className={btn.primary} disabled={busy || invalid || n === l.maxActivations} onClick={submit}>{busy ? "Saving…" : "Save"}</button>
        <button type="button" className={btn.secondary} disabled={busy} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export function LicensesTable({ licenses, canWrite }: { licenses: LicenseRow[]; canWrite: boolean }) {
  const [open, setOpen] = useState<{ id: string; panel: OpenPanel } | null>(null);
  const cols = canWrite ? 8 : 7;

  function toggle(id: string, panel: OpenPanel) {
    setOpen((cur) => (cur && cur.id === id && JSON.stringify(cur.panel) === JSON.stringify(panel) ? null : { id, panel }));
  }

  return (
    <Table>
      <thead>
        <tr>
          <th className={th}>License</th>
          <th className={th}>Customer</th>
          <th className={th}>Product</th>
          <th className={th}>Status</th>
          <th className={th}>Source</th>
          <th className={th}>Purchased</th>
          <th className={`${th} text-right`}>Installations</th>
          {canWrite && <th className={`${th} text-right`}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {licenses.map((l) => (
          <Fragment key={l.id}>
            <tr className={tr}>
              <td className={td}>
                <span className="font-mono font-medium text-neutral-950">{l.number}</span>
                {l.order && (
                  <p className="text-xs">
                    <Link href={`/admin/shop/orders/${l.order.id}`} className="text-neutral-500 hover:text-neutral-950 hover:underline">{l.order.number}</Link>
                  </p>
                )}
              </td>
              <td className={`${td} max-w-[16rem]`}>
                <Link href={`/admin/shop/customers/${l.customer.id}`} className="block truncate font-medium text-neutral-950 hover:underline">{l.customer.label}</Link>
                <p className="truncate text-xs text-neutral-500">{l.customer.email}</p>
              </td>
              <td className={td}>{l.product.name}</td>
              <td className={td}><StatusBadge status={l.status} /></td>
              <td className={td}>{licenseSourceLabel(l.licenseSource)}</td>
              <td className={td}>{formatDate(l.purchasedAt)}</td>
              <td className={`${td} text-right tabular-nums`}>{l.activeInstallations} / {l.maxActivations}</td>
              {canWrite && (
                <td className={`${td} text-right`}>
                  <div className="flex flex-wrap justify-end gap-1">
                    {l.status !== "REVOKED" && (
                      <button type="button" className={btn.ghost} onClick={() => toggle(l.id, { kind: "max" })}>Edit max</button>
                    )}
                    {(l.status === "ACTIVE" || l.status === "PENDING_ACTIVATION") && (
                      <button type="button" className={btn.ghost} onClick={() => toggle(l.id, { kind: "status", target: "SUSPENDED" })}>Suspend</button>
                    )}
                    {l.status === "SUSPENDED" && (
                      <button type="button" className={btn.ghost} onClick={() => toggle(l.id, { kind: "status", target: "ACTIVE" })}>Reinstate</button>
                    )}
                    {l.status !== "REVOKED" && (
                      <button type="button" className={btn.ghost} onClick={() => toggle(l.id, { kind: "status", target: "REVOKED" })}>Revoke</button>
                    )}
                    {l.status === "REVOKED" && <span className="px-3 py-1.5 text-xs text-neutral-400">No actions</span>}
                  </div>
                </td>
              )}
            </tr>
            {open?.id === l.id && (
              <tr className="border-t border-neutral-100 bg-neutral-50">
                <td colSpan={cols} className="px-5 py-3 sm:px-6">
                  {open.panel.kind === "max" ? (
                    <MaxForm l={l} onClose={() => setOpen(null)} />
                  ) : (
                    <StatusForm key={open.panel.target} l={l} target={open.panel.target} onClose={() => setOpen(null)} />
                  )}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </Table>
  );
}
