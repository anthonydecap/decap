"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { formatDate } from "../../format";
import { btn, EmptyState, Field, inputClass, Notice, Panel, StatusBadge } from "../primitives";

export type PlayerCard = {
  id: string;
  /** Friendly name, or type + masked registration when the customer has not named it. */
  name: string;
  maskedRegistration: string;
  /** Live music licenses on this player; null when the viewer may not see music. */
  licenseCount: number | null;
  supportsMusicLibrary: boolean;
  typeName: string;
  registrationCode: string;
  registrationIdentifier: string;
  serialNumber: string | null;
  adminLabel: string | null;
  dealerName: string | null;
  status: string;
  purchaseDate: string | null;
  warrantyUntil: string | null;
  registeredAt: string | null;
  activatedAt: string | null;
  hasActivationKey: boolean;
};

export type PlayerTypeOption = { id: string; name: string };

/**
 * Codes are stored as letters and digits only, so that however it was typed it is one
 * registration. Shown in groups of four, the way it is printed on the player.
 */
function groupCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}

const STATUS_FLOW: Record<string, { to: string; label: string }[]> = {
  PENDING: [
    { to: "ACTIVE", label: "Mark active" },
    { to: "RETIRED", label: "Retire" },
  ],
  ACTIVE: [
    { to: "SUSPENDED", label: "Suspend" },
    { to: "RETIRED", label: "Retire" },
  ],
  SUSPENDED: [
    { to: "ACTIVE", label: "Reactivate" },
    { to: "RETIRED", label: "Retire" },
  ],
  RETIRED: [],
};

/**
 * The players a customer owns.
 *
 * Registration stays a manual, offline loop: the customer reads the registration code off
 * the player, a member of staff runs it through the EXE, and types the activation key back
 * in here. This panel records that; it never generates a key.
 */
export function CustomerPlayers({
  customerId,
  players,
  types,
  canWrite,
  canSeeActivationKey,
  extras,
}: {
  customerId: string;
  players: PlayerCard[];
  types: PlayerTypeOption[];
  canWrite: boolean;
  canSeeActivationKey: boolean;
  /** Optional server-rendered content per player id (related tickets, documents). */
  extras?: Record<string, React.ReactNode>;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <Panel
      title="Players"
      description={
        players.length
          ? `${players.length} registered player${players.length === 1 ? "" : "s"}. Retired records are kept: they are the service history of a machine.`
          : undefined
      }
      actions={
        canWrite && !adding ? (
          <button type="button" className={btn.secondary} onClick={() => setAdding(true)} disabled={types.length === 0}>
            Add player
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {canWrite && types.length === 0 && (
          <Notice>
            There are no active player types yet. Add one under Player types before registering a player.
          </Notice>
        )}
        {adding && (
          <AddPlayerForm
            customerId={customerId}
            types={types}
            canSeeActivationKey={canSeeActivationKey}
            onDone={() => setAdding(false)}
          />
        )}
        {players.length === 0 && !adding ? (
          <EmptyState
            title="No players registered"
            body="When the customer sends a registration code, add it here and record the activation key the EXE returns."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {players.map((p) => (
              <PlayerCardView
                key={p.id}
                player={p}
                canWrite={canWrite}
                canSeeActivationKey={canSeeActivationKey}
                extra={extras?.[p.id]}
              />
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

function PlayerCardView({
  player,
  canWrite,
  canSeeActivationKey,
  extra,
}: {
  player: PlayerCard;
  canWrite: boolean;
  canSeeActivationKey: boolean;
  extra?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(to: string) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/players/${player.id}`, { method: "PATCH", body: { status: to } });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-display text-base font-bold text-neutral-950">
            <Link href={`/admin/shop/players/${player.id}`} className="hover:underline">{player.name}</Link>
            {player.adminLabel && <span className="ml-2 text-sm font-normal text-neutral-500">{player.adminLabel}</span>}
          </p>
          <p className="mt-0.5 text-sm text-neutral-600">
            {player.typeName}, registration <span className="font-mono">{player.maskedRegistration}</span>
            {!player.supportsMusicLibrary
              ? ", cannot receive music"
              : player.licenseCount !== null && `, ${player.licenseCount} music license${player.licenseCount === 1 ? "" : "s"}`}
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-neutral-500">Registration</dt>
              <dd className="font-mono text-neutral-900">{groupCode(player.registrationCode)}</dd>
            </div>
            {player.registrationIdentifier !== player.registrationCode && (
              <div className="flex gap-2">
                <dt className="text-neutral-500">Identifier</dt>
                <dd className="font-mono text-neutral-900">{groupCode(player.registrationIdentifier)}</dd>
              </div>
            )}
            {player.serialNumber && (
              <div className="flex gap-2">
                <dt className="text-neutral-500">Serial</dt>
                <dd className="text-neutral-900">{player.serialNumber}</dd>
              </div>
            )}
            {player.dealerName && (
              <div className="flex gap-2">
                <dt className="text-neutral-500">Dealer</dt>
                <dd className="text-neutral-900">{player.dealerName}</dd>
              </div>
            )}
            {player.registeredAt && (
              <div className="flex gap-2">
                <dt className="text-neutral-500">Registered</dt>
                <dd className="text-neutral-900">{formatDate(player.registeredAt)}</dd>
              </div>
            )}
            {player.warrantyUntil && (
              <div className="flex gap-2">
                <dt className="text-neutral-500">Warranty until</dt>
                <dd className="text-neutral-900">{formatDate(player.warrantyUntil)}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start">
          <StatusBadge status={player.status} />
          <Link href={`/admin/shop/players/${player.id}`} className={btn.secondary}>Open</Link>
        </div>
      </div>

      {canSeeActivationKey && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <ActivationKey playerId={player.id} hasKey={player.hasActivationKey} canWrite={canWrite} />
        </div>
      )}

      {canWrite && (STATUS_FLOW[player.status] ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-neutral-100 pt-4">
          {(STATUS_FLOW[player.status] ?? []).map((a) => (
            <button key={a.to} type="button" className={btn.ghost} disabled={busy} aria-busy={busy} onClick={() => setStatus(a.to)}>
              {a.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {extra && <div className="mt-4 border-t border-neutral-100 pt-4">{extra}</div>}
    </li>
  );
}

/**
 * The key is never sent with the page. It is fetched on demand, which is also what makes
 * the reveal auditable: one request, one staff member, one entry in the log.
 */
export function ActivationKey({ playerId, hasKey, canWrite }: { playerId: string; hasKey: boolean; canWrite: boolean }) {
  const router = useRouter();
  const id = useId();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [entering, setEntering] = useState(false);
  const [draft, setDraft] = useState("");

  async function reveal() {
    setBusy(true);
    setError(null);
    try {
      const data = await apiFetch<{ activationKey: string }>(`/api/admin/shop/players/${playerId}/activation-key`, { body: {} });
      setRevealed(data.activationKey);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/players/${playerId}`, { method: "PATCH", body: { activationKey: draft.trim() } });
      setEntering(false);
      setDraft("");
      setRevealed(null);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">Activation key</p>
      {error && <Notice tone="error">{error}</Notice>}
      {entering ? (
        <div className="flex max-w-md flex-col gap-3">
          <Field label="Key from the EXE" htmlFor={`${id}-key`} help="Stored encrypted. Revealing it later is recorded.">
            <input
              id={`${id}-key`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={128}
              className={inputClass}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <div className="flex gap-2">
            <button type="button" className={btn.primary} disabled={busy || draft.trim().length < 4} aria-busy={busy} onClick={save}>
              {busy ? "Saving…" : "Save key"}
            </button>
            <button type="button" className={btn.ghost} disabled={busy} onClick={() => setEntering(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-sm text-neutral-900">
            {revealed ?? (hasKey ? "••••-••••-••••-••••" : "Not recorded yet")}
          </code>
          {hasKey && !revealed && (
            <button type="button" className={btn.ghost} disabled={busy} aria-busy={busy} onClick={reveal}>
              {busy ? "Revealing…" : "Reveal"}
            </button>
          )}
          {revealed && (
            <>
              <button
                type="button"
                className={btn.ghost}
                onClick={async () => {
                  await navigator.clipboard.writeText(revealed);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button type="button" className={btn.ghost} onClick={() => setRevealed(null)}>
                Hide
              </button>
            </>
          )}
          {canWrite && (
            <button type="button" className={btn.ghost} onClick={() => setEntering(true)}>
              {hasKey ? "Replace" : "Enter key"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddPlayerForm({
  customerId,
  types,
  canSeeActivationKey,
  onDone,
}: {
  customerId: string;
  types: PlayerTypeOption[];
  canSeeActivationKey: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const id = useId();
  const [playerTypeId, setPlayerTypeId] = useState(types[0]?.id ?? "");
  const [registrationCode, setRegistrationCode] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [adminLabel, setAdminLabel] = useState("");
  const [dealerName, setDealerName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyUntil, setWarrantyUntil] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const codeValid = registrationCode.trim().length >= 4;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!codeValid || !playerTypeId) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/customers/${customerId}/players`, {
        body: {
          playerTypeId,
          registrationCode: registrationCode.trim(),
          ...(serialNumber.trim() ? { serialNumber: serialNumber.trim() } : {}),
          ...(adminLabel.trim() ? { adminLabel: adminLabel.trim() } : {}),
          ...(dealerName.trim() ? { dealerName: dealerName.trim() } : {}),
          ...(purchaseDate ? { purchaseDate } : {}),
          ...(warrantyUntil ? { warrantyUntil } : {}),
          ...(activationKey.trim() ? { activationKey: activationKey.trim() } : {}),
        },
      });
      onDone();
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="flex flex-col gap-4 rounded-2xl border border-neutral-300 bg-neutral-50 p-4 sm:p-5" onSubmit={submit} noValidate>
      <p className="text-sm text-neutral-600">
        Enter the registration code the customer gave you. Leave the activation key empty until the EXE has produced
        one; the player then stays pending.
      </p>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Player type" htmlFor={`${id}-type`}>
          <select id={`${id}-type`} value={playerTypeId} onChange={(e) => setPlayerTypeId(e.target.value)} className={inputClass}>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Registration code"
          htmlFor={`${id}-code`}
          help="Stored without spaces and in capitals."
          error={touched && !codeValid ? "Enter the code from the player." : null}
        >
          <input
            id={`${id}-code`}
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value)}
            maxLength={64}
            className={`${inputClass} font-mono`}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <Field label="Serial number (optional)" htmlFor={`${id}-serial`}>
          <input id={`${id}-serial`} value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} maxLength={80} className={inputClass} />
        </Field>
        <Field label="Label (optional)" htmlFor={`${id}-label`} help="For staff, for example “workshop spare”.">
          <input id={`${id}-label`} value={adminLabel} onChange={(e) => setAdminLabel(e.target.value)} maxLength={120} className={inputClass} />
        </Field>
        <Field label="Dealer (optional)" htmlFor={`${id}-dealer`}>
          <input id={`${id}-dealer`} value={dealerName} onChange={(e) => setDealerName(e.target.value)} maxLength={120} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Purchased" htmlFor={`${id}-bought`}>
            <input id={`${id}-bought`} type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Warranty until" htmlFor={`${id}-warranty`}>
            <input id={`${id}-warranty`} type="date" value={warrantyUntil} onChange={(e) => setWarrantyUntil(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>
      {canSeeActivationKey && (
        <Field label="Activation key (optional)" htmlFor={`${id}-key`} help="If you already have it, the player is marked active straight away.">
          <input
            id={`${id}-key`}
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value)}
            maxLength={128}
            className={`${inputClass} font-mono`}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className={btn.ghost} onClick={onDone} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className={btn.primary} disabled={busy} aria-busy={busy}>
          {busy ? "Registering…" : "Register player"}
        </button>
      </div>
    </form>
  );
}
