"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { ChatCircleText, Lock, Paperclip, X } from "@phosphor-icons/react";
import { ApiError, errorMessage } from "../../api";
import { formatBytes } from "../../format";
import { btn, Field, inputClass, Notice } from "../primitives";

type Mode = "reply" | "note";
type NextStatus = "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED";

const MAX_FILES = 5;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.txt,.log,.mid,.midi,application/pdf,image/jpeg,image/png,image/webp,text/plain,audio/midi";

const NEXT_STATUS_OPTIONS: { value: NextStatus; label: string }[] = [
  { value: "IN_PROGRESS", label: "Keep in progress" },
  { value: "WAITING_FOR_CUSTOMER", label: "Ask customer for information" },
  { value: "RESOLVED", label: "Mark resolved" },
];

/**
 * Two explicit modes. "Reply to customer" posts a PUBLIC message (the customer sees it and
 * is emailed). "Add internal note" posts an INTERNAL message (staff only). The visibility
 * is fixed by the mode; there is no control that turns a note into a reply.
 */
export function TicketComposer({
  ticketId,
  customerEmail,
  ticketClosed,
}: {
  ticketId: string;
  customerEmail: string;
  ticketClosed: boolean;
}) {
  const router = useRouter();
  const ids = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("reply");
  const [message, setMessage] = useState("");
  const [nextStatus, setNextStatus] = useState<NextStatus>("IN_PROGRESS");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const isReply = mode === "reply";
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  const fileError =
    files.length > MAX_FILES
      ? `At most ${MAX_FILES} files per message.`
      : totalBytes > MAX_TOTAL_BYTES
        ? `Attachments are limited to 4 MB in total (now ${formatBytes(totalBytes)}).`
        : null;
  const canSend = message.trim().length > 0 && !fileError && !busy;

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setBusy(true);
    setError(null);
    setSent(null);
    const payload = isReply
      ? { message: message.trim(), visibility: "PUBLIC" as const, nextStatus }
      : { message: message.trim(), visibility: "INTERNAL" as const };
    try {
      const form = new FormData();
      form.set("payload", JSON.stringify(payload));
      for (const f of files) form.append("files", f);
      const res = await fetch(`/api/admin/shop/support/${ticketId}/messages`, {
        method: "POST",
        body: form,
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) {
        let err: { code?: string; message?: string } | undefined;
        try {
          err = ((await res.json()) as { error?: { code?: string; message?: string } }).error;
        } catch {
          err = undefined;
        }
        throw new ApiError(res.status, err?.code ?? "HTTP_ERROR", err?.message ?? `Request failed (${res.status})`);
      }
      setMessage("");
      setFiles([]);
      setNextStatus("IN_PROGRESS");
      setSent(isReply ? "Reply sent. The customer has been notified by email." : "Internal note added.");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={clsx(
        "rounded-2xl bg-white p-5 shadow-sm sm:p-6",
        isReply ? "border border-neutral-200" : "border-2 border-dashed border-neutral-400 bg-neutral-50",
      )}
    >
      <div role="tablist" aria-label="Message type" className="mb-5 inline-flex rounded-full border border-neutral-300 bg-white p-1">
        <button
          type="button"
          role="tab"
          aria-selected={isReply}
          onClick={() => setMode("reply")}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition",
            isReply ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950",
          )}
        >
          <ChatCircleText size={16} weight={isReply ? "fill" : "regular"} aria-hidden />
          Reply to customer
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isReply}
          onClick={() => setMode("note")}
          className={clsx(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition",
            !isReply ? "bg-neutral-950 text-white" : "text-neutral-600 hover:text-neutral-950",
          )}
        >
          <Lock size={16} weight={!isReply ? "fill" : "regular"} aria-hidden />
          Add internal note
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {isReply ? (
          <p className="text-sm text-neutral-700">
            <span className="font-semibold text-neutral-950">The customer will see this message</span> and is emailed at{" "}
            <span className="font-medium text-neutral-950">{customerEmail}</span>.
            {ticketClosed && " This ticket is closed; replying will reopen it with the status chosen below."}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-950">
            <Lock size={16} weight="fill" aria-hidden />
            Internal note, only visible to staff. The customer is not notified.
          </p>
        )}

        <Field label={isReply ? "Reply" : "Internal note"} htmlFor={`${ids}-msg`}>
          <textarea
            id={`${ids}-msg`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={10_000}
            className={clsx(inputClass, "resize-y")}
            placeholder={isReply ? "Write your reply to the customer" : "Context for colleagues: what you checked, what is next"}
          />
        </Field>

        <div className={clsx("grid grid-cols-1 gap-4", isReply && "sm:grid-cols-2")}>
          {isReply && (
            <Field label="After sending" htmlFor={`${ids}-next`}>
              <select id={`${ids}-next`} value={nextStatus} onChange={(e) => setNextStatus(e.target.value as NextStatus)} className={inputClass}>
                {NEXT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          )}
          <Field
            label="Attachments"
            htmlFor={`${ids}-files`}
            help="Up to 5 files, 4 MB in total. PDF, JPEG, PNG, WebP, text or MIDI."
            error={fileError}
          >
            <input
              ref={fileInput}
              id={`${ids}-files`}
              type="file"
              multiple
              accept={ACCEPT}
              onChange={(e) => addFiles(e.target.files)}
              className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border file:border-neutral-300 file:bg-white file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-neutral-950 hover:file:border-neutral-950"
            />
          </Field>
        </div>

        {files.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white py-1 pl-3 pr-1 text-xs text-neutral-700">
                <Paperclip size={14} aria-hidden />
                <span className="max-w-[12rem] truncate">{f.name}</span>
                <span className="text-neutral-400">{formatBytes(f.size)}</span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={12} weight="bold" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <Notice tone="error">{error}</Notice>}
        {sent && !error && <Notice tone="success">{sent}</Notice>}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button type="submit" className={btn.primary} disabled={!canSend} aria-busy={busy}>
            {isReply ? <ChatCircleText size={16} weight="bold" aria-hidden /> : <Lock size={16} weight="bold" aria-hidden />}
            {busy ? (isReply ? "Sending reply..." : "Saving note...") : isReply ? "Send reply to customer" : "Add internal note"}
          </button>
        </div>
      </div>
    </form>
  );
}
