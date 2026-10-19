"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, Field, inputClass, Notice, Panel } from "../primitives";
import {
  apiErrorParts, bpsToPercent, centsToEuros, dateInputValue, eurosToCents, humanize, intOrNull, parseDuration,
  percentToBps, RIGHTS_STATUSES, ROYALTY_BASES, ROYALTY_BASIS_LABEL, slugify, type FieldErrors,
} from "./helpers";
import { Checkbox, FormGrid, selectClass, textareaClass } from "./ui";

export type ArrangementLookups = {
  works: { id: string; title: string; originalArtist: string | null }[];
  arrangers: { id: string; name: string; active: boolean }[];
  genres: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  profiles: { id: string; code: string; name: string; manufacturer: string | null; isGeneric: boolean; active: boolean }[];
};

export type ArrangementInitial = {
  id: string;
  sku: string;
  slug: string;
  workId: string;
  arrangerId: string;
  displayTitle: string;
  subtitle: string | null;
  description: string | null;
  priceCents: number;
  durationSeconds: number | null;
  tempoBpm: number | null;
  musicalKey: string | null;
  timeSignature: string | null;
  difficulty: number | null;
  releaseDate: Date | string | null;
  featured: boolean;
  searchKeywords: string[];
  compatibilityNotes: string | null;
  containsMidi: boolean;
  containsAudio: boolean;
  containsVideo: boolean;
  dmiFormatVersion: string | null;
  internalNotes: string | null;
  royaltyBasis: string | null;
  royaltyRateBps: number | null;
  royaltyFixedCents: number | null;
  genreIds: string[];
  tagIds: string[];
  compatibility: { systemProfileId: string; notes: string | null }[];
  rightsStatus: string;
  rightsTerritory: string | null;
  licenseReference: string | null;
  licenseStartsAt: Date | string | null;
  licenseEndsAt: Date | string | null;
  rightsNotes: string | null;
};

type FormState = {
  sku: string; slug: string; workId: string; arrangerId: string; displayTitle: string; subtitle: string; description: string;
  price: string; duration: string; tempo: string; musicalKey: string; timeSignature: string; difficulty: string; releaseDate: string;
  featured: boolean; keywords: string; compatibilityNotes: string; containsMidi: boolean; containsAudio: boolean; containsVideo: boolean;
  dmiFormatVersion: string; internalNotes: string; royaltyBasis: string; royaltyRate: string; royaltyFixed: string;
  genreIds: string[]; tagIds: string[]; compat: Record<string, string>; rightsStatus: string; rightsTerritory: string;
  licenseReference: string; licenseStartsAt: string; licenseEndsAt: string; rightsNotes: string;
};

function toState(a: ArrangementInitial | null): FormState {
  return {
    sku: a?.sku ?? "",
    slug: a?.slug ?? "",
    workId: a?.workId ?? "",
    arrangerId: a?.arrangerId ?? "",
    displayTitle: a?.displayTitle ?? "",
    subtitle: a?.subtitle ?? "",
    description: a?.description ?? "",
    price: centsToEuros(a?.priceCents),
    duration: a?.durationSeconds != null ? `${Math.floor(a.durationSeconds / 60)}:${String(a.durationSeconds % 60).padStart(2, "0")}` : "",
    tempo: a?.tempoBpm != null ? String(a.tempoBpm) : "",
    musicalKey: a?.musicalKey ?? "",
    timeSignature: a?.timeSignature ?? "",
    difficulty: a?.difficulty != null ? String(a.difficulty) : "",
    releaseDate: dateInputValue(a?.releaseDate),
    featured: a?.featured ?? false,
    keywords: (a?.searchKeywords ?? []).join(", "),
    compatibilityNotes: a?.compatibilityNotes ?? "",
    containsMidi: a?.containsMidi ?? false,
    containsAudio: a?.containsAudio ?? false,
    containsVideo: a?.containsVideo ?? false,
    dmiFormatVersion: a?.dmiFormatVersion ?? "",
    internalNotes: a?.internalNotes ?? "",
    royaltyBasis: a?.royaltyBasis ?? "",
    royaltyRate: bpsToPercent(a?.royaltyRateBps),
    royaltyFixed: centsToEuros(a?.royaltyFixedCents),
    genreIds: a?.genreIds ?? [],
    tagIds: a?.tagIds ?? [],
    compat: Object.fromEntries((a?.compatibility ?? []).map((c) => [c.systemProfileId, c.notes ?? ""])),
    rightsStatus: a?.rightsStatus ?? "NOT_REVIEWED",
    rightsTerritory: a?.rightsTerritory ?? "",
    licenseReference: a?.licenseReference ?? "",
    licenseStartsAt: dateInputValue(a?.licenseStartsAt),
    licenseEndsAt: dateInputValue(a?.licenseEndsAt),
    rightsNotes: a?.rightsNotes ?? "",
  };
}

export function ArrangementForm({
  initial,
  lookups,
  status,
}: {
  initial: ArrangementInitial | null;
  lookups: ArrangementLookups;
  status?: string;
}) {
  const router = useRouter();
  const isNew = !initial;
  const [f, setF] = useState<FormState>(() => toState(initial));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);
  const [autoUnpublished, setAutoUnpublished] = useState<{ code: string; message: string }[] | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSaved(false);
    setF((prev) => {
      const next = { ...prev, [key]: value };
      if (!slugTouched && (key === "displayTitle" || key === "sku")) {
        next.slug = slugify(`${next.displayTitle} ${next.sku}`);
      }
      return next;
    });
  }

  function toggle(list: "genreIds" | "tagIds", id: string, on: boolean) {
    set(list, on ? [...f[list], id] : f[list].filter((x) => x !== id));
  }

  function toggleProfile(id: string, on: boolean) {
    const compat = { ...f.compat };
    if (on) compat[id] = compat[id] ?? "";
    else delete compat[id];
    set("compat", compat);
  }

  function buildPayload(): { payload?: Record<string, unknown>; errors: FieldErrors } {
    const errors: FieldErrors = {};
    const priceCents = eurosToCents(f.price);
    if (priceCents == null || Number.isNaN(priceCents) || priceCents < 0) errors.priceCents = "Enter a price in euros, for example 9.99";
    const durationSeconds = parseDuration(f.duration);
    if (Number.isNaN(durationSeconds)) errors.durationSeconds = "Use mm:ss, for example 3:45";
    const tempoBpm = intOrNull(f.tempo);
    if (Number.isNaN(tempoBpm)) errors.tempoBpm = "Whole number of BPM";
    const difficulty = intOrNull(f.difficulty);
    const basis = f.royaltyBasis || null;
    const rateBps = basis === "PERCENT_OF_NET" ? percentToBps(f.royaltyRate) : null;
    if (basis === "PERCENT_OF_NET" && (rateBps == null || Number.isNaN(rateBps))) errors.royaltyRateBps = "Enter a percentage, for example 25";
    const fixedCents = basis === "FIXED_PER_UNIT" ? eurosToCents(f.royaltyFixed) : null;
    if (basis === "FIXED_PER_UNIT" && (fixedCents == null || Number.isNaN(fixedCents))) errors.royaltyFixedCents = "Enter an amount in euros";
    if (!f.workId) errors.workId = "Choose a work";
    if (!f.arrangerId) errors.arrangerId = "Choose an arranger";
    if (Object.keys(errors).length) return { errors };
    return {
      errors,
      payload: {
        sku: f.sku.trim(),
        slug: f.slug.trim(),
        workId: f.workId,
        arrangerId: f.arrangerId,
        displayTitle: f.displayTitle.trim(),
        subtitle: f.subtitle,
        description: f.description,
        currency: "EUR",
        priceCents,
        durationSeconds,
        tempoBpm,
        musicalKey: f.musicalKey,
        timeSignature: f.timeSignature,
        difficulty,
        releaseDate: f.releaseDate || null,
        featured: f.featured,
        searchKeywords: f.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        compatibilityNotes: f.compatibilityNotes,
        containsMidi: f.containsMidi,
        containsAudio: f.containsAudio,
        containsVideo: f.containsVideo,
        dmiFormatVersion: f.dmiFormatVersion,
        internalNotes: f.internalNotes,
        royaltyBasis: basis,
        royaltyRateBps: basis === "PERCENT_OF_NET" ? rateBps : basis ? 0 : null,
        royaltyFixedCents: fixedCents,
        genreIds: f.genreIds,
        tagIds: f.tagIds,
        compatibility: Object.entries(f.compat).map(([systemProfileId, notes]) => ({ systemProfileId, notes })),
        rightsStatus: f.rightsStatus,
        rightsTerritory: f.rightsTerritory,
        licenseReference: f.licenseReference,
        licenseStartsAt: f.licenseStartsAt || null,
        licenseEndsAt: f.licenseEndsAt || null,
        rightsNotes: f.rightsNotes,
      },
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const { payload, errors } = buildPayload();
    setFieldErrors(errors);
    if (!payload) {
      setError("Some fields need attention. Check the highlighted fields below.");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const created = await apiFetch<{ id: string }>("/api/admin/shop/arrangements", { body: payload });
        router.push(`/admin/shop/arrangements/${created.id}?tab=files`);
        router.refresh();
        return;
      }
      await apiFetch(`/api/admin/shop/arrangements/${initial.id}`, { method: "PATCH", body: payload });
      setSaved(true);
      setAutoUnpublished(null);
      if (status === "PUBLISHED") {
        // The server moves a published arrangement back to draft when an edit breaks a publish rule.
        const check = await apiFetch<{ publishable: boolean; issues: { code: string; message: string }[] }>(
          `/api/admin/shop/arrangements/${initial.id}/publish-check`,
        ).catch(() => null);
        if (check && !check.publishable) setAutoUnpublished(check.issues);
      }
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
  const activeProfiles = lookups.profiles.filter((p) => p.active || f.compat[p.id] !== undefined);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      {saved && !autoUnpublished && <Notice tone="success">Arrangement saved.</Notice>}
      {saved && autoUnpublished && (
        <Notice tone="error">
          Saved, but the arrangement no longer passes the publish check and was moved back to draft:{" "}
          {autoUnpublished.map((i) => i.message).join(" ")}
        </Notice>
      )}

      <Panel title="Basics">
        <FormGrid>
          <Field label="Display title" htmlFor="a-title" error={fe("displayTitle")} className="sm:col-span-2">
            <input id="a-title" className={inputClass} value={f.displayTitle} onChange={(e) => set("displayTitle", e.target.value)} required maxLength={200} />
          </Field>
          <Field label="Subtitle" htmlFor="a-subtitle" error={fe("subtitle")} className="sm:col-span-2">
            <input id="a-subtitle" className={inputClass} value={f.subtitle} onChange={(e) => set("subtitle", e.target.value)} maxLength={200} />
          </Field>
          <Field label="SKU" htmlFor="a-sku" error={fe("sku")} help="Letters, digits, dot, dash, underscore.">
            <input id="a-sku" className={inputClass} value={f.sku} onChange={(e) => set("sku", e.target.value)} required maxLength={64} autoComplete="off" />
          </Field>
          <Field label="Slug" htmlFor="a-slug" error={fe("slug")} help={slugTouched ? "Used in the storefront URL." : "Suggested from title and SKU until you edit it."}>
            <input
              id="a-slug"
              className={inputClass}
              value={f.slug}
              onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }}
              required
              maxLength={120}
              autoComplete="off"
            />
          </Field>
          <Field label="Description" htmlFor="a-desc" error={fe("description")} className="sm:col-span-2">
            <textarea id="a-desc" className={textareaClass} rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={10000} />
          </Field>
        </FormGrid>
      </Panel>

      <Panel
        title="Work and arranger"
        actions={
          <>
            <Link className={btn.ghost} href="/admin/shop/works">Manage works</Link>
            <Link className={btn.ghost} href="/admin/shop/arrangers">Manage arrangers</Link>
          </>
        }
      >
        <FormGrid>
          <Field label="Work" htmlFor="a-work" error={fe("workId")}>
            <select id="a-work" className={selectClass} value={f.workId} onChange={(e) => set("workId", e.target.value)} required>
              <option value="">Choose a work</option>
              {lookups.works.map((w) => (
                <option key={w.id} value={w.id}>{w.title}{w.originalArtist ? `, ${w.originalArtist}` : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Arranger" htmlFor="a-arranger" error={fe("arrangerId")}>
            <select id="a-arranger" className={selectClass} value={f.arrangerId} onChange={(e) => set("arrangerId", e.target.value)} required>
              <option value="">Choose an arranger</option>
              {lookups.arrangers.map((a) => (
                <option key={a.id} value={a.id}>{a.name}{a.active ? "" : " (inactive)"}</option>
              ))}
            </select>
          </Field>
        </FormGrid>
      </Panel>

      <Panel title="Pricing and royalty" description="Leave the royalty override on the arranger default unless this arrangement has its own deal.">
        <FormGrid cols={3}>
          <Field label="Price (EUR)" htmlFor="a-price" error={fe("priceCents")} help="Including VAT, as shown to customers.">
            <input id="a-price" className={inputClass} inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value)} required />
          </Field>
          <Field label="Royalty basis" htmlFor="a-basis" error={fe("royaltyBasis")}>
            <select id="a-basis" className={selectClass} value={f.royaltyBasis} onChange={(e) => set("royaltyBasis", e.target.value)}>
              <option value="">Arranger default</option>
              {ROYALTY_BASES.map((b) => <option key={b} value={b}>{ROYALTY_BASIS_LABEL[b]}</option>)}
            </select>
          </Field>
          {f.royaltyBasis === "PERCENT_OF_NET" && (
            <Field label="Royalty rate (%)" htmlFor="a-rate" error={fe("royaltyRateBps")} help="Percent of the net amount.">
              <input id="a-rate" className={inputClass} inputMode="decimal" value={f.royaltyRate} onChange={(e) => set("royaltyRate", e.target.value)} />
            </Field>
          )}
          {f.royaltyBasis === "FIXED_PER_UNIT" && (
            <Field label="Fixed royalty (EUR)" htmlFor="a-fixed" error={fe("royaltyFixedCents")} help="Per unit, capped at the net allocation.">
              <input id="a-fixed" className={inputClass} inputMode="decimal" value={f.royaltyFixed} onChange={(e) => set("royaltyFixed", e.target.value)} />
            </Field>
          )}
        </FormGrid>
      </Panel>

      <Panel title="Music metadata" description="Empty fields are filled from the first active MIDI master. Values you enter are never overwritten.">
        <FormGrid cols={3}>
          <Field label="Duration (mm:ss)" htmlFor="a-dur" error={fe("durationSeconds")}>
            <input id="a-dur" className={inputClass} value={f.duration} onChange={(e) => set("duration", e.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Tempo (BPM)" htmlFor="a-tempo" error={fe("tempoBpm")}>
            <input id="a-tempo" className={inputClass} value={f.tempo} onChange={(e) => set("tempo", e.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Key" htmlFor="a-key" error={fe("musicalKey")}>
            <input id="a-key" className={inputClass} value={f.musicalKey} onChange={(e) => set("musicalKey", e.target.value)} maxLength={40} />
          </Field>
          <Field label="Time signature" htmlFor="a-ts" error={fe("timeSignature")}>
            <input id="a-ts" className={inputClass} value={f.timeSignature} onChange={(e) => set("timeSignature", e.target.value)} maxLength={20} />
          </Field>
          <Field label="Difficulty" htmlFor="a-diff" error={fe("difficulty")}>
            <select id="a-diff" className={selectClass} value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              <option value="">Not set</option>
              {[1, 2, 3, 4, 5].map((d) => (
                <option key={d} value={d}>{d}{d === 1 ? ", easy" : d === 5 ? ", virtuoso" : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Release date" htmlFor="a-rel" error={fe("releaseDate")}>
            <input id="a-rel" type="date" className={inputClass} value={f.releaseDate} onChange={(e) => set("releaseDate", e.target.value)} />
          </Field>
          <Field label="DMI format version" htmlFor="a-dmiv" error={fe("dmiFormatVersion")}>
            <input id="a-dmiv" className={inputClass} value={f.dmiFormatVersion} onChange={(e) => set("dmiFormatVersion", e.target.value)} maxLength={40} />
          </Field>
        </FormGrid>
      </Panel>

      <Panel title="Storefront">
        <div className="flex flex-col gap-6">
          <Checkbox id="a-featured" label="Featured" help="Shown in featured spots on the storefront." checked={f.featured} onChange={(v) => set("featured", v)} />
          <Field label="Search keywords" htmlFor="a-kw" error={fe("searchKeywords")} help="Comma-separated. Stored in lowercase.">
            <input id="a-kw" className={inputClass} value={f.keywords} onChange={(e) => set("keywords", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <fieldset>
              <legend className="text-sm font-medium text-neutral-800">Genres</legend>
              {lookups.genres.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">No genres yet. <Link className="underline" href="/admin/shop/profiles">Add genres</Link>.</p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {lookups.genres.map((g) => (
                    <Checkbox key={g.id} id={`g-${g.id}`} label={g.name} checked={f.genreIds.includes(g.id)} onChange={(v) => toggle("genreIds", g.id, v)} />
                  ))}
                </div>
              )}
            </fieldset>
            <fieldset>
              <legend className="text-sm font-medium text-neutral-800">Tags</legend>
              {lookups.tags.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-500">No tags yet. <Link className="underline" href="/admin/shop/profiles">Add tags</Link>.</p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {lookups.tags.map((t) => (
                    <Checkbox key={t.id} id={`t-${t.id}`} label={t.name} checked={f.tagIds.includes(t.id)} onChange={(v) => toggle("tagIds", t.id, v)} />
                  ))}
                </div>
              )}
            </fieldset>
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-neutral-800">Content flags</legend>
            <p className="mt-1 text-xs text-neutral-500">Set automatically when a matching master becomes active. Adjust only if needed.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
              <Checkbox id="a-cm" label="Contains MIDI" checked={f.containsMidi} onChange={(v) => set("containsMidi", v)} />
              <Checkbox id="a-ca" label="Contains audio" checked={f.containsAudio} onChange={(v) => set("containsAudio", v)} />
              <Checkbox id="a-cv" label="Contains video" checked={f.containsVideo} onChange={(v) => set("containsVideo", v)} />
            </div>
          </fieldset>
        </div>
      </Panel>

      <Panel
        title="Compatibility"
        description="At least one active profile (or the generic profile) is required to publish."
        actions={<Link className={btn.ghost} href="/admin/shop/profiles">Manage profiles</Link>}
      >
        {activeProfiles.length === 0 ? (
          <p className="text-sm text-neutral-500">No compatibility profiles yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {activeProfiles.map((p) => {
              const on = f.compat[p.id] !== undefined;
              return (
                <li key={p.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 md:flex-row md:items-start md:justify-between">
                  <Checkbox
                    id={`p-${p.id}`}
                    checked={on}
                    onChange={(v) => toggleProfile(p.id, v)}
                    label={<>{p.name}{p.isGeneric ? " (generic)" : ""}{p.active ? "" : " (inactive)"}</>}
                    help={[p.code, p.manufacturer].filter(Boolean).join(", ")}
                  />
                  {on && (
                    <div className="w-full md:max-w-sm">
                      <label htmlFor={`pn-${p.id}`} className="text-xs font-medium text-neutral-700">Notes for this profile</label>
                      <input
                        id={`pn-${p.id}`}
                        className={`${inputClass} mt-1`}
                        value={f.compat[p.id] ?? ""}
                        maxLength={500}
                        onChange={(e) => set("compat", { ...f.compat, [p.id]: e.target.value })}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-6">
          <Field label="Compatibility notes" htmlFor="a-cnotes" error={fe("compatibilityNotes")}>
            <textarea id="a-cnotes" className={textareaClass} rows={3} value={f.compatibilityNotes} onChange={(e) => set("compatibilityNotes", e.target.value)} maxLength={2000} />
          </Field>
        </div>
      </Panel>

      <Panel
        title="Rights workflow"
        description="This is internal workflow data for tracking clearance, not a legal conclusion. Publishing requires Cleared or Public domain."
      >
        <FormGrid>
          <Field label="Rights status" htmlFor="a-rs" error={fe("rightsStatus")}>
            <select id="a-rs" className={selectClass} value={f.rightsStatus} onChange={(e) => set("rightsStatus", e.target.value)}>
              {RIGHTS_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
            </select>
          </Field>
          <Field label="Territory" htmlFor="a-terr" error={fe("rightsTerritory")}>
            <input id="a-terr" className={inputClass} value={f.rightsTerritory} onChange={(e) => set("rightsTerritory", e.target.value)} maxLength={200} />
          </Field>
          <Field label="License reference" htmlFor="a-lref" error={fe("licenseReference")}>
            <input id="a-lref" className={inputClass} value={f.licenseReference} onChange={(e) => set("licenseReference", e.target.value)} maxLength={200} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="License starts" htmlFor="a-ls" error={fe("licenseStartsAt")}>
              <input id="a-ls" type="date" className={inputClass} value={f.licenseStartsAt} onChange={(e) => set("licenseStartsAt", e.target.value)} />
            </Field>
            <Field label="License ends" htmlFor="a-le" error={fe("licenseEndsAt")}>
              <input id="a-le" type="date" className={inputClass} value={f.licenseEndsAt} onChange={(e) => set("licenseEndsAt", e.target.value)} />
            </Field>
          </div>
          <Field label="Rights notes" htmlFor="a-rn" error={fe("rightsNotes")} className="sm:col-span-2">
            <textarea id="a-rn" className={textareaClass} rows={3} value={f.rightsNotes} onChange={(e) => set("rightsNotes", e.target.value)} maxLength={4000} />
          </Field>
        </FormGrid>
      </Panel>

      <Panel title="Internal notes" description="Staff only. Never shown on the storefront.">
        <Field label="Notes" htmlFor="a-in" error={fe("internalNotes")}>
          <textarea id="a-in" className={textareaClass} rows={4} value={f.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} maxLength={10000} />
        </Field>
      </Panel>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600">
          {isNew ? "After creating, you can upload files." : "Saving a published arrangement into an invalid state moves it back to draft."}
        </p>
        <button type="submit" className={btn.primary} disabled={saving}>
          {saving ? "Saving…" : isNew ? "Create arrangement" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
