"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, EmptyState, Field, inputClass, Notice, Panel, StatusBadge } from "../primitives";
import { apiErrorParts, slugify, type FieldErrors } from "./helpers";
import { Checkbox, FormGrid, textareaClass } from "./ui";

export type ProfileRow = {
  id: string;
  code: string;
  name: string;
  manufacturer: string | null;
  description: string | null;
  isGeneric: boolean;
  active: boolean;
  usageCount: number;
};

export type TaxonomyRow = { id: string; name: string; slug: string; usageCount: number };

function ProfileEditor({ profile, onDone }: { profile: ProfileRow | null; onDone: (saved?: string) => void }) {
  const router = useRouter();
  const [code, setCode] = useState(profile?.code ?? "");
  const [name, setName] = useState(profile?.name ?? "");
  const [manufacturer, setManufacturer] = useState(profile?.manufacturer ?? "");
  const [description, setDescription] = useState(profile?.description ?? "");
  const [isGeneric, setIsGeneric] = useState(profile?.isGeneric ?? false);
  const [active, setActive] = useState(profile?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});
  const idp = profile?.id ?? "new";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFields({});
    setSaving(true);
    try {
      const body = { code: code.trim().toUpperCase(), name: name.trim(), manufacturer, description, isGeneric, active };
      if (profile) await apiFetch(`/api/admin/shop/profiles/${profile.id}`, { method: "PATCH", body });
      else await apiFetch("/api/admin/shop/profiles", { body });
      router.refresh();
      onDone(`Saved profile ${body.name}.`);
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
        <Field label="Name" htmlFor={`sp-name-${idp}`} error={fields.name}>
          <input id={`sp-name-${idp}`} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required />
        </Field>
        <Field label="Code" htmlFor={`sp-code-${idp}`} error={fields.code} help="UPPERCASE letters, digits, _ and -. Used in imports.">
          <input id={`sp-code-${idp}`} className={`${inputClass} font-mono`} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={64} autoComplete="off" required />
        </Field>
        <Field label="Manufacturer" htmlFor={`sp-man-${idp}`} error={fields.manufacturer}>
          <input id={`sp-man-${idp}`} className={inputClass} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} maxLength={200} />
        </Field>
        <div className="flex flex-col gap-3 pt-1 sm:pt-7">
          <Checkbox id={`sp-gen-${idp}`} label="Generic profile" help="Satisfies the compatibility requirement for publishing." checked={isGeneric} onChange={setIsGeneric} />
          <Checkbox id={`sp-act-${idp}`} label="Active" help="Inactive profiles do not count toward publishing." checked={active} onChange={setActive} />
        </div>
        <Field label="Description" htmlFor={`sp-desc-${idp}`} error={fields.description} className="sm:col-span-2">
          <textarea id={`sp-desc-${idp}`} className={textareaClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </Field>
      </FormGrid>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={btn.primary} disabled={saving}>{saving ? "Saving…" : profile ? "Save profile" : "Create profile"}</button>
        <button type="button" className={btn.ghost} onClick={() => onDone()} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}

export function ProfilesManager({ profiles }: { profiles: ProfileRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const done = (msg?: string) => {
    setCreating(false);
    setEditing(null);
    setNotice(msg ? { tone: "success", text: msg } : null);
  };

  async function remove(p: ProfileRow) {
    if (!window.confirm(`Delete the profile "${p.name}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    setNotice(null);
    try {
      await apiFetch(`/api/admin/shop/profiles/${p.id}`, { method: "DELETE" });
      setNotice({ tone: "success", text: `Deleted "${p.name}".` });
      router.refresh();
    } catch (err) {
      setNotice({ tone: "error", text: apiErrorParts(err).message });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Panel
      title="Compatibility profiles"
      description="Playback systems and instrument setups an arrangement can target."
      actions={!creating ? <button type="button" className={btn.primary} onClick={() => { setCreating(true); setEditing(null); setNotice(null); }}>New profile</button> : undefined}
      padded={false}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
        {creating && (
          <div className="rounded-xl border border-neutral-200 p-4">
            <ProfileEditor profile={null} onDone={done} />
          </div>
        )}
        {profiles.length === 0 && !creating && (
          <EmptyState title="No profiles yet" body="Add at least one profile (or a generic one) so arrangements can be published." />
        )}
      </div>
      {profiles.length > 0 && (
        <ul className="divide-y divide-neutral-100 border-t border-neutral-100">
          {profiles.map((p) => (
            <li key={p.id} className="px-5 py-4 sm:px-6">
              {editing === p.id ? (
                <ProfileEditor profile={p} onDone={done} />
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-neutral-950">{p.name}</p>
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-700">{p.code}</span>
                      {p.isGeneric && <StatusBadge status="GENERIC" />}
                      {!p.active && <StatusBadge status="INACTIVE" />}
                    </div>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {p.manufacturer ? `${p.manufacturer}. ` : ""}Used by {p.usageCount} arrangement{p.usageCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" className={btn.secondary} onClick={() => { setEditing(p.id); setCreating(false); setNotice(null); }}>Edit</button>
                    <button
                      type="button"
                      className={btn.ghost}
                      onClick={() => remove(p)}
                      disabled={deleting !== null}
                      title={p.usageCount ? "Profiles in use cannot be deleted. Deactivate instead." : undefined}
                    >
                      {deleting === p.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function TaxonomyPanel({ kind, items }: { kind: "genre" | "tag"; items: TaxonomyRow[] }) {
  const router = useRouter();
  const noun = kind === "genre" ? "Genre" : "Tag";
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    setFields({});
    setSaving(true);
    try {
      await apiFetch(kind === "genre" ? "/api/admin/shop/genres" : "/api/admin/shop/tags", { body: { name: name.trim(), slug: slug.trim() } });
      setNotice({ tone: "success", text: `${noun} "${name.trim()}" added.` });
      setName("");
      setSlug("");
      setSlugTouched(false);
      router.refresh();
    } catch (err) {
      const p = apiErrorParts(err);
      setNotice({ tone: "error", text: p.message });
      setFields(p.fields);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title={kind === "genre" ? "Genres" : "Tags"} description={kind === "genre" ? "Storefront browse categories." : "Free-form labels for search and filtering."}>
      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name" htmlFor={`${kind}-name`} error={fields.name}>
            <input
              id={`${kind}-name`}
              className={inputClass}
              value={name}
              maxLength={80}
              onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
            />
          </Field>
          <Field label="Slug" htmlFor={`${kind}-slug`} error={fields.slug}>
            <input id={`${kind}-slug`} className={inputClass} value={slug} maxLength={120} autoComplete="off" onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} />
          </Field>
        </div>
        <button type="submit" className={`${btn.secondary} self-start`} disabled={saving || !name.trim()}>
          {saving ? "Saving…" : `Add ${noun.toLowerCase()}`}
        </button>
        {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      </form>
      <div className="mt-5 border-t border-neutral-100 pt-4">
        {items.length === 0 ? (
          <p className="text-sm text-neutral-500">No {kind === "genre" ? "genres" : "tags"} yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {items.map((i) => (
              <li key={i.id} className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-800" title={i.slug}>
                {i.name} <span className="text-xs text-neutral-500 tabular-nums">{i.usageCount}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
