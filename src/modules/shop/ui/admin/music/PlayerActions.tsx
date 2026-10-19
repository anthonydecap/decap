"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ArrowsClockwise, ArrowsLeftRight, PencilSimple, Prohibit } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";
import { ConfirmAction } from "./ConfirmAction";
import { label, LIBRARY_TRANSFER_TYPES, REPLACEMENT_POLICY_LABEL, REPLACEMENT_TYPES, RESALE_POLICY_LABEL, SKIP_REASON_LABEL, TRANSFER_TYPE_LABEL } from "./labels";

export type ActionPlayer = { id: string; name: string; maskedRegistration: string; status: string; supportsMusicLibrary: boolean };

type MoveResult = { number: string; moved: number; total: number; skipped: { arrangementId: string; reason: string }[] };

function skippedText(skipped: MoveResult["skipped"]) {
  if (!skipped.length) return "";
  const by = new Map<string, number>();
  for (const s of skipped) by.set(s.reason, (by.get(s.reason) ?? 0) + 1);
  return ` Skipped ${skipped.length}: ${[...by].map(([r, n]) => `${n} ${SKIP_REASON_LABEL[r] ?? r}`).join(", ")}.`;
}

/** Friendly name staff can correct for the customer. Empty falls back to type + registration. */
export function RenamePlayer({ playerId, friendlyName }: { playerId: string; friendlyName: string | null }) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(friendlyName ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button type="button" className={btn.ghost} onClick={() => setOpen(true)}>
        <PencilSimple size={14} aria-hidden /> {friendlyName ? "Rename" : "Add a name"}
      </button>
    );
  }
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Field label="Friendly name" htmlFor={`${id}-name`} help="What the customer calls this player, for example Living Room Piano. Leave empty to use the type and registration.">
        <input id={`${id}-name`} className={inputClass} maxLength={60} value={value} onChange={(e) => setValue(e.target.value)} />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2">
        <button
          type="button"
          className={btn.primary}
          disabled={busy}
          aria-busy={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await apiFetch(`/api/admin/shop/players/${playerId}`, { method: "PATCH", body: { friendlyName: value.trim() || null } });
              setOpen(false);
              router.refresh();
            } catch (e) {
              setError(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save name"}
        </button>
        <button type="button" className={btn.ghost} onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
      </div>
    </div>
  );
}

/** Section 40: old player RETIRED, library moves, replacement ACTIVE. One transaction on the server. */
export function ReplacePlayer({ player, candidates, customerId, replacementPolicy }: { player: ActionPlayer & { licenseCount: number }; candidates: ActionPlayer[]; customerId: string; replacementPolicy: string }) {
  const id = useId();
  const eligible = candidates.filter((p) => p.status !== "RETIRED" && p.supportsMusicLibrary);
  const [newPlayerId, setNewPlayerId] = useState(eligible[0]?.id ?? "");
  const [type, setType] = useState<(typeof REPLACEMENT_TYPES)[number]>("HARDWARE_REPLACEMENT");
  const [notes, setNotes] = useState("");
  const target = eligible.find((p) => p.id === newPlayerId);

  return (
    <ConfirmAction
      trigger={<><ArrowsClockwise size={14} aria-hidden /> Replace player</>}
      title={`Replace ${player.name}`}
      description={
        <>
          <p>
            For a failed, warranty-swapped or upgraded machine. On approval: <strong>{player.name}</strong> becomes retired, its{" "}
            {player.licenseCount} music license{player.licenseCount === 1 ? "" : "s"} move to the replacement, and the replacement becomes active.
            History and orders are kept.
          </p>
          <p className="mt-1 text-xs text-neutral-500">Replacement policy: {label(REPLACEMENT_POLICY_LABEL, replacementPolicy).toLowerCase()}. No fee is charged here.</p>
        </>
      }
      confirmLabel={target ? `I confirm ${player.name} is replaced by ${target.name} and will be retired.` : "I confirm this replacement."}
      submitLabel="Replace player"
      busyLabel="Replacing…"
      canSubmit={!!target}
      onSubmit={async (reason) => {
        const r = await apiFetch<MoveResult>(`/api/admin/shop/players/${player.id}/replace`, {
          body: { newPlayerId, type, reason, ...(notes.trim() ? { notes: notes.trim() } : {}) },
        });
        return `${r.number}: ${r.moved} of ${r.total} licenses moved to ${target?.name ?? "the replacement"}.${skippedText(r.skipped)}`;
      }}
    >
      {eligible.length === 0 ? (
        <Notice>
          The replacement must be registered to this customer first.{" "}
          <Link href={`/admin/shop/customers/${customerId}?tab=players`} className="font-semibold underline">Register it on the customer page</Link>, then come back.
        </Notice>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
            <div className="text-sm">
              <p className="text-neutral-500">Old player</p>
              <p className="font-medium text-neutral-950">{player.name}</p>
              <p className="text-xs text-neutral-500">{player.maskedRegistration}, {player.licenseCount} licenses, becomes retired</p>
            </div>
            <span className="hidden pb-2 text-neutral-400 sm:block" aria-hidden>→</span>
            <Field label="New player" htmlFor={`${id}-new`}>
              <select id={`${id}-new`} className={inputClass} value={newPlayerId} onChange={(e) => setNewPlayerId(e.target.value)}>
                {eligible.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} {p.maskedRegistration} ({p.status.toLowerCase()})</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Replacement type" htmlFor={`${id}-type`}>
              <select id={`${id}-type`} className={inputClass} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                {REPLACEMENT_TYPES.map((t) => <option key={t} value={t}>{TRANSFER_TYPE_LABEL[t]}</option>)}
              </select>
            </Field>
            <Field label="Notes (optional)" htmlFor={`${id}-notes`}>
              <input id={`${id}-notes`} className={inputClass} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
        </>
      )}
    </ConfirmAction>
  );
}

/** Section 41: MOVE licenses, or CREATE ADDITIONAL LICENSES (unpaid copies, never silent). */
export function TransferLibrary({ player, candidates, customerId, canCopy }: { player: ActionPlayer & { licenseCount: number }; candidates: ActionPlayer[]; customerId: string; canCopy: boolean }) {
  const id = useId();
  const eligible = candidates.filter((p) => p.status !== "RETIRED" && p.supportsMusicLibrary);
  const [toPlayerId, setToPlayerId] = useState(eligible[0]?.id ?? "");
  const [mode, setMode] = useState<"MOVE" | "COPY">("MOVE");
  const [type, setType] = useState<(typeof LIBRARY_TRANSFER_TYPES)[number]>("ADMIN_CORRECTION");
  const [notes, setNotes] = useState("");
  const target = eligible.find((p) => p.id === toPlayerId);

  return (
    <ConfirmAction
      trigger={<><ArrowsLeftRight size={14} aria-hidden /> Transfer library</>}
      title={`Transfer the music library of ${player.name}`}
      description={`${player.licenseCount} live license${player.licenseCount === 1 ? "" : "s"}. Arrangements the target already has or cannot play are skipped and reported.`}
      confirmLabel={
        mode === "MOVE"
          ? `I confirm the music moves from ${player.name} to ${target?.name ?? "the selected player"}.`
          : `I confirm additional, unpaid licenses are created on ${target?.name ?? "the selected player"} and attributed to me.`
      }
      submitLabel={mode === "MOVE" ? "Move licenses" : "Create additional licenses"}
      busyLabel="Transferring…"
      canSubmit={!!target}
      onSubmit={async (reason) => {
        const r = await apiFetch<MoveResult>(`/api/admin/shop/players/${player.id}/library-transfer`, {
          body: { toPlayerId, mode, type, reason, ...(notes.trim() ? { notes: notes.trim() } : {}) },
        });
        return `${r.number}: ${r.moved} of ${r.total} licenses ${mode === "MOVE" ? "moved" : "created"} on ${target?.name ?? "the target"}.${skippedText(r.skipped)}`;
      }}
    >
      {eligible.length === 0 ? (
        <Notice>
          This customer has no other active player that can receive music.{" "}
          <Link href={`/admin/shop/customers/${customerId}?tab=players`} className="font-semibold underline">Register one first</Link>. To move a player to another customer, use Transfer player.
        </Notice>
      ) : (
        <>
          <Field label="To player" htmlFor={`${id}-to`}>
            <select id={`${id}-to`} className={inputClass} value={toPlayerId} onChange={(e) => setToPlayerId(e.target.value)}>
              {eligible.map((p) => <option key={p.id} value={p.id}>{p.name} {p.maskedRegistration}</option>)}
            </select>
          </Field>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-neutral-800">Mode</legend>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" className="mt-1" name={`${id}-mode`} checked={mode === "MOVE"} onChange={() => setMode("MOVE")} />
              <span>
                <span className="font-medium text-neutral-950">Move licenses</span>
                <span className="block text-neutral-600">For a legitimate replacement or migration. The music leaves {player.name}.</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="radio" className="mt-1" name={`${id}-mode`} checked={mode === "COPY"} onChange={() => setMode("COPY")} disabled={!canCopy} />
              <span>
                <span className="font-medium text-neutral-950">Create additional licenses</span>
                <span className="block text-neutral-600">
                  The music stays on {player.name} and new licenses are created on the other player.
                  {!canCopy && " Requires the music grant permission."}
                </span>
              </span>
            </label>
          </fieldset>
          {mode === "COPY" && (
            <Notice tone="error">
              Additional licenses are not paid for. They are recorded as a customer-service grant in your name with the reason below. Use this only for goodwill, a dealer or demo unit, a migration correction or a warranty exception.
            </Notice>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor={`${id}-type`}>
              <select id={`${id}-type`} className={inputClass} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                {LIBRARY_TRANSFER_TYPES.map((t) => <option key={t} value={t}>{TRANSFER_TYPE_LABEL[t]}</option>)}
              </select>
            </Field>
            <Field label="Notes (optional)" htmlFor={`${id}-notes`}>
              <input id={`${id}-notes`} className={inputClass} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
        </>
      )}
    </ConfirmAction>
  );
}

type Match = { id: string; label: string; email: string };

/**
 * Sections 38, 39, 66: a player changes customer (SUPER_ADMIN). What happens to its music
 * comes from the central resale policy; staff only choose while it is "staff decide".
 */
export function TransferPlayerOwnership({ player, fromCustomerId, resalePolicy }: { player: ActionPlayer & { licenseCount: number }; fromCustomerId: string; resalePolicy: string }) {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [target, setTarget] = useState<Match | null>(null);
  const [libraryPolicy, setLibraryPolicy] = useState<"PLAYER_AND_LIBRARY" | "PLAYER_ONLY" | "">(resalePolicy === "ADMIN_DECIDES" ? "" : (resalePolicy as "PLAYER_AND_LIBRARY" | "PLAYER_ONLY"));
  const [type, setType] = useState<"PLAYER_RESALE" | "CUSTOMER_PLAYER_TRANSFER" | "ADMIN_CORRECTION">("PLAYER_RESALE");

  useEffect(() => {
    if (q.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      apiFetch<{ items: Match[] }>(`/api/admin/shop/customers?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => setMatches(r.items.filter((m) => m.id !== fromCustomerId)))
        .catch(() => undefined);
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, fromCustomerId]);

  const decides = resalePolicy === "ADMIN_DECIDES";

  return (
    <ConfirmAction
      trigger={<><ArrowsLeftRight size={14} aria-hidden /> Transfer player</>}
      title={`Transfer ${player.name} to another customer`}
      description="For a sale or a mistaken registration, not for replaced hardware. The original orders stay with the original customer."
      confirmLabel={target ? `I confirm ${player.name} now belongs to ${target.label}.` : "I confirm this ownership transfer."}
      submitLabel="Transfer player"
      busyLabel="Transferring…"
      reasonHelp="Recorded on both customers' timelines and in the audit log."
      canSubmit={!!target && !!libraryPolicy}
      onSubmit={async (reason) => {
        await apiFetch(`/api/admin/shop/players/${player.id}/transfer`, {
          body: { toCustomerId: target!.id, reason, type, ...(decides ? { libraryPolicy } : {}) },
        });
        router.push(`/admin/shop/players/${player.id}`);
        return `Transferred to ${target!.label}.`;
      }}
    >
      <Field label="New owner" htmlFor={`${id}-q`} help="Search by name, email or company.">
        <input
          id={`${id}-q`}
          className={inputClass}
          value={target ? `${target.label} (${target.email})` : q}
          onChange={(e) => { setTarget(null); setQ(e.target.value); }}
          autoComplete="off"
        />
      </Field>
      {!target && matches.length > 0 && q.trim().length >= 2 && (
        <ul className="-mt-2 max-h-48 overflow-auto rounded-xl border border-neutral-200">
          {matches.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => { setTarget(m); setMatches([]); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50">
                <span className="font-medium text-neutral-950">{m.label}</span> <span className="text-neutral-500">{m.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Field label="Type" htmlFor={`${id}-type`}>
        <select id={`${id}-type`} className={inputClass} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          {(["PLAYER_RESALE", "CUSTOMER_PLAYER_TRANSFER", "ADMIN_CORRECTION"] as const).map((t) => <option key={t} value={t}>{TRANSFER_TYPE_LABEL[t]}</option>)}
        </select>
      </Field>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-800">Music on this player ({player.licenseCount} license{player.licenseCount === 1 ? "" : "s"})</legend>
        {!decides && (
          <p className="text-sm text-neutral-600">
            The central resale policy is <strong>{label(RESALE_POLICY_LABEL, resalePolicy).toLowerCase()}</strong>, so this is not chosen here.
          </p>
        )}
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" className="mt-1" name={`${id}-lib`} disabled={!decides} checked={libraryPolicy === "PLAYER_AND_LIBRARY"} onChange={() => setLibraryPolicy("PLAYER_AND_LIBRARY")} />
          <span>
            <span className="font-medium text-neutral-950">Player and library</span>
            <span className="block text-neutral-600">The licenses go to the new owner. The seller can no longer use them for another player.</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" className="mt-1" name={`${id}-lib`} disabled={!decides} checked={libraryPolicy === "PLAYER_ONLY"} onChange={() => setLibraryPolicy("PLAYER_ONLY")} />
          <span>
            <span className="font-medium text-neutral-950">Player only</span>
            <span className="block text-neutral-600">The licenses on this player are retired. The new owner starts with an empty library.</span>
          </span>
        </label>
      </fieldset>
    </ConfirmAction>
  );
}

/** Retire without replacement: the player record and its history stay; live music stays on it until moved. */
export function RetirePlayer({ player, customerId, canNote }: { player: ActionPlayer & { licenseCount: number }; customerId: string; canNote: boolean }) {
  return (
    <ConfirmAction
      trigger={<><Prohibit size={14} aria-hidden /> Retire</>}
      triggerClassName={btn.danger}
      title={`Retire ${player.name}`}
      description={
        player.licenseCount > 0
          ? `This player still holds ${player.licenseCount} live license${player.licenseCount === 1 ? "" : "s"}. If the customer has a new machine, use Replace player instead so the music moves with it.`
          : "The record and its service history are kept. A retired player cannot receive music."
      }
      confirmLabel={`I confirm ${player.name} is retired.`}
      submitLabel="Retire player"
      busyLabel="Retiring…"
      reasonHelp={canNote ? "Saved as an internal note on the customer." : "The status change is audited; your role cannot add customer notes, so the reason is not stored."}
      onSubmit={async (reason) => {
        await apiFetch(`/api/admin/shop/players/${player.id}`, { method: "PATCH", body: { status: "RETIRED" } });
        if (canNote) {
          await apiFetch(`/api/admin/shop/customers/${customerId}/notes`, { body: { body: `Retired player ${player.name} ${player.maskedRegistration}. Reason: ${reason}` } }).catch(() => undefined);
        }
        return `${player.name} retired.`;
      }}
    />
  );
}
