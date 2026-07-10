"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  LOCALE_PATH_PREFIXES,
  resolveUrlLang,
  type UrlLocale,
} from "@/i18n";
import type { LocaleAlternatePaths } from "@/lib/locale-alternates";
import {
  defaultPathsForPathname,
  parseLocalizedPath,
} from "@/lib/locale-path";

const LOCALE_LABELS: Record<UrlLocale, string> = {
  en: "EN",
  fr: "FR",
};

const LOCALE_FULL_LABELS: Record<UrlLocale, string> = {
  en: "English",
  fr: "Français",
};

type LanguageSwitcherProps = {
  /** Header uses inverted (light) styles on the home hero */
  invert?: boolean;
  className?: string;
};

/** Pages backed by a Prismic document (UID may differ per locale). */
function needsPrismicAlternates(pathname: string): boolean {
  const parsed = parseLocalizedPath(pathname);
  return (
    parsed !== null &&
    (parsed.kind === "home" ||
      parsed.kind === "page" ||
      parsed.kind === "blog_post" ||
      parsed.kind === "blog_overview")
  );
}

export function LanguageSwitcher({
  invert = false,
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const currentLang = resolveUrlLang(pathname.split("/").filter(Boolean)[0] ?? "en");
  const fallbackAlternates = useMemo(
    () => defaultPathsForPathname(pathname),
    [pathname],
  );
  const [alternates, setAlternates] =
    useState<LocaleAlternatePaths>(fallbackAlternates);

  useEffect(() => {
    setAlternates(fallbackAlternates);

    if (!needsPrismicAlternates(pathname)) return;

    const controller = new AbortController();
    fetch(
      `/api/locale-alternates?pathname=${encodeURIComponent(pathname)}`,
      { signal: controller.signal },
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LocaleAlternatePaths | null) => {
        if (data) setAlternates(data);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [pathname, fallbackAlternates]);

  return (
    <nav
      aria-label="Language"
      className={clsx("flex items-center", className)}
    >
      <ul className="flex items-center gap-0.5 rounded-full p-0.5 text-sm font-semibold">
        {LOCALE_PATH_PREFIXES.map((urlLang, index) => {
          const href = alternates[urlLang as UrlLocale] ?? `/${urlLang}`;
          const isActive = urlLang === currentLang;

          return (
            <li key={urlLang} className="flex items-center">
              {index > 0 ? (
                <span
                  className={clsx(
                    "mx-1 select-none text-xs font-normal",
                    invert ? "text-white/30" : "text-neutral-400",
                  )}
                  aria-hidden
                >
                  |
                </span>
              ) : null}
              {isActive ? (
                <span
                  className={clsx(
                    "rounded-full px-2.5 py-1",
                    invert
                      ? "bg-white/15 text-white"
                      : "bg-neutral-200 text-neutral-950",
                  )}
                  aria-current="page"
                  lang={urlLang === "fr" ? "fr" : "en"}
                  title={LOCALE_FULL_LABELS[urlLang as UrlLocale]}
                >
                  {LOCALE_LABELS[urlLang as UrlLocale]}
                </span>
              ) : (
                <Link
                  href={href}
                  hrefLang={urlLang === "fr" ? "fr-FR" : "en-US"}
                  lang={urlLang === "fr" ? "fr" : "en"}
                  title={LOCALE_FULL_LABELS[urlLang as UrlLocale]}
                  className={clsx(
                    "rounded-full px-2.5 py-1 transition",
                    invert
                      ? "text-white/70 hover:bg-white/10 hover:text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950",
                  )}
                  rel="alternate"
                >
                  {LOCALE_LABELS[urlLang as UrlLocale]}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
