"use client";

import { useId, useRef } from "react";
import { Paperclip, X } from "@phosphor-icons/react";
import { ApiError } from "../api";
import { formatBytes } from "../format";
import { shopCopy } from "./copy";

/** Mirrors the server allowlist (services/support-files.ts); the server re-checks real types. */
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.txt,.log,.mid,.midi,application/pdf,image/jpeg,image/png,image/webp,text/plain,audio/midi";
const ACCEPTED_EXT = ["pdf", "jpg", "jpeg", "png", "webp", "txt", "log", "mid", "midi"];
export const MAX_FILES = 5;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

/** Client-side hint only. Returns a message for the first problem, or null. */
export function checkAttachments(files: File[], lang: string): string | null {
  const t = shopCopy(lang);
  if (files.length > MAX_FILES) return t.tooManyFiles;
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPTED_EXT.includes(ext)) return t.fileNotAccepted(f.name);
  }
  if (files.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) return t.filesTooLarge;
  return null;
}

/**
 * Posts `payload` as JSON, or as multipart (payload + files) when files are attached.
 * Same error shape as apiFetch so callers can show the server's message.
 */
export async function postWithFiles<T>(url: string, payload: unknown, files: File[]): Promise<T> {
  let init: RequestInit;
  if (files.length) {
    const form = new FormData();
    form.set("payload", JSON.stringify(payload));
    for (const f of files) form.append("files", f, f.name);
    init = { method: "POST", body: form };
  } else {
    init = { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) };
  }
  const res = await fetch(url, { ...init, credentials: "same-origin", cache: "no-store" });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    const fallback = res.status === 413 ? "Attachments are limited to 4 MB per message" : `Request failed (${res.status})`;
    throw new ApiError(res.status, err?.code ?? "HTTP_ERROR", err?.message ?? fallback, err?.details);
  }
  return data as T;
}

export function AttachmentPicker({
  lang,
  files,
  onChange,
  error,
  disabled,
}: {
  lang: string;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  const t = shopCopy(lang);
  const id = useId();
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-medium text-neutral-800">{t.attachments}</span>
      <p id={`${id}-hint`} className="text-xs text-neutral-500">{t.attachmentsHint}</p>
      {files.length > 0 && (
        <ul className="mt-1 flex flex-col gap-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <Paperclip size={14} className="shrink-0 text-neutral-500" aria-hidden />
                <span className="truncate text-neutral-950">{f.name}</span>
                <span className="shrink-0 text-xs text-neutral-500">{formatBytes(f.size)}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-neutral-600 hover:text-neutral-950 disabled:opacity-50"
                aria-label={`${t.removeFile} ${f.name}`}
              >
                <X size={12} weight="bold" aria-hidden />
                {t.removeFile}
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={input}
        id={id}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        className="sr-only"
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
        disabled={disabled}
        onChange={(e) => {
          const picked = Array.from(e.currentTarget.files ?? []);
          e.currentTarget.value = "";
          if (picked.length) onChange([...files, ...picked]);
        }}
      />
      <button
        type="button"
        disabled={disabled || files.length >= MAX_FILES}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950 disabled:opacity-50"
      >
        <Paperclip size={16} aria-hidden />
        {t.addFiles}
      </button>
      {error && <p role="alert" className="text-xs font-medium text-neutral-950">{error}</p>}
    </div>
  );
}
