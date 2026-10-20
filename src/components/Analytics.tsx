"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { localizeAppPath, urlLangFromPathname } from "@/lib/prismic-link";
import { useUiCopy } from "@/lib/ui-copy";

/**
 * Google Analytics with a consent banner. Nothing from Google loads until the visitor accepts;
 * the choice is remembered in localStorage. The footer's "Cookie settings" button reopens the
 * banner by dispatching `decap:cookie-settings`.
 *
 * Set NEXT_PUBLIC_GA_ID (e.g. G-XXXXXXX). Without it, neither banner nor script render.
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const STORAGE_KEY = "decap-analytics-consent";
type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function saveConsent(v: "granted" | "denied") {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page view only.
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event("decap:cookie-settings"));
}

export function Analytics() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const t = useUiCopy().cookie;

  useEffect(() => {
    const stored = readConsent();
    // Reading localStorage must wait until mount (it does not exist during server rendering).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored);
    setOpen(stored === null);
    setReady(true);
    const reopen = () => setOpen(true);
    window.addEventListener("decap:cookie-settings", reopen);
    return () => window.removeEventListener("decap:cookie-settings", reopen);
  }, []);

  if (!GA_ID || !ready) return null;

  const choose = (v: "granted" | "denied") => {
    saveConsent(v);
    setConsent(v);
    setOpen(false);
    // Withdrawing consent after GA loaded: stop collection now; the script is gone on next load.
    if (v === "denied" && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Cookie choice"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6"
        >
          <p className="text-sm leading-relaxed text-neutral-700">
            {t.text}{" "}
            <Link
              href={localizeAppPath("/privacy-policy", urlLangFromPathname(pathname))}
              className="font-medium text-neutral-950 underline underline-offset-4"
            >
              {t.privacy}
            </Link>
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => choose("granted")}
              className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {t.accept}
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:border-neutral-950"
            >
              {t.decline}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
