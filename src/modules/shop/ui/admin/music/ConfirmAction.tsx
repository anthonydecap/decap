"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { errorMessage } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";

/**
 * One sensitive staff action: opens inline, asks for a written reason and an explicit
 * confirmation, then runs. The server re-checks permission and validates everything; this
 * only makes sure nobody clicks through by accident.
 */
export function ConfirmAction({
  trigger,
  triggerClassName = btn.secondary,
  title,
  description,
  children,
  confirmLabel,
  submitLabel,
  busyLabel = "Working…",
  canSubmit = true,
  reasonLabel = "Reason",
  reasonHelp = "Recorded in the audit log and on the customer timeline.",
  onSubmit,
  onClose,
  defaultOpen = false,
}: {
  trigger: React.ReactNode;
  triggerClassName?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel: string;
  submitLabel: string;
  busyLabel?: string;
  /** Extra validation of the fields in `children`. */
  canSubmit?: boolean;
  reasonLabel?: string;
  reasonHelp?: string;
  /** Returns a success message (or nothing) to show after the action. */
  onSubmit: (reason: string) => Promise<React.ReactNode | void>;
  onClose?: () => void;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<React.ReactNode | null>(null);

  function close() {
    setOpen(false);
    setReason("");
    setConfirmed(false);
    setError(null);
    onClose?.();
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        <button type="button" className={triggerClassName} onClick={() => { setOpen(true); setResult(null); }}>
          {trigger}
        </button>
        {result && <Notice tone="success">{result}</Notice>}
      </div>
    );
  }

  const ready = canSubmit && reason.trim().length >= 3 && confirmed && !busy;

  return (
    <div className="w-full rounded-2xl border border-neutral-950 bg-white p-4 text-left sm:p-5">
      <p className="font-display text-sm font-bold text-neutral-950">{title}</p>
      {description && <div className="mt-1 text-sm text-neutral-600">{description}</div>}
      <div className="mt-4 flex flex-col gap-4">
        {children}
        <Field label={reasonLabel} htmlFor={`${id}-reason`} help={reasonHelp}>
          <textarea id={`${id}-reason`} rows={2} maxLength={500} className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <label className="flex items-start gap-2 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
          />
          {confirmLabel}
        </label>
        {error && <Notice tone="error">{error}</Notice>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={clsx(btn.primary)}
            disabled={!ready}
            aria-busy={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const message = await onSubmit(reason.trim());
                setResult(message ?? "Done.");
                close();
                router.refresh();
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? busyLabel : submitLabel}
          </button>
          <button type="button" className={btn.ghost} disabled={busy} onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
