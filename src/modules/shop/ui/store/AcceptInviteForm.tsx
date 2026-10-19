"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { apiFetch, errorMessage } from "../api";
import { shopCopy } from "./copy";

/** Accepts a staff invitation for the signed-in account. The server checks the email match. */
export function AcceptInviteForm({ lang, token }: { lang: string; token: string }) {
  const t = shopCopy(lang);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div aria-live="polite">
        <p className="flex items-center gap-2 font-medium text-neutral-950">
          <CheckCircle size={22} weight="fill" aria-hidden />
          {t.inviteAccepted}
        </p>
        <Link href="/admin/shop" className="mt-6 inline-block rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800">
          {t.goToAdmin}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm text-neutral-950">
          <p className="font-medium">{error}</p>
          <p className="mt-2 text-neutral-700">{t.inviteWrongAccount}</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Auth0 route needs a full page load */}
          <a href="/auth/logout" className="mt-2 inline-block font-semibold underline underline-offset-4">{t.signOut}</a>
        </div>
      )}
      <button
        type="button"
        disabled={busy}
        aria-busy={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await apiFetch("/api/shop/staff-invite/accept", { method: "POST", body: { token } });
            setDone(true);
          } catch (err) {
            setError(errorMessage(err));
          } finally {
            setBusy(false);
          }
        }}
        className="self-start rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {busy ? `${t.accepting}…` : t.acceptInvite}
      </button>
    </div>
  );
}
