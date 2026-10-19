"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ApiError, errorMessage } from "../api";
import { AttachmentPicker, checkAttachments, postWithFiles } from "./AttachmentPicker";
import { shopCopy, shopPath } from "./copy";
import { inputClass } from "./ProfileForm";

/** Reply box on a support request. A refused reply (closed / resolved long ago) offers a new request. */
export function SupportReplyForm({ lang, ticketId }: { lang: string; ticketId: string }) {
  const t = shopCopy(lang);
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refused, setRefused] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <form
      ref={form}
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const problem = checkAttachments(files, lang);
        setFileError(problem);
        if (problem) return;
        const message = String(new FormData(e.currentTarget).get("message") ?? "").trim();
        setBusy(true);
        setError(null);
        setSent(false);
        try {
          await postWithFiles(`/api/shop/support/${ticketId}/messages`, { message }, files);
          form.current?.reset();
          setFiles([]);
          setSent(true);
          router.refresh();
        } catch (err) {
          setError(errorMessage(err));
          if (err instanceof ApiError && err.code === "INVALID_STATE") setRefused(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="reply" className="text-sm font-medium text-neutral-800">{t.replyLabel}</label>
        <textarea id="reply" name="message" required maxLength={10000} rows={5} disabled={refused} className={inputClass} />
      </div>
      <AttachmentPicker
        lang={lang}
        files={files}
        disabled={busy || refused}
        error={fileError}
        onChange={(next) => {
          setFiles(next);
          setFileError(checkAttachments(next, lang));
        }}
      />
      <div className="flex flex-col gap-4" aria-live="polite">
        {error && (
          <div role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">
            <p>{error}</p>
            {refused && (
              <Link href={shopPath(lang, "/account/support/new")} className="mt-2 inline-block font-semibold underline underline-offset-4">
                {t.openNewRequest}
              </Link>
            )}
          </div>
        )}
        {sent && !error && <p className="text-sm text-neutral-600">{t.replySent}</p>}
        {!refused && (
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="self-start rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {busy ? `${t.sending}…` : t.sendReply}
          </button>
        )}
      </div>
    </form>
  );
}
