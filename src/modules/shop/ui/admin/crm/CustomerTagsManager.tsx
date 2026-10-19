"use client";

import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { apiFetch } from "../../api";
import { btn, EmptyState, Field, inputClass, Notice, Panel } from "../primitives";
import { useMutation } from "./useMutation";

export type TagRow = { id: string; name: string; description: string | null; isAlert: boolean; customerCount: number };

type Draft = { name: string; description: string; isAlert: boolean };

function TagFields({ idPrefix, value, onChange }: { idPrefix: string; value: Draft; onChange: (d: Draft) => void }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Name" htmlFor={`${idPrefix}-name`}>
        <input id={`${idPrefix}-name`} className={inputClass} required maxLength={60} value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
      </Field>
      <Field label="Description (optional)" htmlFor={`${idPrefix}-desc`}>
        <input id={`${idPrefix}-desc`} className={inputClass} maxLength={300} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <label htmlFor={`${idPrefix}-alert`} className="flex items-start gap-3 text-sm text-neutral-800">
          <input
            id={`${idPrefix}-alert`}
            type="checkbox"
            className="mt-0.5 size-4 rounded border-neutral-300 accent-neutral-950"
            checked={value.isAlert}
            onChange={(e) => onChange({ ...value, isAlert: e.target.checked })}
          />
          <span>
            <span className="font-medium">Alert tag</span>
            <span className="block text-xs text-neutral-500">
              Shows as a warning at the top of the customer page, for things staff must not miss (for example &quot;Requires manual DMI encoding&quot;).
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}

const toBody = (d: Draft) => ({ name: d.name.trim(), description: d.description.trim() || null, isAlert: d.isAlert });

export function CustomerTagsManager({ tags }: { tags: TagRow[] }) {
  const [draft, setDraft] = useState<Draft>({ name: "", description: "", isAlert: false });
  const { busy, error, run } = useMutation();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() => apiFetch("/api/admin/shop/customer-tags", { body: toBody(draft) }));
    if (ok) setDraft({ name: "", description: "", isAlert: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel title="New tag" description="Tags are internal labels. They never change what a customer can buy or download.">
        <form onSubmit={create} className="flex flex-col gap-4">
          <TagFields idPrefix="new-tag" value={draft} onChange={setDraft} />
          {error && <Notice tone="error">{error}</Notice>}
          <div>
            <button type="submit" className={btn.primary} disabled={busy || !draft.name.trim()} aria-busy={busy}>
              {busy ? "Creating..." : "Create tag"}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Tags" description={`${tags.length} tag${tags.length === 1 ? "" : "s"}. Alert tags are listed first.`} padded={false}>
        {tags.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No tags yet" body="Create tags such as VIP, Dealer or Needs Follow-up." />
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {tags.map((t) => (
              <TagItem key={t.id} tag={t} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function TagItem({ tag }: { tag: TagRow }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({ name: tag.name, description: tag.description ?? "", isAlert: tag.isAlert });
  const { busy, error, setError, run } = useMutation();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() => apiFetch(`/api/admin/shop/customer-tags/${tag.id}`, { method: "PATCH", body: toBody(draft) }));
    if (ok) setEditing(false);
  }

  async function remove() {
    const used = tag.customerCount ? ` It is removed from ${tag.customerCount} customer${tag.customerCount === 1 ? "" : "s"}.` : "";
    if (!window.confirm(`Delete the tag "${tag.name}"?${used} This cannot be undone.`)) return;
    await run(() => apiFetch(`/api/admin/shop/customer-tags/${tag.id}`, { method: "DELETE" }));
  }

  return (
    <li className="px-5 py-4 sm:px-6">
      {editing ? (
        <form onSubmit={save} className="flex flex-col gap-4">
          <TagFields idPrefix={`tag-${tag.id}`} value={draft} onChange={setDraft} />
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex gap-2">
            <button type="submit" className={btn.primary} disabled={busy || !draft.name.trim()} aria-busy={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
            <button type="button" className={btn.ghost} onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium text-neutral-950">
              {tag.isAlert && <Warning size={16} weight="bold" aria-label="Alert tag" />}
              {tag.name}
              {tag.isAlert && <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-xs font-semibold text-white">Alert</span>}
            </p>
            {tag.description && <p className="mt-0.5 text-sm text-neutral-600">{tag.description}</p>}
            <p className="mt-0.5 text-xs text-neutral-500">
              {tag.customerCount} customer{tag.customerCount === 1 ? "" : "s"}
            </p>
            {error && <div className="mt-2"><Notice tone="error">{error}</Notice></div>}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              className={btn.ghost}
              onClick={() => {
                setDraft({ name: tag.name, description: tag.description ?? "", isAlert: tag.isAlert });
                setError(null);
                setEditing(true);
              }}
            >
              Edit
            </button>
            <button type="button" className={btn.ghost} onClick={remove} disabled={busy} aria-busy={busy}>
              {busy ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
