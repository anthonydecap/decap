"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { formatMoney } from "../../format";
import { btn, Field, inputClass, Notice } from "../primitives";

export type RefundableAllocation = {
  id: string;
  sku: string;
  title: string;
  refundableCents: number;
  /** True when this allocation's entitlement source is still active. */
  sourceActive: boolean;
};

type Mode = "full" | "selected";
type Step = "edit" | "confirm";

export function RefundPanel({
  orderId,
  orderNumber,
  currency,
  allocations,
}: {
  orderId: string;
  orderNumber: string;
  currency: string;
  allocations: RefundableAllocation[];
}) {
  const router = useRouter();
  const ids = useId();
  const [mode, setMode] = useState<Mode>("full");
  const [selected, setSelected] = useState<Set<string>>(() => new Set(allocations.map((a) => a.id)));
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<Step>("edit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; amountCents: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const chosen = useMemo(
    () => (mode === "full" ? allocations : allocations.filter((a) => selected.has(a.id))),
    [mode, allocations, selected],
  );
  const amountCents = chosen.reduce((s, a) => s + a.refundableCents, 0);
  const reasonValid = reason.trim().length >= 3;
  const canContinue = reasonValid && chosen.length > 0 && amountCents > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<{ id: string; status: string; amountCents: number }>(
        `/api/admin/shop/orders/${orderId}/refund`,
        { body: { reason: reason.trim(), ...(mode === "selected" ? { allocationIds: chosen.map((a) => a.id) } : {}) } },
      );
      setResult({ status: res.status, amountCents: res.amountCents });
      setStep("edit");
      setReason("");
      setTouched(false);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setStep("edit");
    } finally {
      setBusy(false);
    }
  }

  if (allocations.length === 0) {
    return <p className="text-sm text-neutral-500">Everything on this order has already been refunded.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <Notice>
        A refund revokes only the library access granted by this order. Arrangements the customer also owns through
        another purchase, collection or grant stay in their library. A file already delivered to an offline device
        cannot be remotely erased; revoking stops future downloads and re-delivery.
      </Notice>

      {result && (
        <Notice tone="success">
          Refund of {formatMoney(result.amountCents, currency)} {result.status === "SUCCEEDED" ? "completed" : "submitted"}.
          {result.status === "PENDING" && " Stripe is still processing it; access is revoked once it succeeds."}
          {result.status === "FAILED" && " Stripe reported a failure; check the refund history below."}
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      {step === "edit" ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (canContinue) setStep("confirm");
          }}
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-sm font-medium text-neutral-800">What to refund</legend>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name={`${ids}-mode`}
                checked={mode === "full"}
                onChange={() => setMode("full")}
                className="accent-neutral-950"
              />
              Full refund of everything still refundable
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name={`${ids}-mode`}
                checked={mode === "selected"}
                onChange={() => setMode("selected")}
                className="accent-neutral-950"
              />
              Selected arrangements only
            </label>
          </fieldset>

          {mode === "selected" && (
            <ul className="flex flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-200">
              {allocations.map((a) => (
                <li key={a.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3 text-sm sm:items-center">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggle(a.id)}
                      className="mt-0.5 accent-neutral-950 sm:mt-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-neutral-950">{a.title}</span>
                      <span className="block text-xs text-neutral-500">
                        {a.sku}
                        {!a.sourceActive && ", access from this order already revoked"}
                      </span>
                    </span>
                    <span className="tabular-nums text-neutral-800">{formatMoney(a.refundableCents, currency)}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <Field
            label="Reason"
            htmlFor={`${ids}-reason`}
            help="Required, at least 3 characters. Stored in the audit log."
            error={touched && !reasonValid ? "Enter a reason of at least 3 characters." : null}
          >
            <textarea
              id={`${ids}-reason`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={2}
              className={inputClass}
            />
          </Field>

          {touched && chosen.length === 0 && <Notice tone="error">Select at least one arrangement to refund.</Notice>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-600">
              Refund amount <span className="font-semibold tabular-nums text-neutral-950">{formatMoney(amountCents, currency)}</span>
            </p>
            <button type="submit" className={btn.secondary} disabled={busy}>Review refund</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-950 p-4 sm:p-5">
          <p className="text-sm text-neutral-800">
            Refund <span className="font-semibold tabular-nums text-neutral-950">{formatMoney(amountCents, currency)}</span> on{" "}
            {orderNumber} for {chosen.length} arrangement{chosen.length === 1 ? "" : "s"}? This sends the refund to Stripe
            and cannot be undone.
          </p>
          <p className="text-sm text-neutral-600">Reason: {reason.trim()}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" className={btn.ghost} onClick={() => setStep("edit")} disabled={busy}>Back</button>
            <button type="button" className={btn.danger} onClick={submit} disabled={busy} aria-busy={busy}>
              {busy ? "Refunding..." : `Refund ${formatMoney(amountCents, currency)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
