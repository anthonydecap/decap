"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../api";
import { formatMoney } from "../../format";
import { btn, EmptyState, Field, inputClass, Notice, Panel, StatusBadge } from "../primitives";
import {
  apiErrorParts, bpsToPercent, centsToEuros, eurosToCents, percentToBps, ROYALTY_BASES, ROYALTY_BASIS_LABEL, slugify,
  type FieldErrors,
} from "./helpers";
import { Checkbox, FormGrid, selectClass, textareaClass } from "./ui";

export type ArrangerRow = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  contactEmail: string | null;
  defaultRoyaltyBasis: string;
  defaultRoyaltyRateBps: number;
  defaultRoyaltyFixedCents: number | null;
  active: boolean;
  arrangementCount: number;
};

function royaltySummary(a: ArrangerRow) {
  if (a.defaultRoyaltyBasis === "PERCENT_OF_NET") return `${bpsToPercent(a.defaultRoyaltyRateBps)}% of net`;
  if (a.defaultRoyaltyBasis === "FIXED_PER_UNIT") return `${formatMoney(a.defaultRoyaltyFixedCents ?? 0)} per unit`;
  return "No royalty";
}

function ArrangerEditor({ arranger, onDone }: { arranger: ArrangerRow | null; onDone: (saved?: string) => void }) {
  const router = useRouter();
  const isNew = !arranger;
  const [name, setName] = useState(arranger?.name ?? "");
  const [slug, setSlug] = useState(arranger?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [bio, setBio] = useState(arranger?.bio ?? "");
  const [email, setEmail] = useState(arranger?.contactEmail ?? "");
  const [basis, setBasis] = useState(arranger?.defaultRoyaltyBasis ?? "PERCENT_OF_NET");
  const [rate, setRate] = useState(bpsToPercent(arranger?.defaultRoyaltyRateBps ?? 0));
  const [fixed, setFixed] = useState(centsToEuros(arranger?.defaultRoyaltyFixedCents));
  const [active, setActive] = useState(arranger?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const idp = arranger?.id ?? "new";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errs: FieldErrors = {};
    const bps = basis === "PERCENT_OF_NET" ? percentToBps(rate) : 0;
    if (basis === "PERCENT_OF_NET" && (bps == null || Number.isNaN(bps) || bps < 0 || bps > 10000)) errs.defaultRoyaltyRateBps = "Enter a percentage between 0 and 100";
    const cents = basis === "FIXED_PER_UNIT" ? eurosToCents(fixed) : null;
    if (basis === "FIXED_PER_UNIT" && (cents == null || Number.isNaN(cents) || cents < 0)) errs.defaultRoyaltyFixedCents = "Enter an amount in euros";
    setFields(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(), slug: slug.trim(), bio, contactEmail: email.trim(),
        defaultRoyaltyBasis: basis, defaultRoyaltyRateBps: bps ?? 0, defaultRoyaltyFixedCents: cents, active,
      };
      if (arranger) await apiFetch(`/api/admin/shop/arrangers/${arranger.id}`, { method: "PATCH", body });
      else await apiFetch("/api/admin/shop/arrangers", { body });
      router.refresh();
      onDone(`Saved arranger "${body.name}".`);
    } catch (err) {
      const p = apiErrorParts(err);
      setError(p.message);
      setFields(p.fields);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      <FormGrid>
        <Field label="Name" htmlFor={`ar-name-${idp}`} error={fields.name}>
          <input
            id={`ar-name-${idp}`}
            className={inputClass}
            value={name}
            maxLength={200}
            required
            onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
          />
        </Field>
        <Field label="Slug" htmlFor={`ar-slug-${idp}`} error={fields.slug} help={slugTouched ? undefined : "Suggested from the name until you edit it."}>
          <input id={`ar-slug-${idp}`} className={inputClass} value={slug} maxLength={120} autoComplete="off" required onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} />
        </Field>
        <Field label="Contact email" htmlFor={`ar-email-${idp}`} error={fields.contactEmail} help="Internal only.">
          <input id={`ar-email-${idp}`} type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <div className="flex items-end pb-2">
          <Checkbox id={`ar-active-${idp}`} label="Active" help="Inactive arrangers block publishing of their arrangements." checked={active} onChange={setActive} />
        </div>
        <Field label="Default royalty basis" htmlFor={`ar-basis-${idp}`} error={fields.defaultRoyaltyBasis}>
          <select id={`ar-basis-${idp}`} className={selectClass} value={basis} onChange={(e) => setBasis(e.target.value)}>
            {ROYALTY_BASES.map((b) => <option key={b} value={b}>{ROYALTY_BASIS_LABEL[b]}</option>)}
          </select>
        </Field>
        {basis === "PERCENT_OF_NET" && (
          <Field label="Default rate (%)" htmlFor={`ar-rate-${idp}`} error={fields.defaultRoyaltyRateBps} help="Percent of the net amount allocated to the arrangement.">
            <input id={`ar-rate-${idp}`} className={inputClass} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          </Field>
        )}
        {basis === "FIXED_PER_UNIT" && (
          <Field label="Fixed amount per unit (EUR)" htmlFor={`ar-fixed-${idp}`} error={fields.defaultRoyaltyFixedCents} help="Capped at the net allocation.">
            <input id={`ar-fixed-${idp}`} className={inputClass} inputMode="decimal" value={fixed} onChange={(e) => setFixed(e.target.value)} />
          </Field>
        )}
        <Field label="Bio" htmlFor={`ar-bio-${idp}`} error={fields.bio} className="sm:col-span-2">
          <textarea id={`ar-bio-${idp}`} className={textareaClass} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={4000} />
        </Field>
      </FormGrid>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={btn.primary} disabled={saving}>{saving ? "Saving…" : arranger ? "Save arranger" : "Create arranger"}</button>
        <button type="button" className={btn.ghost} onClick={() => onDone()} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

export function ArrangersManager({ arrangers }: { arrangers: ArrangerRow[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const done = (msg?: string) => {
    setCreating(false);
    setEditing(null);
    setNotice(msg ?? null);
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <Panel title="New arranger">
          <ArrangerEditor arranger={null} onDone={done} />
        </Panel>
      ) : (
        <div className="flex justify-end">
          <button type="button" className={btn.primary} onClick={() => { setCreating(true); setEditing(null); setNotice(null); }}>New arranger</button>
        </div>
      )}
      {notice && <Notice tone="success">{notice}</Notice>}

      {arrangers.length === 0 ? (
        <EmptyState title="No arrangers yet" body="Arrangers own arrangements and receive royalties on sales." />
      ) : (
        <Panel padded={false}>
          <ul className="divide-y divide-neutral-100">
            {arrangers.map((a) => (
              <li key={a.id} className="px-5 py-4 sm:px-6">
                {editing === a.id ? (
                  <ArrangerEditor arranger={a} onDone={done} />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-neutral-950">{a.name}</p>
                        {!a.active && <StatusBadge status="INACTIVE" />}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {royaltySummary(a)}. {a.arrangementCount} arrangement{a.arrangementCount === 1 ? "" : "s"}
                        {a.contactEmail ? `. ${a.contactEmail}` : ""}
                      </p>
                    </div>
                    <button type="button" className={`${btn.secondary} shrink-0 self-start sm:self-auto`} onClick={() => { setEditing(a.id); setCreating(false); }}>
                      Edit
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
