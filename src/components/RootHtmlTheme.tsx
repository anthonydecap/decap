"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isLocaleHomePathname, resolveUrlLang } from "@/i18n";

/**
 * Sets <html lang> and page chrome background from the URL without `headers()`
 * in the root layout (keeps Prismic pages statically cacheable).
 */
export function RootHtmlTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const urlLang = resolveUrlLang(pathname.split("/").filter(Boolean)[0] ?? "en");
    const isHome = isLocaleHomePathname(pathname);
    const html = document.documentElement;

    html.lang = urlLang === "fr" ? "fr" : "en";
    // Toggle only the chrome background: <html> also carries font variable classes from the root layout.
    html.classList.toggle("bg-white", isHome);
    html.classList.toggle("bg-neutral-950", !isHome);
  }, [pathname]);

  return null;
}
