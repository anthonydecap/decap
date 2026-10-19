"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { formatMoney } from "../../format";
import { btn, Field, inputClass, Notice, Panel, StatusBadge } from "../primitives";
import { apiErrorParts, centsToEuros, eurosToCents, slugify, type FieldErrors } from "./helpers";
import { Checkbox, FormGrid, textareaClass } from "./ui";

export type PickerArrangement = { id: string; sku: string; displayTitle: string; priceCents: number; status: string };

export type BundleInitial = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number;
  featured: boolean;
  status: string;
  arrangementIds: string[];
};

export function BundleForm({ initial, options }: { initial: BundleInitial | null; options: PickerArrangement[] }) {
  const router = useRouter();
  const isNew = !initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [price, setPrice] = useState(centsToEuros(initial?.priceCents));
  const [ids, setIds] = useState<string[]>(initial?.arrangementIds ?? []);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const items = ids.map((id) => byId.get(id)).filter((x): x is PickerArrangement => Boolean(x));
  const missing = ids.length - items.length;

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const chosen = new Set(ids);
    return options
      .filter((o) => !chosen.has(o.id) && (o.displayTitle.toLowerCase().includes(q) || o.sku.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [search, options, ids]);

  const totalCents = items.reduce((s, i) => s + i.priceCents, 0);
  const priceCents = eurosToCents(price);
  const validPrice = priceCents != null && !Number.isNaN(priceCents);
  const savingCents = validPrice ? totalCents - priceCents : 0;
  const savingPct = validPrice && totalCents > 0 ? (savingCents / totalCents) * 100 : 0;

  const touch = () => setSaved(false);

  function updateTitle(v: string) {
    touch();
    setTitle(v);
    if (!slugTouched) setSlug(slugify(`${v} ${sku}`));
  }
  function updateSku(v: string) {
    touch();
    setSku(v);
    if (!slugTouched) setSlug(slugify(`${title} ${v}`));
  }
  function move(idx: number, dir: -1 | 1) {
    touch();
    setIds((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j]!, next[idx]!];
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!validPrice || priceCents < 0) {
      setFieldErrors({ priceCents: "Enter a price in euros, for example 49.00" });
      setError("Some fields need attention. Check the highlighted fields below.");
      return;
    }
    setFieldErrors({});
    setSaving(true);
    const payload = {
      sku: sku.trim(), slug: slug.trim(), title: title.trim(), subtitle, description, currency: "EUR",
      priceCents, featured, arrangementIds: ids,
    };
    try {
      if (isNew) {
        const created = await apiFetch<{ id: string }>("/api/admin/shop/bundles", { body: payload });
        router.push(`/admin/shop/bundles/${created.id}`);
        router.refresh();
        return;
      }
      await apiFetch(`/api/admin/shop/bundles/${initial.id}`, { method: "PATCH", body: payload });
      setSaved(true);
      router.refresh();
    } catch (err) {
      const parts = apiErrorParts(err);
      setError(parts.message);
      setFieldErrors(parts.fields);
    } finally {
      setSaving(false);
    }
  }

  const fe = (k: string) => fieldErrors[k] ?? null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Collection saved.</Notice>}

      <Panel title="Basics">
        <FormGrid>
          <Field label="Title" htmlFor="b-title" error={fe("title")} className="sm:col-span-2">
            <input id="b-title" className={inputClass} value={title} onChange={(e) => updateTitle(e.target.value)} maxLength={200} required />
          </Field>
          <Field label="Subtitle" htmlFor="b-sub" error={fe("subtitle")} className="sm:col-span-2">
            <input id="b-sub" className={inputClass} value={subtitle} onChange={(e) => { touch(); setSubtitle(e.target.value); }} maxLength={200} />
          </Field>
          <Field label="SKU" htmlFor="b-sku" error={fe("sku")} help="Letters, digits, dot, dash, underscore.">
            <input id="b-sku" className={inputClass} value={sku} onChange={(e) => updateSku(e.target.value)} maxLength={64} autoComplete="off" required />
          </Field>
          <Field label="Slug" htmlFor="b-slug" error={fe("slug")} help={slugTouched ? "Used in the storefront URL." : "Suggested from title and SKU until you edit it."}>
            <input
              id="b-slug"
              className={inputClass}
              value={slug}
              onChange={(e) => { touch(); setSlugTouched(true); setSlug(e.target.value); }}
              maxLength={120}
              autoComplete="off"
              required
            />
          </Field>
          <Field label="Description" htmlFor="b-desc" error={fe("description")} className="sm:col-span-2">
            <textarea id="b-desc" className={textareaClass} rows={5} value={description} onChange={(e) => { touch(); setDescription(e.target.value); }} maxLength={10000} />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox id="b-feat" label="Featured" help="Shown in featured spots on the storefront." checked={featured} onChange={(v) => { touch(); setFeatured(v); }} />
          </div>
        </FormGrid>
      </Panel>

      <Panel title="Arrangements" description="The collection grants every arrangement listed here. Order is the order shown to customers.">
        <div className="flex flex-col gap-5">
          <Field label="Add arrangement" htmlFor="b-search" help="Search by title or SKU. Archived arrangements are not listed.">
            <input id="b-search" type="search" className={inputClass} value={search} onChange={(e) => setSearch(e.target.value)} autoComplete="off" />
          </Field>
          {search.trim() && (
            results.length === 0 ? (
              <p className="text-sm text-neutral-500">No matching arrangements.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                {results.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-950">{o.displayTitle}</p>
                      <p className="text-xs text-neutral-500"><span className="font-mono">{o.sku}</span>, {formatMoney(o.priceCents)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {o.status !== "PUBLISHED" && <StatusBadge status={o.status} />}
                      <button type="button" className={btn.ghost} onClick={() => { touch(); setIds((p) => [...p, o.id]); }}>
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}

          {missing > 0 && (
            <Notice tone="error">
              {missing} item{missing === 1 ? " refers to an arrangement" : "s refer to arrangements"} that could not be loaded. Remove and re-add if saving fails.
            </Notice>
          )}

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">No arrangements in this collection yet.</p>
          ) : (
            <ol className="flex flex-col divide-y divide-neutral-100 rounded-xl border border-neutral-200">
              {items.map((o, idx) => (
                <li key={o.id} className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-right text-xs text-neutral-400 tabular-nums">{idx + 1}</span>
                    <div className="min-w-0">
                      <Link href={`/admin/shop/arrangements/${o.id}`} className="block truncate text-sm font-medium text-neutral-950 hover:underline">{o.displayTitle}</Link>
                      <p className="text-xs text-neutral-500"><span className="font-mono">{o.sku}</span>, {formatMoney(o.priceCents)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                    {o.status !== "PUBLISHED" && <StatusBadge status={o.status} className="mr-2" />}
                    <button type="button" className={btn.ghost} onClick={() => move(ids.indexOf(o.id), -1)} disabled={idx === 0} aria-label={`Move ${o.displayTitle} up`}>
                      <ArrowUp size={16} />
                    </button>
                    <button type="button" className={btn.ghost} onClick={() => move(ids.indexOf(o.id), 1)} disabled={idx === items.length - 1} aria-label={`Move ${o.displayTitle} down`}>
                      <ArrowDown size={16} />
                    </button>
                    <button type="button" className={btn.ghost} onClick={() => { touch(); setIds((p) => p.filter((x) => x !== o.id)); }} aria-label={`Remove ${o.displayTitle}`}>
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Panel>

      <Panel title="Pricing">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Collection price (EUR)" htmlFor="b-price" error={fe("priceCents")} help="Including VAT, as shown to customers.">
            <input id="b-price" className={inputClass} inputMode="decimal" value={price} onChange={(e) => { touch(); setPrice(e.target.value); }} required />
          </Field>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-neutral-50 p-4 text-sm">
            <dt className="text-neutral-500">Items</dt>
            <dd className="text-right tabular-nums text-neutral-900">{items.length}</dd>
            <dt className="text-neutral-500">Normal retail total</dt>
            <dd className="text-right tabular-nums text-neutral-900">{formatMoney(totalCents)}</dd>
            <dt className="text-neutral-500">Collection price</dt>
            <dd className="text-right tabular-nums text-neutral-900">{validPrice ? formatMoney(priceCents) : "Not set"}</dd>
            <dt className="font-medium text-neutral-900">Customer saves</dt>
            <dd className="text-right font-semibold tabular-nums text-neutral-950">
              {validPrice && totalCents > 0 ? `${formatMoney(Math.max(savingCents, 0))} (${Math.max(savingPct, 0).toFixed(1)}%)` : "Not available"}
            </dd>
          </dl>
        </div>
        {validPrice && items.length > 0 && priceCents >= totalCents && (
          <div className="mt-4">
            <Notice tone="error">The collection price is not lower than buying the arrangements separately ({formatMoney(totalCents)}). Customers get no saving.</Notice>
          </div>
        )}
      </Panel>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          {isNew ? "The collection is created as a draft." : "Saving a published collection into an invalid state moves it back to draft."}
        </p>
        <button type="submit" className={btn.primary} disabled={saving}>
          {saving ? "Saving…" : isNew ? "Create collection" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
