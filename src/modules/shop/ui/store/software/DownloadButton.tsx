"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Check, DownloadSimple, X } from "@phosphor-icons/react";
import { shopCopy } from "../copy";

export type DownloadGate = { productName: string; signupHref: string; loginHref: string };

const styles = {
  primary: "rounded-full bg-neutral-950 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-neutral-800",
  secondary: "rounded-full border-2 border-neutral-950 px-8 py-3 text-base font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white",
  compact: "rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950",
} as const;

/**
 * Download control. Signed in: a plain link, so the browser follows the redirect to the
 * signed URL and downloads. Signed out: opens a friendly panel explaining why an account is
 * needed, with Create account and Sign in, both returning to this page to resume.
 */
export function DownloadButton({
  lang,
  href,
  signedIn,
  gate,
  label,
  variant = "primary",
  className,
}: {
  lang: string;
  href: string;
  signedIn: boolean;
  gate: DownloadGate | null;
  label: string;
  variant?: keyof typeof styles;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const iconSize = variant === "compact" ? 14 : 18;
  const cls = clsx("inline-flex items-center justify-center gap-2", styles[variant], className);

  if (signedIn || !gate) {
    return (
      <a href={href} className={cls} rel="nofollow">
        <DownloadSimple size={iconSize} weight="bold" aria-hidden />
        {label}
      </a>
    );
  }
  return (
    <>
      <button type="button" className={cls} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <DownloadSimple size={iconSize} weight="bold" aria-hidden />
        {label}
      </button>
      {open && <GatePanel lang={lang} gate={gate} onClose={() => setOpen(false)} />}
    </>
  );
}

function GatePanel({ lang, gate, onClose }: { lang: string; gate: DownloadGate; onClose: () => void }) {
  const t = shopCopy(lang).sw;
  const all = shopCopy(lang);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="download-gate-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-neutral-200 bg-white p-0 text-neutral-950 shadow-2xl backdrop:bg-neutral-950/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id="download-gate-title" className="font-display text-xl font-bold text-neutral-950 sm:text-2xl">
            {t.gateTitle(gate.productName)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 -mt-1 shrink-0 rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950"
            aria-label={t.close}
          >
            <X size={18} weight="bold" aria-hidden />
          </button>
        </div>
        <p className="mt-4 text-sm text-neutral-600">{t.gateIntro}</p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-neutral-800">
          {t.gateBenefits.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <Check size={14} weight="bold" className="shrink-0 text-neutral-950" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-neutral-500">{t.gateNoPurchase}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {/* Full navigations: Auth0 routes are served by the proxy, not the client router. */}
          <a href={gate.signupHref} className="inline-flex flex-1 items-center justify-center rounded-full bg-neutral-950 px-6 py-3 font-semibold text-white transition hover:bg-neutral-800">
            {all.createAccount}
          </a>
          <a href={gate.loginHref} className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-neutral-950 px-6 py-3 font-semibold text-neutral-950 transition hover:bg-neutral-950 hover:text-white">
            {all.signIn}
          </a>
        </div>
      </div>
    </dialog>
  );
}
