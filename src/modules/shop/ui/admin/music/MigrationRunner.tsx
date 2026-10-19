"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Notice, StatusBadge } from "../primitives";

type Outcome = "AUTO_ASSIGNED" | "EVIDENCE_ASSIGNED" | "NEEDS_REVIEW" | "WAITING_FOR_PLAYER" | "INCOMPATIBLE_REVIEW";

type Report = {
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  customers: { customerId: string; email: string | null; name: string; entitlements: number; alreadyLicensed: number; eligiblePlayers: number; outcomes: Record<Outcome, number>; status: string }[];
  totals: Record<Outcome, number> & { customers: number; entitlements: number; alreadyLicensed: number; licensesCreated: number };
};

const TOTALS: { key: keyof Report["totals"]; label: string }[] = [
  { key: "customers", label: "Customers" },
  { key: "entitlements", label: "Entitlements checked" },
  { key: "alreadyLicensed", label: "Already licensed" },
  { key: "AUTO_ASSIGNED", label: "Auto-assigned (one player)" },
  { key: "EVIDENCE_ASSIGNED", label: "Assigned from delivery evidence" },
  { key: "NEEDS_REVIEW", label: "Needs review" },
  { key: "INCOMPATIBLE_REVIEW", label: "Incompatible, needs review" },
  { key: "WAITING_FOR_PLAYER", label: "Waiting for a player" },
  { key: "licensesCreated", label: "Licenses created" },
];

/**
 * Runs the legacy entitlement → player license migration (section 83). Dry run first: it
 * only reports. Apply writes, and is idempotent (re-running adds nothing already done).
 */
export function MigrationRunner({ customerId, canApply }: { customerId?: string; canApply: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"dry" | "apply" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function run(dryRun: boolean) {
    setBusy(dryRun ? "dry" : "apply");
    setError(null);
    try {
      const r = await apiFetch<Report>("/api/admin/shop/music/migration", { body: { dryRun, ...(customerId ? { customerId } : {}) } });
      setReport(r);
      setConfirming(false);
      if (!dryRun) router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const changed = report ? report.customers.filter((c) => c.status !== "UP_TO_DATE") : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btn.secondary} disabled={busy !== null} aria-busy={busy === "dry"} onClick={() => run(true)}>
          {busy === "dry" ? "Running dry run…" : "Dry run"}
        </button>
        {canApply && !confirming && (
          <button type="button" className={btn.primary} disabled={busy !== null || !report?.dryRun} onClick={() => setConfirming(true)} title={report?.dryRun ? undefined : "Run a dry run first"}>
            Apply
          </button>
        )}
        {!canApply && <span className="text-sm text-neutral-500">Applying for all customers requires an administrator.</span>}
      </div>

      {confirming && (
        <div className="rounded-2xl border border-neutral-950 bg-white p-4 text-sm">
          <p className="font-display font-bold text-neutral-950">Apply the migration{customerId ? " for this customer" : " for all customers"}?</p>
          <p className="mt-1 text-neutral-600">
            Licenses are created exactly as the dry run reported. Ambiguous cases are not guessed: they stay unassigned and appear in the review queue.
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" className={btn.primary} disabled={busy !== null} aria-busy={busy === "apply"} onClick={() => run(false)}>
              {busy === "apply" ? "Applying…" : "Yes, apply"}
            </button>
            <button type="button" className={btn.ghost} onClick={() => setConfirming(false)} disabled={busy !== null}>Cancel</button>
          </div>
        </div>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {report && (
        <div className="flex flex-col gap-4">
          <Notice tone={report.dryRun ? "info" : "success"}>
            {report.dryRun ? "Dry run: nothing was written." : "Migration applied."} Finished {new Date(report.finishedAt).toLocaleString("en-GB")}.
          </Notice>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3 lg:grid-cols-5">
            {TOTALS.map((t) => (
              <div key={t.key} className="bg-white px-4 py-3">
                <dt className="text-xs text-neutral-500">{t.label}</dt>
                <dd className="mt-1 font-display text-lg font-bold tabular-nums text-neutral-950">{report.totals[t.key].toLocaleString("en-GB")}</dd>
              </div>
            ))}
          </dl>
          {changed.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-neutral-700">Per customer ({changed.length} with changes)</summary>
              <ul className="mt-2 flex flex-col divide-y divide-neutral-100">
                {changed.slice(0, 200).map((c) => (
                  <li key={c.customerId} className="flex flex-wrap items-center gap-2 py-2">
                    <Link href={`/admin/shop/music/migration?customer=${c.customerId}`} className="font-medium text-neutral-950 hover:underline">{c.name || c.email}</Link>
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-neutral-500">
                      {c.entitlements} entitlements, {c.eligiblePlayers} eligible player{c.eligiblePlayers === 1 ? "" : "s"}
                      {c.outcomes.NEEDS_REVIEW + c.outcomes.INCOMPATIBLE_REVIEW > 0 && `, ${c.outcomes.NEEDS_REVIEW + c.outcomes.INCOMPATIBLE_REVIEW} to review`}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
