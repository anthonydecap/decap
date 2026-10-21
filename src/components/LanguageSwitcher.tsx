"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { LOCALE_HTML_LANG, LOCALE_NAMES, LOCALE_PATH_PREFIXES, resolveUrlLang, type UrlLocale } from "@/i18n";
import type { LocaleAlternatePaths } from "@/lib/locale-alternates";
import { defaultPathsForPathname, parseLocalizedPath } from "@/lib/locale-path";

type LanguageSwitcherProps = {
  /** Light text for dark headers. */
  invert?: boolean;
  className?: string;
};

/** Pages backed by a Prismic document (UID may differ per locale). */
function needsPrismicAlternates(pathname: string): boolean {
  const kind = parseLocalizedPath(pathname)?.kind;
  return kind === "home" || kind === "page" || kind === "project" || kind === "blog_post" || kind === "blog_overview";
}

function GlobeIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" />
    </svg>
  );
}

/**
 * Language picker: a compact button with the current language code that opens a menu with every
 * language in its own name. Links point to the translated page when it exists (Prismic alternate
 * languages), otherwise to the same path in that language (the server falls back to English).
 */
export function LanguageSwitcher({ invert = false, className }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const currentLang = resolveUrlLang(pathname.split("/").filter(Boolean)[0] ?? "en");
  const fallbackAlternates = useMemo(() => defaultPathsForPathname(pathname), [pathname]);
  const [alternates, setAlternates] = useState<LocaleAlternatePaths>(fallbackAlternates);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset to prefix-swap paths for the new page, then refine with Prismic alternates.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAlternates(fallbackAlternates);
    setOpen(false);
    if (!needsPrismicAlternates(pathname)) return;
    const controller = new AbortController();
    fetch(`/api/locale-alternates?pathname=${encodeURIComponent(pathname)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LocaleAlternatePaths | null) => {
        if (data) setAlternates({ ...fallbackAlternates, ...data });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [pathname, fallbackAlternates]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={clsx("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Language: ${LOCALE_NAMES[currentLang]}`}
        onClick={() => setOpen((o) => !o)}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold uppercase tracking-wide transition",
          invert ? "text-white hover:bg-white/10" : "text-chrome-ink hover:bg-chrome-ink/10",
        )}
      >
        <GlobeIcon className="h-4 w-4" />
        {currentLang}
        <svg viewBox="0 0 12 12" aria-hidden="true" className={clsx("h-3 w-3 transition", open && "rotate-180")}>
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl"
        >
          {(LOCALE_PATH_PREFIXES as readonly UrlLocale[]).map((lang) => {
            const active = lang === currentLang;
            return (
              <li key={lang} role="none">
                <Link
                  role="menuitem"
                  href={alternates[lang] ?? `/${lang}`}
                  hrefLang={LOCALE_HTML_LANG[lang]}
                  lang={LOCALE_HTML_LANG[lang]}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                    active ? "bg-neutral-100 font-semibold text-neutral-950" : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950",
                  )}
                >
                  {LOCALE_NAMES[lang]}
                  <span className="text-xs font-medium uppercase text-neutral-400">{lang}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
