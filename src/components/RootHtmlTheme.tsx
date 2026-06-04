"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
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
    html.className = clsx(
      "h-full text-base antialiased",
      isHome ? "bg-white" : "bg-neutral-950",
    );
  }, [pathname]);

  return null;
}
