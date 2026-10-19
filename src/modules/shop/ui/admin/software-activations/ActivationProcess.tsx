"use client";

import { useId, useState } from "react";
import { CheckCircle, Eye, EyeSlash, UserCirclePlus } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { useMutation } from "../crm/useMutation";
import { btn, Field, inputClass, Notice } from "../primitives";
import { CopyButton } from "./CopyButton";

const endpoint = (id: string) => `/api/admin/shop/software/activations/${id}`;

type ApproveProps = {
  requestId: string;
  requestLabel: string;
  registrationCode: string;
  /** Grouped for reading; the copy button copies the raw code. */
  registrationDisplay: string;
  conflict: { sameCustomer: boolean; ownerLabel: string } | null;
  canTransfer: boolean;
  slotsFull: boolean;
  players: { id: string; label: string }[];
};

/**
 * The manual activation flow (spec section 18): copy the code, run the proprietary EXE outside
 * this system, paste the key, approve. The key lives only in this form's state and is cleared
 * once submitted.
 */
export function ApproveForm({ requestId, requestLabel, registrationCode, registrationDisplay, conflict, canTransfer, slotsFull, players }: ApproveProps) {
  const id = useId();
  const { busy, error, setError, run } = useMutation();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [label, setLabel] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [retireOther, setRetireOther] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const otherCustomer = Boolean(conflict && !conflict.sameCustomer);
  const blockedByConflict = otherCustomer && (!canTransfer || !retireOther);
  const identifierValid = !identifier.trim() || identifier.trim().length >= 4;
  const ready = key.trim().length > 0 && identifierValid && !blockedByConflict;

  async function approve() {
    const ok = await run(() =>
      apiFetch(endpoint(requestId), {
        body: {
          action: "approve",
          activationKey: key.trim(),
          ...(identifier.trim() ? { registrationIdentifier: identifier.trim() } : {}),
          ...(label.trim() ? { label: label.trim() } : {}),
          ...(playerId ? { registeredPlayerId: playerId } : {}),
          ...(otherCustomer && retireOther ? { resolveConflict: "RETIRE_EXISTING" } : {}),
        },
      }),
    );
    setConfirming(false);
    if (ok) {
      setKey("");
      setShowKey(false);
      setDone(true);
    }
  }

  if (done) {
    return (
      <Notice tone="success">
        <span className="inline-flex items-center gap-2">
          <CheckCircle size={18} weight="fill" aria-hidden />
          {requestLabel} approved. The installation is active and the customer has been emailed.
        </span>
      </Notice>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (ready) setConfirming(true);
      }}
    >
      <ol className="flex flex-col gap-3 text-sm text-neutral-800">
        <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span><span className="font-semibold text-neutral-950">1.</span> Copy the registration code</span>
          <span className="flex flex-wrap items-center gap-2">
            <code className="rounded-lg bg-neutral-100 px-2.5 py-1 font-mono text-sm text-neutral-950">{registrationDisplay}</code>
            <CopyButton value={registrationCode} className={btn.ghost} />
          </span>
        </li>
        <li><span className="font-semibold text-neutral-950">2.</span> Open the proprietary registration program on the staff computer</li>
        <li><span className="font-semibold text-neutral-950">3.</span> Generate the activation key for this code</li>
        <li><span className="font-semibold text-neutral-950">4.</span> Paste the activation key below</li>
      </ol>

      <Field label="Activation key" htmlFor={`${id}-key`} help="Stored encrypted. Never shown in lists, emails or logs.">
        <div className="flex gap-2">
          <input
            id={`${id}-key`}
            type={showKey ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            maxLength={500}
            className={`${inputClass} font-mono`}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className={btn.ghost} onClick={() => setShowKey((v) => !v)} aria-label={showKey ? "Hide activation key" : "Show activation key"} aria-pressed={showKey}>
            {showKey ? <EyeSlash size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Registration identifier"
          htmlFor={`${id}-ident`}
          help={`Optional. Defaults to the registration code.`}
          error={!identifierValid ? "At least 4 characters." : null}
        >
          <input
            id={`${id}-ident`}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={registrationDisplay}
            maxLength={80}
            className={`${inputClass} font-mono`}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <Field label="Installation label" htmlFor={`${id}-label`} help="Optional, for example Studio computer.">
          <input id={`${id}-label`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={120} className={inputClass} autoComplete="off" />
        </Field>
        {players.length > 0 && (
          <Field label="Runs on player" htmlFor={`${id}-player`} help="Optional. Link the installation to one of the customer's registered players." className="sm:col-span-2">
            <select id={`${id}-player`} value={playerId} onChange={(e) => setPlayerId(e.target.value)} className={inputClass}>
              <option value="">Not linked</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {otherCustomer &&
        (canTransfer ? (
          <label className="flex items-start gap-2 rounded-xl border border-neutral-950 p-4 text-sm text-neutral-800">
            <input type="checkbox" checked={retireOther} onChange={(e) => setRetireOther(e.target.checked)} className="mt-1 accent-neutral-950" />
            <span>
              <span className="font-semibold text-neutral-950">Retire existing and approve.</span> The installation of {conflict?.ownerLabel} is retired
              (kept as history) and this registration code moves to this customer. Only do this after confirming who owns the computer.
            </span>
          </label>
        ) : (
          <Notice tone="error">
            This registration code is active for another customer. Only a super admin can retire that installation and approve. Request more
            information from the customer or ask a super admin.
          </Notice>
        ))}

      {slotsFull && (
        <Notice>All activations of this license are in use. Retire an installation or raise the activation limit before approving.</Notice>
      )}

      {error && <Notice tone="error">{error}</Notice>}

      {confirming ? (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-950 p-4">
          <p className="text-sm text-neutral-800">
            Approve {requestLabel} and activate code <span className="font-mono font-semibold">{registrationDisplay}</span>? The customer is emailed
            that their key is ready in their account.
            {conflict?.sameCustomer && " The customer's earlier installation with this code is retired."}
            {otherCustomer && " The other customer's installation is retired."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn.primary} onClick={approve} disabled={busy} aria-busy={busy}>
              {busy ? "Activating..." : "Yes, approve and activate"}
            </button>
            <button type="button" className={btn.ghost} onClick={() => setConfirming(false)} disabled={busy}>Back</button>
          </div>
        </div>
      ) : (
        <button type="submit" className={`${btn.primary} self-start`} disabled={!ready || busy}>
          <CheckCircle size={16} aria-hidden />
          Approve &amp; activate
        </button>
      )}
    </form>
  );
}

type Assignee = { id: string; label: string };

/** Start review, assignment, request info, edit code, reject. */
export function ActivationActions({
  requestId,
  requestLabel,
  status,
  registrationCode,
  assignedStaffId,
  assignedLabel,
  assignees,
  currentStaffId,
}: {
  requestId: string;
  requestLabel: string;
  status: string;
  registrationCode: string;
  assignedStaffId: string | null;
  assignedLabel: string | null;
  assignees: Assignee[];
  currentStaffId: string;
}) {
  const id = useId();
  const { busy, error, setError, run } = useMutation();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [panel, setPanel] = useState<"info" | "code" | "reject" | null>(null);
  const [message, setMessage] = useState("");
  const [code, setCode] = useState(registrationCode);
  const [reason, setReason] = useState("");

  async function send(key: string, body: Record<string, unknown>) {
    setBusyKey(key);
    const ok = await run(() => apiFetch(endpoint(requestId), { body }));
    setBusyKey(null);
    if (ok) {
      setPanel(null);
      setMessage("");
      setReason("");
    }
    return ok;
  }

  function openPanel(p: "info" | "code" | "reject") {
    setError(null);
    setMessage("");
    setReason("");
    setCode(registrationCode);
    setPanel(p);
  }

  const assigneeOptions =
    assignedStaffId && !assignees.some((a) => a.id === assignedStaffId)
      ? [{ id: assignedStaffId, label: `${assignedLabel ?? "Unknown staff"} (inactive)` }, ...assignees]
      : assignees;

  return (
    <div className="flex flex-col gap-4">
      {status === "SUBMITTED" && (
        <button type="button" className={btn.primary} disabled={busy} aria-busy={busyKey === "review"} onClick={() => send("review", { action: "start_review" })}>
          {busyKey === "review" ? "Starting..." : "Start review"}
        </button>
      )}

      <Field label="Assigned to" htmlFor={`${id}-assignee`}>
        <select
          id={`${id}-assignee`}
          value={assignedStaffId ?? ""}
          disabled={busy}
          onChange={(e) => send("assign", { action: "assign", assignedStaffId: e.target.value || null })}
          className={inputClass}
          aria-busy={busyKey === "assign"}
        >
          <option value="">Unassigned</option>
          {assigneeOptions.map((a) => (
            <option key={a.id} value={a.id}>{a.id === currentStaffId ? `${a.label} (you)` : a.label}</option>
          ))}
        </select>
        {assignedStaffId !== currentStaffId && (
          <button
            type="button"
            className={`${btn.ghost} mt-1 self-start`}
            disabled={busy}
            onClick={() => send("assign_me", { action: "assign", assignedStaffId: currentStaffId })}
          >
            <UserCirclePlus size={16} aria-hidden />
            {busyKey === "assign_me" ? "Assigning..." : "Assign to me"}
          </button>
        )}
      </Field>

      <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4">
        {panel === null && (
          <>
            <button type="button" className={btn.secondary} disabled={busy} onClick={() => openPanel("info")}>Request more information</button>
            <button type="button" className={btn.secondary} disabled={busy} onClick={() => openPanel("code")}>Edit registration code</button>
            <button type="button" className={btn.danger} disabled={busy} onClick={() => openPanel("reject")}>Reject request</button>
          </>
        )}

        {panel === "info" && (
          <div className="flex flex-col gap-3">
            <Field label="Message to the customer" htmlFor={`${id}-msg`} help="Shown in the customer's account. They are emailed that we need information.">
              <textarea id={`${id}-msg`} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4} className={inputClass} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={btn.primary}
                disabled={busy || message.trim().length < 3}
                aria-busy={busyKey === "info"}
                onClick={() => send("info", { action: "request_info", message: message.trim() })}
              >
                {busyKey === "info" ? "Sending..." : "Send request"}
              </button>
              <button type="button" className={btn.ghost} disabled={busy} onClick={() => setPanel(null)}>Cancel</button>
            </div>
          </div>
        )}

        {panel === "code" && (
          <div className="flex flex-col gap-3">
            <Field label="Registration code" htmlFor={`${id}-code`} help="Spaces and dashes are removed. Conflicts are checked again.">
              <input id={`${id}-code`} value={code} onChange={(e) => setCode(e.target.value)} maxLength={80} className={`${inputClass} font-mono`} autoComplete="off" spellCheck={false} />
            </Field>
            <Field label="Reason for the change" htmlFor={`${id}-code-reason`} help="Required. Recorded in the audit log.">
              <input id={`${id}-code-reason`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} className={inputClass} autoComplete="off" />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={btn.primary}
                disabled={busy || code.trim().length < 4 || reason.trim().length < 3}
                aria-busy={busyKey === "code"}
                onClick={() => send("code", { action: "update_code", registrationCode: code.trim(), reason: reason.trim() })}
              >
                {busyKey === "code" ? "Saving..." : "Save code"}
              </button>
              <button type="button" className={btn.ghost} disabled={busy} onClick={() => setPanel(null)}>Cancel</button>
            </div>
          </div>
        )}

        {panel === "reject" && (
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-950 p-4">
            <p className="text-sm text-neutral-800">
              Reject {requestLabel}? The customer is emailed and sees the reason in their account. They can submit a new registration code later.
            </p>
            <Field label="Reason shown to the customer" htmlFor={`${id}-reject`}>
              <textarea id={`${id}-reject`} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} rows={3} className={inputClass} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={btn.danger}
                disabled={busy || reason.trim().length < 3}
                aria-busy={busyKey === "reject"}
                onClick={() => send("reject", { action: "reject", reason: reason.trim() })}
              >
                {busyKey === "reject" ? "Rejecting..." : "Yes, reject"}
              </button>
              <button type="button" className={btn.ghost} disabled={busy} onClick={() => setPanel(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {busyKey === "assign" && <p className="text-xs text-neutral-500" role="status">Saving...</p>}
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  );
}

/** Internal notes on the request. Never shown to the customer. */
export function AdminNotes({ requestId, initial, canWrite }: { requestId: string; initial: string; canWrite: boolean }) {
  const id = useId();
  const { busy, error, run } = useMutation();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);

  if (!canWrite) {
    return initial ? <p className="whitespace-pre-wrap break-words text-sm text-neutral-800">{initial}</p> : <p className="text-sm text-neutral-400">No notes.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Field label="Internal notes" htmlFor={`${id}-notes`} help="Staff only. Never shown to the customer.">
        <textarea
          id={`${id}-notes`}
          value={value}
          onChange={(e) => { setValue(e.target.value); setSaved(false); }}
          maxLength={5000}
          rows={4}
          className={inputClass}
        />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={btn.secondary}
          disabled={busy || value === initial}
          aria-busy={busy}
          onClick={async () => {
            if (await run(() => apiFetch(endpoint(requestId), { body: { action: "note", adminNotes: value.trim() } }))) setSaved(true);
          }}
        >
          {busy ? "Saving..." : "Save notes"}
        </button>
        {saved && <span className="text-xs text-neutral-500" role="status">Saved</span>}
      </div>
    </div>
  );
}
