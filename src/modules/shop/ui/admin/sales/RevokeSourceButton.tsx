"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";

/** Revokes one entitlement source with a reason and a confirmation step. */
export function RevokeSourceButton({
  customerId,
  sourceId,
  sourceLabel,
  arrangementTitle,
  otherActiveSources,
}: {
  customerId: string;
  sourceId: string;
  sourceLabel: string;
  arrangementTitle: string;
  /** Number of other unrevoked sources for the same arrangement. */
  otherActiveSources: number;
}) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = reason.trim().length >= 3;

  function close() {
    setOpen(false);
    setConfirming(false);
    setReason("");
    setTouched(false);
    setError(null);
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/customers/${customerId}/revoke`, { body: { sourceId, reason: reason.trim() } });
      close();
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className={btn.ghost} onClick={() => setOpen(true)}>
        Revoke
      </button>
    );
  }

  return (
    <div className="mt-2 flex w-full max-w-md flex-col gap-3 rounded-xl border border-neutral-950 bg-white p-4 text-sm">
      {error && <Notice tone="error">{error}</Notice>}
      {!confirming ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (valid) setConfirming(true);
          }}
        >
          <Field
            label="Reason for revoking"
            htmlFor={`${id}-reason`}
            error={touched && !valid ? "Enter a reason of at least 3 characters." : null}
          >
            <input
              id={`${id}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              className={inputClass}
              autoFocus
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={close}>Cancel</button>
            <button type="submit" className={btn.secondary}>Continue</button>
          </div>
        </form>
      ) : (
        <>
          <p className="whitespace-normal text-neutral-800">
            Revoke the {sourceLabel.toLowerCase()} source for {arrangementTitle}?{" "}
            {otherActiveSources > 0
              ? `The customer keeps access through ${otherActiveSources} other source${otherActiveSources === 1 ? "" : "s"}.`
              : "This is the last active source, so the arrangement leaves the customer's library. Files already delivered to an offline device cannot be remotely erased."}
          </p>
          <p className="whitespace-normal text-neutral-600">Reason: {reason.trim()}</p>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={btn.ghost} onClick={() => setConfirming(false)} disabled={busy}>Back</button>
            <button type="button" className={btn.danger} onClick={submit} disabled={busy} aria-busy={busy}>
              {busy ? "Revoking..." : "Revoke source"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
