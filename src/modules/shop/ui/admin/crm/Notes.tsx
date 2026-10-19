"use client";

import { useState } from "react";
import { apiFetch } from "../../api";
import { formatDateTime } from "../../format";
import { btn, EmptyState, Field, inputClass, Notice } from "../primitives";
import { useMutation } from "./useMutation";

export type NoteRow = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  isMine: boolean;
};

export function AddNoteForm({ customerId }: { customerId: string }) {
  const [body, setBody] = useState("");
  const { busy, error, run } = useMutation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() => apiFetch(`/api/admin/shop/customers/${customerId}/notes`, { body: { body } }));
    if (ok) setBody("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field label="New note" htmlFor="note-body" help="Internal. Customers never see notes.">
        <textarea id="note-body" className={inputClass} rows={3} maxLength={10000} required value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <button type="submit" className={btn.primary} disabled={busy || !body.trim()} aria-busy={busy}>
          {busy ? "Adding..." : "Add note"}
        </button>
      </div>
    </form>
  );
}

export function NotesList({ notes, canWrite }: { notes: NoteRow[]; canWrite: boolean }) {
  if (notes.length === 0) return <EmptyState title="No notes yet" body="Notes are for the next person who picks up the phone." />;
  return (
    <ul className="flex flex-col gap-3">
      {notes.map((n) => (
        <NoteItem key={n.id} note={n} canEdit={canWrite && n.isMine} />
      ))}
    </ul>
  );
}

function NoteItem({ note, canEdit }: { note: NoteRow; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const { busy, error, setError, run } = useMutation();
  const edited = new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() > 1000;

  async function save() {
    const ok = await run(() => apiFetch(`/api/admin/shop/notes/${note.id}`, { method: "PATCH", body: { body: draft } }));
    if (ok) setEditing(false);
  }

  return (
    <li className="rounded-xl bg-neutral-50 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          {note.authorName}, {formatDateTime(note.createdAt)}
          {edited && ", edited"}
        </p>
        {canEdit && !editing && (
          <button
            type="button"
            className={btn.ghost}
            onClick={() => {
              setDraft(note.body);
              setError(null);
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
      </div>
      {editing ? (
        <div className="mt-2 flex flex-col gap-2">
          <label htmlFor={`note-${note.id}`} className="text-sm font-medium text-neutral-800">Note</label>
          <textarea id={`note-${note.id}`} className={inputClass} rows={3} maxLength={10000} value={draft} onChange={(e) => setDraft(e.target.value)} />
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex gap-2">
            <button type="button" className={btn.primary} onClick={save} disabled={busy || !draft.trim()} aria-busy={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
            <button type="button" className={btn.ghost} onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
          </div>
        </div>
      ) : (
        <p className="mt-1 whitespace-pre-wrap break-words text-neutral-900">{note.body}</p>
      )}
    </li>
  );
}
