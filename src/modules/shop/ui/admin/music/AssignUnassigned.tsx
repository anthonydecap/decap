"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { formatDate } from "../../format";
import { btn, EmptyState, Field, inputClass, Notice, StatusBadge } from "../primitives";
import { label, LICENSE_SOURCE_LABEL, SKIP_REASON_LABEL } from "./labels";

export type UnassignedLicense = {
  id: string;
  title: string;
  sku: string;
  needsReview: boolean;
  statusReason: string | null;
  source: string;
  createdAt: string;
};

export type AssignTarget = { id: string; name: string; maskedRegistration: string };

type AssignResult = { assigned: number; skipped: { licenseId: string; title: string; reason: string }[] };

/**
 * Music that is not on a player yet (legacy purchases, bought for later, ambiguous
 * migrations). Staff pick the licenses and the player; the server checks the player is
 * the customer's, active and compatible, and reports what it skipped.
 */
export function AssignUnassigned({ licenses, players }: { licenses: UnassignedLicense[]; players: AssignTarget[] }) {
  const router = useRouter();
  const id = useId();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(licenses.filter((l) => l.needsReview).map((l) => l.id)));
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [reason, setReason] = useState("Legacy music review");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const allSelected = licenses.length > 0 && selected.size === licenses.length;
  const target = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);

  if (licenses.length === 0) {
    return <EmptyState title="Nothing waiting" body="All of this customer's music is on a player." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {result && <Notice tone="success">{result}</Notice>}
      {players.length === 0 ? (
        <Notice>
          This customer has no active player that can receive music. The music waits and lands automatically when their only eligible player is activated.
        </Notice>
      ) : (
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Field label="Assign selected to" htmlFor={`${id}-player`}>
            <select id={`${id}-player`} className={inputClass} value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name} {p.maskedRegistration}</option>)}
            </select>
          </Field>
          <Field label="Reason" htmlFor={`${id}-reason`}>
            <input id={`${id}-reason`} className={inputClass} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <button
            type="button"
            className={btn.primary}
            disabled={busy || selected.size === 0 || !target || !confirmed || reason.trim().length < 3}
            aria-busy={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              setResult(null);
              try {
                const r = await apiFetch<AssignResult>("/api/admin/shop/music/assign", { body: { licenseIds: [...selected], playerId, reason: reason.trim() } });
                setResult(
                  `${r.assigned} assigned to ${target?.name}.` +
                    (r.skipped.length ? ` Skipped ${r.skipped.length}: ${r.skipped.slice(0, 6).map((s) => `${s.title} (${SKIP_REASON_LABEL[s.reason] ?? s.reason})`).join(", ")}${r.skipped.length > 6 ? ", and more" : ""}.` : ""),
                );
                setSelected(new Set());
                setConfirmed(false);
                router.refresh();
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Assigning…" : `Assign ${selected.size}`}
          </button>
          <label className="flex items-start gap-2 text-sm text-neutral-800 md:col-span-3">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-neutral-300" />
            I confirm the selected music belongs on {target?.name ?? "this player"}. Once assigned, moving it is a staff transfer.
          </label>
        </div>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? new Set() : new Set(licenses.map((l) => l.id)))}
                  className="h-4 w-4 rounded border-neutral-300"
                />
              </th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-medium text-neutral-500">Arrangement</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-medium text-neutral-500">State</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-medium text-neutral-500">Source</th>
              <th className="whitespace-nowrap px-3 py-2 text-xs font-medium text-neutral-500">Since</th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((l) => (
              <tr key={l.id} className="border-t border-neutral-100">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label={`Select ${l.title}`}
                    checked={selected.has(l.id)}
                    onChange={() =>
                      setSelected((s) => {
                        const n = new Set(s);
                        if (n.has(l.id)) n.delete(l.id);
                        else n.add(l.id);
                        return n;
                      })
                    }
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                </td>
                <td className="max-w-[18rem] px-3 py-2">
                  <p className="truncate font-medium text-neutral-950">{l.title}</p>
                  <p className="text-xs text-neutral-500">{l.sku}</p>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={l.needsReview ? "NEEDS_REVIEW" : "UNASSIGNED"} />
                  {l.statusReason && <p className="mt-0.5 max-w-[16rem] truncate text-xs text-neutral-500" title={l.statusReason}>{l.statusReason}</p>}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-neutral-700">{label(LICENSE_SOURCE_LABEL, l.source)}</td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums text-neutral-700">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
