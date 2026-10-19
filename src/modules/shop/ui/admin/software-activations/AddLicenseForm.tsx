"use client";

import { useId, useState } from "react";
import { Eye, EyeSlash, Plus } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { useMutation } from "../crm/useMutation";
import { btn, Field, inputClass, Notice } from "../primitives";

type Product = { id: string; name: string; defaultMaxActivations: number };

const SOURCES = [
  { value: "ADMIN", label: "Manual", help: "A license given by staff, for example a replacement or goodwill." },
  { value: "PROMOTION", label: "Promotion", help: "A license given as part of a promotion or bundle deal." },
  { value: "LEGACY_IMPORT", label: "Legacy", help: "A customer who bought before the shop existed. No order is created." },
] as const;

/**
 * Manual / promotion / legacy license. Never creates an order. Legacy customers can have
 * their existing activated installation recorded at the same time.
 */
export function AddLicenseForm({ customerId, products }: { customerId: string; products: Product[] }) {
  const id = useId();
  const { busy, error, setError, run } = useMutation();
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [source, setSource] = useState<(typeof SOURCES)[number]["value"]>("ADMIN");
  const [max, setMax] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [withInstallation, setWithInstallation] = useState(false);
  const [code, setCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [label, setLabel] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const product = products.find((p) => p.id === productId);
  const maxNumber = max.trim() ? Number(max) : null;
  const maxValid = maxNumber === null || (Number.isInteger(maxNumber) && maxNumber >= 1 && maxNumber <= 50);
  const codeValid = !withInstallation || code.trim().length >= 4;
  const identifierValid = !identifier.trim() || identifier.trim().length >= 4;
  const valid = Boolean(productId) && maxValid && codeValid && identifierValid;

  function reset() {
    setMax("");
    setReference("");
    setNotes("");
    setWithInstallation(false);
    setCode("");
    setIdentifier("");
    setKey("");
    setShowKey(false);
    setLabel("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const ok = await run(async () => {
      const res = await apiFetch<{ id: string; number: number }>("/api/admin/shop/software/licenses", {
        body: {
          customerId,
          softwareProductId: productId,
          licenseSource: source,
          ...(maxNumber !== null ? { maxActivations: maxNumber } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
          ...(reference.trim() ? { sourceReference: reference.trim() } : {}),
          installation: withInstallation
            ? {
                registrationCode: code.trim(),
                ...(identifier.trim() ? { registrationIdentifier: identifier.trim() } : {}),
                ...(key.trim() ? { activationKey: key.trim() } : {}),
                ...(label.trim() ? { label: label.trim() } : {}),
              }
            : null,
        },
      });
      setDone(`License LIC-${res.number} added.`);
    });
    if (ok) {
      reset();
      setOpen(false);
    }
  }

  if (!products.length) {
    return <p className="text-sm text-neutral-500">There are no software products yet. Create one under Software, Products first.</p>;
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-3">
        {done && <Notice tone="success">{done}</Notice>}
        <button type="button" className={`${btn.secondary} self-start`} onClick={() => { setDone(null); setOpen(true); }}>
          <Plus size={16} aria-hidden />
          Add license
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Software" htmlFor={`${id}-product`}>
          <select id={`${id}-product`} value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Source" htmlFor={`${id}-source`} help={SOURCES.find((s) => s.value === source)?.help}>
          <select id={`${id}-source`} value={source} onChange={(e) => setSource(e.target.value as typeof source)} className={inputClass}>
            {SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Maximum activations"
          htmlFor={`${id}-max`}
          help={`Leave empty for the product default (${product?.defaultMaxActivations ?? 1}).`}
          error={!maxValid ? "Enter a whole number between 1 and 50." : null}
        >
          <input id={`${id}-max`} type="number" min={1} max={50} value={max} onChange={(e) => setMax(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Reference" htmlFor={`${id}-ref`} help="Optional. Old invoice number, promotion code or similar.">
          <input id={`${id}-ref`} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={200} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Internal notes" htmlFor={`${id}-notes`} className="sm:col-span-2">
          <textarea id={`${id}-notes`} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} rows={2} className={inputClass} />
        </Field>
      </div>

      <label className="flex items-start gap-2 text-sm text-neutral-800">
        <input type="checkbox" checked={withInstallation} onChange={(e) => setWithInstallation(e.target.checked)} className="mt-1 accent-neutral-950" />
        <span>
          Record an existing activated installation
          <span className="block text-xs text-neutral-500">For legacy customers whose software is already activated. The license becomes active immediately.</span>
        </span>
      </label>

      {withInstallation && (
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-neutral-200 p-4 sm:grid-cols-2">
          <Field label="Registration code" htmlFor={`${id}-code`} error={!codeValid && code ? "At least 4 characters." : null}>
            <input id={`${id}-code`} value={code} onChange={(e) => setCode(e.target.value)} maxLength={80} className={`${inputClass} font-mono`} autoComplete="off" spellCheck={false} />
          </Field>
          <Field label="Registration identifier" htmlFor={`${id}-ident`} help="Optional. Defaults to the registration code." error={!identifierValid ? "At least 4 characters." : null}>
            <input id={`${id}-ident`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} maxLength={80} className={`${inputClass} font-mono`} autoComplete="off" spellCheck={false} />
          </Field>
          <Field label="Activation key" htmlFor={`${id}-key`} help="Optional. Stored encrypted; revealing it later is recorded.">
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
              <button type="button" className={btn.ghost} onClick={() => setShowKey((v) => !v)} aria-label={showKey ? "Hide activation key" : "Show activation key"}>
                {showKey ? <EyeSlash size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
              </button>
            </div>
          </Field>
          <Field label="Label" htmlFor={`${id}-label`} help="Optional, for example Studio computer.">
            <input id={`${id}-label`} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={120} className={inputClass} autoComplete="off" />
          </Field>
        </div>
      )}

      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={btn.primary} disabled={busy || !valid} aria-busy={busy}>
          {busy ? "Adding..." : "Add license"}
        </button>
        <button type="button" className={btn.ghost} disabled={busy} onClick={() => { reset(); setOpen(false); }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
