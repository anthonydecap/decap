"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALE_HTML_LANG, resolveUrlLang } from "@/i18n";

/**
 * Sets <html lang> and page chrome background from the URL without `headers()`
 * in the root layout (keeps Prismic pages statically cacheable).
 */
export function RootHtmlTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const urlLang = resolveUrlLang(pathname.split("/").filter(Boolean)[0] ?? "en");
    const html = document.documentElement;

    html.lang = LOCALE_HTML_LANG[urlLang];
    // The frame around the rounded page sheet is always dark.
    html.classList.add("bg-neutral-950");
  }, [pathname]);

  return null;
}
