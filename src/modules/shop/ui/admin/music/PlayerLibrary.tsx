"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ClockCounterClockwise, X } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { formatDate, formatDateTime, formatMoney } from "../../format";
import { btn, EmptyState, inputClass, Notice, StatusBadge, Table, td, th, tr } from "../primitives";
import { ConfirmAction } from "./ConfirmAction";
import { EVENT_LABEL, label, LICENSE_SOURCE_LABEL, TRANSFER_TYPE_LABEL } from "./labels";

type LicenseRow = {
  id: string;
  status: string;
  licenseSource: string;
  createdAt: string;
  activatedAt: string | null;
  retiredAt: string | null;
  revokedAt: string | null;
  statusReason: string | null;
  reason: string | null;
  pricePaidCents: number | null;
  currency: string | null;
  orderId: string | null;
  orderNumber: string | null;
  grantedBy: { displayName: string | null; email: string | null } | null;
  arrangement: { id: string; sku: string; displayTitle: string; work: { originalArtist: string | null } | null };
};

type Page = { total: number; page: number; pages: number; items: LicenseRow[] };

type HistoryEvent = {
  id: string;
  type: string;
  reason: string | null;
  createdAt: string;
  fromPlayerId: string | null;
  toPlayerId: string | null;
  musicLicenseId: string;
  staff: { displayName: string | null; email: string | null } | null;
  transfer: { id: string; number: number; type: string } | null;
};

const STATUS_FILTERS = [
  { value: "live", label: "Live" },
  { value: "all", label: "All" },
  { value: "RETIRED", label: "Retired" },
  { value: "REVOKED", label: "Revoked" },
] as const;

/**
 * The music library of one player, server-side searched and paged (a player can hold
 * thousands of arrangements). Each row opens its full lineage history; staff with
 * `music:revoke` can end a license with a reason.
 */
export function PlayerLibrary({
  playerId,
  playerNames,
  canRevoke,
  canSeeOrders,
}: {
  playerId: string;
  /** Names of players this customer knows, for reading history events. */
  playerNames: Record<string, string>;
  canRevoke: boolean;
  canSeeOrders: boolean;
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("live");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  /** Which request the shown data answers; loading while it differs from the current one. */
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const requestKey = `${playerId}|${status}|${page}|${query}|${reload}`;
  const loading = loadedKey !== requestKey;
  const [historyFor, setHistoryFor] = useState<LicenseRow | null>(null);
  const [revoking, setRevoking] = useState<LicenseRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ status, page: String(page), ...(query ? { q: query } : {}) });
    apiFetch<Page>(`/api/admin/shop/players/${playerId}/licenses?${params}`, { signal: ctrl.signal })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => { if (!ctrl.signal.aborted) setError(errorMessage(e)); })
      .finally(() => { if (!ctrl.signal.aborted) setLoadedKey(requestKey); });
    return () => ctrl.abort();
  }, [playerId, status, page, query, reload, requestKey]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={`${id}-q`} className="sr-only">Search this library</label>
          <input
            id={`${id}-q`}
            type="search"
            placeholder="Search title, SKU or artist"
            className={inputClass}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="License status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={status === f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={
                status === f.value
                  ? "rounded-full border border-neutral-950 bg-neutral-950 px-3 py-1 text-sm font-semibold text-white"
                  : "rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm text-neutral-700 transition hover:border-neutral-950"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {revoking && (
        <ConfirmAction
          key={revoking.id}
          defaultOpen
          trigger="Revoke"
          title={`Revoke ${revoking.arrangement.displayTitle}`}
          description="The license ends on this player and new deliveries stop. Files already on the player cannot be erased remotely. History is kept; a revoked license cannot be reactivated here."
          confirmLabel="I confirm this license should be revoked."
          submitLabel="Revoke license"
          busyLabel="Revoking…"
          onClose={() => setRevoking(null)}
          onSubmit={async (reason) => {
            await apiFetch(`/api/admin/shop/music/licenses/${revoking.id}/revoke`, { body: { reason } });
            setReload((n) => n + 1);
            return `${revoking.arrangement.displayTitle} revoked.`;
          }}
        />
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {data && data.items.length === 0 && !loading ? (
        <EmptyState
          title={query || status !== "live" ? "No licenses match" : "No music on this player"}
          body={query || status !== "live" ? "Try another search or status." : "Purchases, grants and transfers for this player appear here."}
        />
      ) : (
        <div aria-busy={loading} className={loading && data ? "opacity-60 transition" : undefined}>
          <Table>
            <thead>
              <tr>
                <th className={th}>Arrangement</th>
                <th className={th}>Status</th>
                <th className={th}>Source</th>
                <th className={th}>Since</th>
                <th className={th}>Order / granted by</th>
                <th className={th}><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((l) => {
                const live = l.status === "ACTIVE" || l.status === "TRANSFER_PENDING";
                return (
                  <tr key={l.id} className={tr}>
                    <td className={`${td} max-w-[18rem]`}>
                      <p className="truncate font-medium text-neutral-950">{l.arrangement.displayTitle}</p>
                      <p className="truncate text-xs text-neutral-500">
                        {l.arrangement.sku}
                        {l.arrangement.work?.originalArtist && `, ${l.arrangement.work.originalArtist}`}
                      </p>
                    </td>
                    <td className={td}>
                      <StatusBadge status={l.status} />
                      {l.statusReason && !live && <p className="mt-0.5 max-w-[12rem] truncate text-xs text-neutral-500" title={l.statusReason}>{l.statusReason}</p>}
                    </td>
                    <td className={td}>{label(LICENSE_SOURCE_LABEL, l.licenseSource)}</td>
                    <td className={`${td} tabular-nums`}>{formatDate(l.activatedAt ?? l.createdAt)}</td>
                    <td className={`${td} max-w-[14rem]`}>
                      {l.orderId && l.orderNumber ? (
                        <span className="flex flex-col">
                          {canSeeOrders ? (
                            <Link href={`/admin/shop/orders/${l.orderId}`} className="font-medium text-neutral-950 hover:underline">{l.orderNumber}</Link>
                          ) : (
                            <span>{l.orderNumber}</span>
                          )}
                          {l.pricePaidCents != null && <span className="text-xs tabular-nums text-neutral-500">{formatMoney(l.pricePaidCents, l.currency ?? "EUR")}</span>}
                        </span>
                      ) : l.grantedBy ? (
                        <span className="flex flex-col">
                          <span className="truncate">{l.grantedBy.displayName ?? l.grantedBy.email}</span>
                          {l.reason && <span className="truncate text-xs text-neutral-500" title={l.reason}>{l.reason}</span>}
                        </span>
                      ) : (
                        <span className="text-neutral-400">None</span>
                      )}
                    </td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-1">
                        <button type="button" className={btn.ghost} onClick={() => setHistoryFor(l)}>
                          <ClockCounterClockwise size={14} aria-hidden /> History
                        </button>
                        {canRevoke && live && (
                          <button type="button" className={btn.ghost} onClick={() => setRevoking(l)}>
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {data && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <span>
            {data.total.toLocaleString("en-GB")} license{data.total === 1 ? "" : "s"}
            {data.pages > 1 && `, page ${data.page} of ${data.pages}`}
          </span>
          {data.pages > 1 && (
            <div className="flex gap-2">
              <button type="button" className={btn.secondary} disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button type="button" className={btn.secondary} disabled={page >= data.pages || loading} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {historyFor && <HistoryDrawer license={historyFor} playerNames={playerNames} onClose={() => setHistoryFor(null)} />}
    </div>
  );
}

/** Side drawer with the full lineage of one license (purchase, moves, replacement, revocation). */
export function HistoryDrawer({
  license,
  playerNames,
  onClose,
}: {
  license: { id: string; arrangement: { displayTitle: string } };
  playerNames: Record<string, string>;
  onClose: () => void;
}) {
  const [events, setEvents] = useState<HistoryEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    apiFetch<{ events: HistoryEvent[] }>(`/api/admin/shop/music/licenses/${license.id}/history`, { signal: ctrl.signal })
      .then((r) => setEvents(r.events))
      .catch((e) => { if (!ctrl.signal.aborted) setError(errorMessage(e)); });
    return () => ctrl.abort();
  }, [license.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const playerName = (pid: string | null) => (pid ? (playerNames[pid] ?? "another player") : null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-labelledby={`history-${license.id}`}>
      <button type="button" className="absolute inset-0 bg-neutral-950/30" aria-label="Close history" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-500">License history</p>
            <h2 id={`history-${license.id}`} className="font-display text-lg font-bold text-neutral-950">{license.arrangement.displayTitle}</h2>
          </div>
          <button type="button" className={btn.ghost} onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="mt-6">
          {error && <Notice tone="error">{error}</Notice>}
          {!events && !error && <p className="text-sm text-neutral-500">Loading…</p>}
          {events && events.length === 0 && <p className="text-sm text-neutral-500">No events recorded.</p>}
          {events && events.length > 0 && (
            <ol className="flex flex-col gap-4 border-l border-neutral-200 pl-4">
              {events.map((e) => {
                const from = playerName(e.fromPlayerId);
                const to = playerName(e.toPlayerId);
                return (
                  <li key={e.id} className="text-sm">
                    <p className="text-xs tabular-nums text-neutral-500">{formatDateTime(e.createdAt)}</p>
                    <p className="font-medium text-neutral-950">
                      {label(EVENT_LABEL, e.type)}
                      {e.transfer && <span className="font-normal text-neutral-600"> (TRF-{e.transfer.number}, {label(TRANSFER_TYPE_LABEL, e.transfer.type).toLowerCase()})</span>}
                    </p>
                    {(from || to) && (
                      <p className="text-neutral-700">
                        {from && to && from !== to ? `${from} → ${to}` : (to ?? from)}
                      </p>
                    )}
                    {e.staff && <p className="text-xs text-neutral-500">By {e.staff.displayName ?? e.staff.email}</p>}
                    {e.reason && <p className="text-xs text-neutral-600">Reason: {e.reason}</p>}
                    {e.musicLicenseId !== license.id && <p className="text-xs text-neutral-400">Earlier or later license in the same lineage</p>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
