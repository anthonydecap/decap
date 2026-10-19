"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, EmptyState, Field, inputClass, Notice, Panel } from "../primitives";
import { apiErrorParts, intOrNull, type FieldErrors } from "./helpers";
import { FormGrid, textareaClass } from "./ui";

export type WorkRow = {
  id: string;
  title: string;
  originalArtist: string | null;
  composer: string | null;
  year: number | null;
  era: string | null;
  notes: string | null;
  arrangementCount: number;
};

function WorkEditor({ work, onDone }: { work: WorkRow | null; onDone: (saved?: string) => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(work?.title ?? "");
  const [originalArtist, setOriginalArtist] = useState(work?.originalArtist ?? "");
  const [composer, setComposer] = useState(work?.composer ?? "");
  const [year, setYear] = useState(work?.year != null ? String(work.year) : "");
  const [era, setEra] = useState(work?.era ?? "");
  const [notes, setNotes] = useState(work?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const idp = work?.id ?? "new";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const y = intOrNull(year);
    if (Number.isNaN(y)) {
      setFields({ year: "Enter a four-digit year" });
      return;
    }
    setFields({});
    setSaving(true);
    try {
      const body = { title: title.trim(), originalArtist, composer, year: y, era, notes };
      if (work) await apiFetch(`/api/admin/shop/works/${work.id}`, { method: "PATCH", body });
      else await apiFetch("/api/admin/shop/works", { body });
      router.refresh();
      onDone(`Saved work "${body.title}".`);
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
        <Field label="Title" htmlFor={`w-title-${idp}`} error={fields.title} className="sm:col-span-2">
          <input id={`w-title-${idp}`} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        </Field>
        <Field label="Original artist" htmlFor={`w-artist-${idp}`} error={fields.originalArtist}>
          <input id={`w-artist-${idp}`} className={inputClass} value={originalArtist} onChange={(e) => setOriginalArtist(e.target.value)} maxLength={200} />
        </Field>
        <Field label="Composer" htmlFor={`w-comp-${idp}`} error={fields.composer}>
          <input id={`w-comp-${idp}`} className={inputClass} value={composer} onChange={(e) => setComposer(e.target.value)} maxLength={200} />
        </Field>
        <Field label="Year" htmlFor={`w-year-${idp}`} error={fields.year}>
          <input id={`w-year-${idp}`} className={inputClass} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
        </Field>
        <Field label="Era" htmlFor={`w-era-${idp}`} error={fields.era} help="For example 1980s or Baroque.">
          <input id={`w-era-${idp}`} className={inputClass} value={era} onChange={(e) => setEra(e.target.value)} maxLength={60} />
        </Field>
        <Field label="Notes" htmlFor={`w-notes-${idp}`} error={fields.notes} className="sm:col-span-2">
          <textarea id={`w-notes-${idp}`} className={textareaClass} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} />
        </Field>
      </FormGrid>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={btn.primary} disabled={saving}>{saving ? "Saving…" : work ? "Save work" : "Create work"}</button>
        <button type="button" className={btn.ghost} onClick={() => onDone()} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

export function WorksManager({ works }: { works: WorkRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [q, setQ] = useState("");
  const done = (msg?: string) => {
    setCreating(false);
    setEditing(null);
    setNotice(msg ? { tone: "success", text: msg } : null);
  };

  async function remove(w: WorkRow) {
    if (!window.confirm(`Delete the work "${w.title}"? This cannot be undone.`)) return;
    setDeleting(w.id);
    setNotice(null);
    try {
      await apiFetch(`/api/admin/shop/works/${w.id}`, { method: "DELETE" });
      setNotice({ tone: "success", text: `Deleted "${w.title}".` });
      router.refresh();
    } catch (err) {
      setNotice({ tone: "error", text: apiErrorParts(err).message });
    } finally {
      setDeleting(null);
    }
  }

  const needle = q.trim().toLowerCase();
  const shown = needle
    ? works.filter((w) => [w.title, w.originalArtist, w.composer].some((v) => v?.toLowerCase().includes(needle)))
    : works;

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <Panel title="New work">
          <WorkEditor work={null} onDone={done} />
        </Panel>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5 sm:w-80">
            <label htmlFor="w-filter" className="text-sm font-medium text-neutral-800">Filter</label>
            <input id="w-filter" type="search" className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="button" className={btn.primary} onClick={() => { setCreating(true); setEditing(null); setNotice(null); }}>New work</button>
        </div>
      )}
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}

      {works.length === 0 ? (
        <EmptyState title="No works yet" body="A work is the underlying song or composition. Arrangements link to one." />
      ) : shown.length === 0 ? (
        <EmptyState title="No works match" body="Try a different filter." />
      ) : (
        <Panel padded={false}>
          <ul className="divide-y divide-neutral-100">
            {shown.map((w) => (
              <li key={w.id} className="px-5 py-4 sm:px-6">
                {editing === w.id ? (
                  <WorkEditor work={w} onDone={done} />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-950">{w.title}</p>
                      <p className="text-xs text-neutral-500">
                        {[w.originalArtist, w.composer && `composed by ${w.composer}`, w.year, w.era].filter(Boolean).join(", ") || "No details"}
                        {`. ${w.arrangementCount} arrangement${w.arrangementCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" className={btn.secondary} onClick={() => { setEditing(w.id); setCreating(false); }}>Edit</button>
                      <button
                        type="button"
                        className={btn.ghost}
                        onClick={() => remove(w)}
                        disabled={deleting !== null}
                        title={w.arrangementCount ? "Works used by arrangements cannot be deleted" : undefined}
                      >
                        {deleting === w.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
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
