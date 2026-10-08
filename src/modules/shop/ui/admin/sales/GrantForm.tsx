"use client";

import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";

export type GrantableArrangement = { id: string; sku: string; displayTitle: string };

const SOURCE_TYPES = [
  { value: "ADMIN_GRANT", label: "Admin grant" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "LEGACY_IMPORT", label: "Legacy import" },
] as const;

type SourceType = (typeof SOURCE_TYPES)[number]["value"];

const MAX_VISIBLE = 200;

/** Manual grant: adds a non-purchase entitlement source. Never creates an order. */
export function GrantForm({
  customerId,
  arrangements,
  ownedArrangementIds,
}: {
  customerId: string;
  arrangements: GrantableArrangement[];
  /** Arrangements the customer already has active access to. */
  ownedArrangementIds: string[];
}) {
  const router = useRouter();
  const id = useId();
  const owned = useMemo(() => new Set(ownedArrangementIds), [ownedArrangementIds]);
  const [query, setQuery] = useState("");
  const [arrangementId, setArrangementId] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("ADMIN_GRANT");
  const [reason, setReason] = useState("");
  const [reference, setReference] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? arrangements.filter((a) => a.sku.toLowerCase().includes(q) || a.displayTitle.toLowerCase().includes(q))
      : arrangements;
    return list.slice(0, MAX_VISIBLE);
  }, [arrangements, query]);

  const selected = arrangements.find((a) => a.id === arrangementId) ?? null;
  const reasonValid = reason.trim().length >= 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setSuccess(null);
    if (!selected || !reasonValid) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/customers/${customerId}/grants`, {
        body: {
          arrangementId: selected.id,
          sourceType,
          reason: reason.trim(),
          ...(reference.trim() ? { reference: reference.trim() } : {}),
        },
      });
      setSuccess(`Granted ${selected.displayTitle} (${selected.sku}).`);
      setArrangementId("");
      setReason("");
      setReference("");
      setTouched(false);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (arrangements.length === 0) {
    return <p className="text-sm text-neutral-500">There are no arrangements in the catalog to grant yet.</p>;
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
      <p className="text-sm text-neutral-600">
        Adds library access without creating an order or charging the customer. The grant is recorded as its own source
        and can be revoked later without affecting purchases.
      </p>
      {success && <Notice tone="success">{success}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Find arrangement" htmlFor={`${id}-q`} help="Filter by SKU or title.">
          <input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClass}
            autoComplete="off"
          />
        </Field>
        <Field
          label="Arrangement"
          htmlFor={`${id}-arr`}
          help={
            matches.length === MAX_VISIBLE
              ? `Showing the first ${MAX_VISIBLE} matches. Refine the filter to see more.`
              : `${matches.length} match${matches.length === 1 ? "" : "es"}`
          }
          error={touched && !selected ? "Choose an arrangement." : null}
        >
          <select
            id={`${id}-arr`}
            size={6}
            value={arrangementId}
            onChange={(e) => setArrangementId(e.target.value)}
            className={`${inputClass} h-auto`}
          >
            {matches.map((a) => (
              <option key={a.id} value={a.id}>
                {a.sku} {a.displayTitle}
                {owned.has(a.id) ? " (already owned)" : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {selected && owned.has(selected.id) && (
        <Notice>
          The customer already has active access to this arrangement. Granting adds another source, which keeps access
          if the existing source is later refunded or revoked.
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field label="Source type" htmlFor={`${id}-type`}>
          <select
            id={`${id}-type`}
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className={inputClass}
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Reason"
          htmlFor={`${id}-reason`}
          error={touched && !reasonValid ? "Enter a reason of at least 3 characters." : null}
        >
          <input
            id={`${id}-reason`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            className={inputClass}
          />
        </Field>
        <Field label="Reference (optional)" htmlFor={`${id}-ref`} help="Ticket, campaign or legacy order id.">
          <input
            id={`${id}-ref`}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={200}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <button type="submit" className={btn.primary} disabled={busy} aria-busy={busy}>
          {busy ? "Granting..." : "Grant access"}
        </button>
      </div>
    </form>
  );
}
