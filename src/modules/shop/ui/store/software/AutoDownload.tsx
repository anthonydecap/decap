"use client";

import { useEffect, useRef } from "react";
import { DownloadSimple } from "@phosphor-icons/react";
import { shopCopy } from "../copy";

/**
 * Resumes the download after sign-in (`?download=1`). Starts once, then drops the query
 * parameter from the address bar so a reload does not download again.
 */
export function AutoDownload({ lang, href }: { lang: string; href: string }) {
  const t = shopCopy(lang).sw;
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete("download");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    window.location.assign(href);
  }, [href]);

  return (
    <div role="status" className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <DownloadSimple size={22} weight="bold" className="mt-0.5 shrink-0 text-neutral-950" aria-hidden />
        <div>
          <p className="font-semibold text-neutral-950">{t.downloadStarting}</p>
          <p className="mt-1 text-sm text-neutral-600">{t.downloadStartingBody}</p>
        </div>
      </div>
      <a href={href} rel="nofollow" className="self-start whitespace-nowrap text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950 sm:self-auto">
        {t.downloadManual}
      </a>
    </div>
  );
}
