import {
  DEFAULT_URL_LANG,
  prismicLangToUrl,
  resolveUrlLang,
  type UrlLocale,
} from "@/i18n";

export type LocalizedRouteKind =
  | "home"
  | "page"
  | "blog_overview"
  | "blog_post"
  | "other";

export type ParsedLocalizedPath = {
  urlLang: UrlLocale;
  kind: LocalizedRouteKind;
  uid?: string;
  /** Path without locale prefix, e.g. `/blog/my-post` */
  pathWithoutLocale: string;
};

export function pathForHome(urlLang: UrlLocale): string {
  return `/${urlLang}`;
}

export function pathForPage(urlLang: UrlLocale, uid: string): string {
  return `/${urlLang}/${uid}`;
}

export function pathForBlogOverview(urlLang: UrlLocale): string {
  return `/${urlLang}/blog`;
}

export function pathForBlogPost(urlLang: UrlLocale, uid: string): string {
  return `/${urlLang}/blog/${uid}`;
}

/** Replaces the locale segment in a pathname (`/en/blog` → `/fr/blog`). */
export function swapUrlLangInPathname(
  pathname: string,
  targetUrlLang: UrlLocale,
): string {
  const parsed = parseLocalizedPath(pathname);
  if (!parsed) {
    return pathForHome(targetUrlLang);
  }
  const suffix = parsed.pathWithoutLocale === "/" ? "" : parsed.pathWithoutLocale;
  return `/${targetUrlLang}${suffix}`;
}

export function parseLocalizedPath(pathname: string): ParsedLocalizedPath | null {
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const urlLang = resolveUrlLang(segments[0]!);
  const rest = segments.slice(1);

  if (rest.length === 0) {
    return {
      urlLang,
      kind: "home",
      pathWithoutLocale: "/",
    };
  }

  if (rest[0] === "blog") {
    if (rest.length === 1) {
      return {
        urlLang,
        kind: "blog_overview",
        pathWithoutLocale: "/blog",
      };
    }
    return {
      urlLang,
      kind: "blog_post",
      uid: rest[1],
      pathWithoutLocale: `/blog/${rest[1]}`,
    };
  }

  return {
    urlLang,
    kind: "page",
    uid: rest[0],
    pathWithoutLocale: `/${rest[0]}`,
  };
}

type PrismicAlternate = {
  lang: string;
  uid?: string | null;
  type: string;
};

type PrismicDocumentRef = {
  lang: string;
  uid: string | null;
  type: string;
  alternate_languages?: PrismicAlternate[];
};

/** Paths for locales that exist in Prismic (current + alternate_languages). */
export function existingLocalePathsFromDocument(
  doc: PrismicDocumentRef,
): Partial<Record<UrlLocale, string>> {
  const paths: Partial<Record<UrlLocale, string>> = {};
  if (!doc.uid) return paths;
  paths[prismicLangToUrl(doc.lang) as UrlLocale] = pathForPrismicRef({
    type: doc.type,
    uid: doc.uid,
    lang: doc.lang,
  });

  for (const alt of doc.alternate_languages ?? []) {
    if (!alt.uid) continue;
    paths[prismicLangToUrl(alt.lang) as UrlLocale] = pathForPrismicRef({
      type: alt.type,
      uid: alt.uid,
      lang: alt.lang,
    });
  }

  return paths;
}

/** Builds localized paths for the switcher (includes prefix-swap fallbacks). */
export function pathsFromPrismicDocument(
  doc: PrismicDocumentRef,
  currentPathname: string,
): Record<UrlLocale, string> {
  const currentUrlLang = prismicLangToUrl(doc.lang) as UrlLocale;
  const existing = existingLocalePathsFromDocument(doc);
  return withFallbackPaths(existing, currentPathname, currentUrlLang);
}

function pathForPrismicRef(ref: {
  type: string;
  uid: string;
  lang: string;
}): string {
  const urlLang = prismicLangToUrl(ref.lang) as UrlLocale;

  if (ref.type === "page" && ref.uid === "home") {
    return pathForHome(urlLang);
  }
  if (ref.type === "page") {
    return pathForPage(urlLang, ref.uid);
  }
  if (ref.type === "blog") {
    return pathForBlogPost(urlLang, ref.uid);
  }
  if (ref.type === "blog_overview") {
    return pathForBlogOverview(urlLang);
  }

  return pathForHome(urlLang);
}

/** Fills missing locales with a prefix swap so the switcher always has a target. */
export function withFallbackPaths(
  paths: Partial<Record<UrlLocale, string>>,
  currentPathname: string,
  currentUrlLang: UrlLocale,
): Record<UrlLocale, string> {
  const all: UrlLocale[] = ["en", "fr"];
  const result = {} as Record<UrlLocale, string>;

  for (const urlLang of all) {
    if (paths[urlLang]) {
      result[urlLang] = paths[urlLang]!;
    } else if (urlLang === currentUrlLang) {
      result[urlLang] = currentPathname;
    } else {
      // Different slug per locale — never reuse the other language's UID.
      result[urlLang] = pathForHome(urlLang);
    }
  }

  return result;
}

export function defaultPathsForPathname(pathname: string): Record<UrlLocale, string> {
  const parsed = parseLocalizedPath(pathname);
  const currentUrlLang = parsed?.urlLang ?? DEFAULT_URL_LANG;
  return withFallbackPaths({}, pathname, currentUrlLang);
}
