"use client";

import { useRef, useState } from "react";
import { ApiError } from "../../api";
import { formatBytes } from "../../format";
import { btn, Field, inputClass, Notice } from "../primitives";
import { useMutation } from "./useMutation";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.txt,.mid,.midi,application/pdf,image/jpeg,image/png,image/webp,text/plain,audio/midi";

/** Internal document upload (service paperwork, machine photos, invoice copies). Private storage. */
export function DocumentUpload({ customerId, players }: { customerId: string; players: { id: string; label: string }[] }) {
  const [title, setTitle] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useMutation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(`That file is ${formatBytes(file.size)}. The limit is 4 MB.`);
      return;
    }
    const ok = await run(async () => {
      const form = new FormData();
      form.set("payload", JSON.stringify({ title, registeredPlayerId: playerId || null }));
      form.append("files", file);
      const res = await fetch(`/api/admin/shop/customers/${customerId}/documents`, { method: "POST", body: form, credentials: "same-origin" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
        throw new ApiError(res.status, data?.error?.code ?? "HTTP_ERROR", data?.error?.message ?? `Upload failed (${res.status})`);
      }
    });
    if (ok) {
      setTitle("");
      setPlayerId("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setDone(true);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor="doc-title">
          <input id="doc-title" className={inputClass} required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Player (optional)" htmlFor="doc-player">
          <select id="doc-player" className={inputClass} value={playerId} onChange={(e) => setPlayerId(e.target.value)} disabled={players.length === 0}>
            <option value="">Customer document</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="File" htmlFor="doc-file" help="PDF, JPEG, PNG, WebP, plain text or MIDI. Up to 4 MB.">
        <input
          id="doc-file"
          ref={inputRef}
          type="file"
          required
          accept={ACCEPT}
          className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border file:border-neutral-300 file:bg-white file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-neutral-950 hover:file:border-neutral-950"
          onChange={(e) => {
            setDone(false);
            setFile(e.target.files?.[0] ?? null);
          }}
        />
      </Field>
      {error && <Notice tone="error">{error}</Notice>}
      {done && <Notice tone="success">Document uploaded.</Notice>}
      <div>
        <button type="submit" className={btn.primary} disabled={busy || !file || !title.trim()} aria-busy={busy}>
          {busy ? "Uploading..." : "Upload document"}
        </button>
      </div>
    </form>
  );
}
