"use client";

import { useId, useMemo, useState } from "react";
import { Plus, X } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { btn, Field, inputClass } from "../primitives";
import { ConfirmAction } from "./ConfirmAction";
import { GRANT_SOURCE_OPTIONS, SKIP_REASON_LABEL } from "./labels";

export type GrantArrangement = { id: string; sku: string; displayTitle: string };
export type GrantBundle = { id: string; sku: string; title: string; itemCount: number };
export type GrantPlayer = { id: string; name: string; maskedRegistration: string; status: string; supportsMusicLibrary: boolean };

type GrantResult = { granted: number; skipped: { arrangementId: string; title: string; reason: string }[] };

const MAX_VISIBLE = 100;

/**
 * Manual music grant (section 57): arrangements or a whole collection onto one player, with
 * a source and a reason. Never an order. Arrangements the player already has, or that do
 * not fit its type, are skipped by the server and listed afterwards.
 */
export function GrantMusic({
  customerId,
  players,
  fixedPlayerId,
  arrangements,
  bundles,
}: {
  customerId: string;
  players: GrantPlayer[];
  /** On a player page the target is that player. */
  fixedPlayerId?: string;
  arrangements: GrantArrangement[];
  bundles: GrantBundle[];
}) {
  const id = useId();
  const eligible = players.filter((p) => p.supportsMusicLibrary && p.status !== "RETIRED");
  const [playerId, setPlayerId] = useState<string>(fixedPlayerId ?? eligible[0]?.id ?? "");
  const [mode, setMode] = useState<"arrangements" | "bundle">("arrangements");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bundleId, setBundleId] = useState("");
  const [source, setSource] = useState<(typeof GRANT_SOURCE_OPTIONS)[number]["value"]>("ADMIN_GRANT");
  const [reference, setReference] = useState("");

  const byId = useMemo(() => new Map(arrangements.map((a) => [a.id, a])), [arrangements]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return arrangements.filter((a) => !selected.includes(a.id) && (a.displayTitle.toLowerCase().includes(q) || a.sku.toLowerCase().includes(q))).slice(0, MAX_VISIBLE);
  }, [arrangements, query, selected]);

  const target = fixedPlayerId ? players.find((p) => p.id === fixedPlayerId) : eligible.find((p) => p.id === playerId);
  const hasMusic = mode === "arrangements" ? selected.length > 0 : !!bundleId;
  const bundle = bundles.find((b) => b.id === bundleId);
  const count = mode === "arrangements" ? selected.length : (bundle?.itemCount ?? 0);

  return (
    <ConfirmAction
      trigger={<><Plus size={14} aria-hidden /> Add music</>}
      triggerClassName={btn.primary}
      title={target ? `Add music to ${target.name}` : "Add music"}
      description="Creates a license for the chosen player with the source and reason you give. No order or payment is created."
      confirmLabel={`I confirm ${count || "these"} arrangement${count === 1 ? "" : "s"} should be licensed${target ? ` to ${target.name}` : " to this customer, not yet on a player"} without payment.`}
      submitLabel="Add music"
      busyLabel="Adding…"
      canSubmit={hasMusic}
      onSubmit={async (reason) => {
        const r = await apiFetch<GrantResult>("/api/admin/shop/music/grants", {
          body: {
            customerId,
            playerId: fixedPlayerId ?? (playerId || null),
            ...(mode === "arrangements" ? { arrangementIds: selected } : { bundleId }),
            source,
            reason,
            ...(reference.trim() ? { reference: reference.trim() } : {}),
          },
        });
        setSelected([]);
        setBundleId("");
        setReference("");
        return (
          <span>
            {r.granted} license{r.granted === 1 ? "" : "s"} created.
            {r.skipped.length > 0 && (
              <span className="mt-1 block">
                Skipped {r.skipped.length}: {r.skipped.slice(0, 8).map((s) => `${s.title} (${SKIP_REASON_LABEL[s.reason] ?? s.reason})`).join(", ")}
                {r.skipped.length > 8 && `, and ${r.skipped.length - 8} more`}
              </span>
            )}
          </span>
        );
      }}
    >
      {!fixedPlayerId && (
        <Field
          label="Player"
          htmlFor={`${id}-player`}
          help={eligible.length === 0 ? "This customer has no player that can receive music. The music waits until one is registered." : "Only active players that can receive music are listed."}
        >
          <select id={`${id}-player`} className={inputClass} value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
            {eligible.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.maskedRegistration}
              </option>
            ))}
            <option value="">Not on a player yet (assign later)</option>
          </select>
        </Field>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-800">What to add</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name={`${id}-mode`} checked={mode === "arrangements"} onChange={() => setMode("arrangements")} />
            Arrangements
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name={`${id}-mode`} checked={mode === "bundle"} onChange={() => setMode("bundle")} disabled={bundles.length === 0} />
            A whole collection
          </label>
        </div>
      </fieldset>

      {mode === "arrangements" ? (
        <div className="flex flex-col gap-2">
          <Field label="Find arrangements" htmlFor={`${id}-q`} help="Search by title or SKU, then pick one or more.">
            <input id={`${id}-q`} type="search" className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
          </Field>
          {matches.length > 0 && (
            <ul className="max-h-56 overflow-auto rounded-xl border border-neutral-200">
              {matches.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                    onClick={() => setSelected((s) => [...s, a.id])}
                  >
                    <span className="min-w-0 truncate font-medium text-neutral-950">{a.displayTitle}</span>
                    <span className="shrink-0 text-xs text-neutral-500">{a.sku}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim() && matches.length === 0 && <p className="text-xs text-neutral-500">No arrangement matches.</p>}
          {selected.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Selected arrangements">
              {selected.map((sid) => (
                <li key={sid} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 py-0.5 pl-2.5 pr-1 text-xs font-medium text-neutral-800">
                  {byId.get(sid)?.displayTitle ?? sid}
                  <button
                    type="button"
                    className="rounded-full p-0.5 hover:bg-neutral-200"
                    aria-label={`Remove ${byId.get(sid)?.displayTitle ?? "arrangement"}`}
                    onClick={() => setSelected((s) => s.filter((x) => x !== sid))}
                  >
                    <X size={12} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <Field label="Collection" htmlFor={`${id}-bundle`} help="Every arrangement in the collection is added; ones already on the player are skipped.">
          <select id={`${id}-bundle`} className={inputClass} value={bundleId} onChange={(e) => setBundleId(e.target.value)}>
            <option value="">Choose a collection</option>
            {bundles.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.itemCount} arrangement{b.itemCount === 1 ? "" : "s"})
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Source" htmlFor={`${id}-source`}>
          <select id={`${id}-source`} className={inputClass} value={source} onChange={(e) => setSource(e.target.value as typeof source)}>
            {GRANT_SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Reference (optional)" htmlFor={`${id}-ref`} help="Ticket number, campaign or invoice.">
          <input id={`${id}-ref`} className={inputClass} maxLength={200} value={reference} onChange={(e) => setReference(e.target.value)} />
        </Field>
      </div>
    </ConfirmAction>
  );
}
