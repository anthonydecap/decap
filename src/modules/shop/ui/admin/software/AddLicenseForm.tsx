"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeSlash, Plus } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../../api";
import { Checkbox, FormGrid, textareaClass } from "../catalog/ui";
import { btn, Field, inputClass, Notice, Panel } from "../primitives";

type Match = { id: string; label: string; email: string };
type ProductOption = { id: string; name: string; defaultMaxActivations: number };
type Source = "ADMIN" | "PROMOTION" | "LEGACY_IMPORT";

const SOURCES: { value: Source; label: string; help: string }[] = [
  { value: "ADMIN", label: "Manual grant", help: "A license given by DMI, for example a replacement or goodwill gesture." },
  { value: "PROMOTION", label: "Promotion", help: "Part of a campaign, bundle deal or giveaway. Add the campaign in Reference." },
  { value: "LEGACY_IMPORT", label: "Legacy customer", help: "A customer who bought before this shop existed. Record their existing installation below." },
];

/**
 * Staff-created license (manual, promotion or legacy). Never creates an order or a payment.
 * The optional legacy installation sends the activation key once; it is never shown back.
 */
export function AddLicenseForm({ products, defaultProductId }: { products: ProductOption[]; defaultProductId?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<Match | null>(null);
  const [productId, setProductId] = useState(defaultProductId && products.some((p) => p.id === defaultProductId) ? defaultProductId : (products[0]?.id ?? ""));
  const [source, setSource] = useState<Source>("ADMIN");
  const [maxActivations, setMaxActivations] = useState("");
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");
  const [withInstall, setWithInstall] = useState(false);
  const [code, setCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!open || customer || q.trim().length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setSearching(true);
      apiFetch<{ items: Match[] }>(`/api/admin/shop/customers?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
        .then((r) => setMatches(r.items))
        .catch(() => undefined)
        .finally(() => setSearching(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open, customer]);

  const product = products.find((p) => p.id === productId);
  const maxNum = maxActivations.trim() ? Number(maxActivations) : null;
  const maxError = maxNum != null && (!Number.isInteger(maxNum) || maxNum < 1 || maxNum > 50) ? "Between 1 and 50" : null;
  const codeError = withInstall && code.trim() && code.trim().length < 4 ? "At least 4 characters" : null;
  const identifierError = withInstall && identifier.trim() && identifier.trim().length < 4 ? "At least 4 characters" : null;
  const valid = Boolean(customer && productId) && !maxError && (!withInstall || (code.trim().length >= 4 && !identifierError));

  function reset() {
    setQ("");
    setMatches([]);
    setCustomer(null);
    setSource("ADMIN");
    setMaxActivations("");
    setNotes("");
    setReference("");
    setWithInstall(false);
    setCode("");
    setIdentifier("");
    setKey("");
    setShowKey(false);
    setLabel("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !customer) return;
    if (!window.confirm(`Add a ${product?.name ?? "software"} license for ${customer.label}? No order or payment is created.`)) return;
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const r = await apiFetch<{ id: string; number: number }>("/api/admin/shop/software/licenses", {
        body: {
          customerId: customer.id,
          softwareProductId: productId,
          licenseSource: source,
          ...(maxNum != null ? { maxActivations: maxNum } : {}),
          notes: notes.trim() || null,
          sourceReference: reference.trim() || null,
          installation: withInstall
            ? {
                registrationCode: code.trim(),
                registrationIdentifier: identifier.trim() || null,
                activationKey: key.trim() || null,
                label: label.trim() || null,
              }
            : null,
        },
      });
      setDone(`License LIC-${r.number} added for ${customer.label}.`);
      reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-3">
        {done && <Notice tone="success">{done}</Notice>}
        <div>
          <button type="button" className={btn.primary} onClick={() => { setOpen(true); setDone(null); }}>
            <Plus size={16} aria-hidden /> Add license
          </button>
        </div>
      </div>
    );
  }

  return (
    <Panel
      title="Add license"
      description="For manual grants, promotions and legacy customers. No order or payment is created, and the customer is not charged."
    >
      {products.length === 0 ? (
        <Notice>Create a software product first.</Notice>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <FormGrid>
            <div className="flex flex-col gap-2">
              <Field label="Customer" htmlFor="al-customer" help={customer ? customer.email : "Search by name, email or company."}>
                <input
                  id="al-customer"
                  className={inputClass}
                  autoComplete="off"
                  value={customer ? customer.label : q}
                  disabled={busy}
                  onChange={(e) => {
                    setCustomer(null);
                    setQ(e.target.value);
                    if (e.target.value.trim().length < 2) setMatches([]);
                  }}
                />
              </Field>
              {!customer && q.trim().length >= 2 && (
                <ul className="max-h-56 overflow-auto rounded-xl border border-neutral-200 text-sm">
                  {matches.length === 0 ? (
                    <li className="px-3 py-2 text-neutral-500">{searching ? "Searching…" : "No customers found."}</li>
                  ) : (
                    matches.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          className="block w-full px-3 py-2 text-left hover:bg-neutral-50"
                          onClick={() => { setCustomer(m); setMatches([]); }}
                        >
                          <span className="font-medium text-neutral-950">{m.label}</span> <span className="text-neutral-500">{m.email}</span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <Field label="Product" htmlFor="al-product">
              <select id="al-product" className={inputClass} value={productId} disabled={busy} onChange={(e) => setProductId(e.target.value)}>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Source" htmlFor="al-source" help={SOURCES.find((s) => s.value === source)?.help}>
              <select id="al-source" className={inputClass} value={source} disabled={busy} onChange={(e) => setSource(e.target.value as Source)}>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field
              label="Max activations"
              htmlFor="al-max"
              error={maxError}
              help={`Leave empty for the product default (${product?.defaultMaxActivations ?? 1}).`}
            >
              <input id="al-max" type="number" min={1} max={50} className={`${inputClass} tabular-nums`} value={maxActivations} disabled={busy} onChange={(e) => setMaxActivations(e.target.value)} />
            </Field>
            <Field label="Reference" htmlFor="al-ref" help="Optional. Old invoice number, campaign name or ticket.">
              <input id="al-ref" className={inputClass} value={reference} maxLength={200} disabled={busy} onChange={(e) => setReference(e.target.value)} />
            </Field>
          </FormGrid>
          <Field label="Notes" htmlFor="al-notes" help="Internal. Not shown to the customer.">
            <textarea id="al-notes" rows={2} className={textareaClass} value={notes} maxLength={2000} disabled={busy} onChange={(e) => setNotes(e.target.value)} />
          </Field>

          <div className="rounded-xl border border-neutral-200 p-4">
            <Checkbox
              id="al-install"
              label="Existing installation (legacy)"
              help="The customer already runs an activated copy. Record its registration code so the license starts as active."
              checked={withInstall}
              disabled={busy}
              onChange={setWithInstall}
            />
            {withInstall && (
              <div className="mt-4">
                <FormGrid>
                  <Field label="Registration code" htmlFor="al-code" error={codeError}>
                    <input id="al-code" className={`${inputClass} font-mono`} autoComplete="off" value={code} maxLength={80} disabled={busy} onChange={(e) => setCode(e.target.value)} />
                  </Field>
                  <Field label="Registration identifier" htmlFor="al-ident" error={identifierError} help="Defaults to the registration code.">
                    <input id="al-ident" className={`${inputClass} font-mono`} autoComplete="off" value={identifier} maxLength={80} disabled={busy} onChange={(e) => setIdentifier(e.target.value)} placeholder={code.trim() || undefined} />
                  </Field>
                  <Field label="Activation key" htmlFor="al-key" help="Optional. Stored encrypted and never shown on this page.">
                    <div className="relative">
                      <input
                        id="al-key"
                        type={showKey ? "text" : "password"}
                        className={`${inputClass} pr-10 font-mono`}
                        autoComplete="off"
                        spellCheck={false}
                        value={key}
                        maxLength={500}
                        disabled={busy}
                        onChange={(e) => setKey(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500 hover:text-neutral-950"
                        aria-label={showKey ? "Hide activation key" : "Show activation key"}
                        onClick={() => setShowKey((v) => !v)}
                      >
                        {showKey ? <EyeSlash size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Label" htmlFor="al-label" help="Optional, for example Studio PC.">
                    <input id="al-label" className={inputClass} value={label} maxLength={120} disabled={busy} onChange={(e) => setLabel(e.target.value)} />
                  </Field>
                </FormGrid>
              </div>
            )}
          </div>

          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={btn.primary} disabled={!valid || busy}>{busy ? "Adding…" : "Add license"}</button>
            <button type="button" className={btn.secondary} disabled={busy} onClick={() => { setOpen(false); setError(null); reset(); }}>Cancel</button>
          </div>
        </form>
      )}
    </Panel>
  );
}
