import type { Route } from "@prismicio/client";
import { PRISMIC_TO_URL_LOCALE } from "@/i18n";

/**
 * Route resolvers for `asLink()` — one path pattern per Prismic locale so EN/FR
 * can use different UIDs (e.g. `/en/smartvalve` vs `/fr/valve-intelligente`).
 */
export function buildPrismicRoutes(): Route[] {
  const routes: Route[] = [];

  for (const [prismicLang, urlLang] of Object.entries(PRISMIC_TO_URL_LOCALE)) {
    routes.push(
      { type: "page", lang: prismicLang, uid: "home", path: `/${urlLang}` },
      { type: "page", lang: prismicLang, path: `/${urlLang}/:uid` },
      { type: "blog_overview", lang: prismicLang, path: `/${urlLang}/blog` },
      { type: "blog", lang: prismicLang, path: `/${urlLang}/blog/:uid` },
    );
  }

  return routes;
}
