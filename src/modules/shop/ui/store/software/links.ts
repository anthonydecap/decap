import { shopPath } from "../copy";

/**
 * Installer download link. A plain navigation (never fetch): the route redirects signed-out
 * visitors to sign-in, and signed-in customers to a short-lived signed URL.
 */
export function softwareDownloadHref(slug: string, lang: string, source: "account" | "page", releaseId?: string | null): string {
  const q = new URLSearchParams({ lang, source });
  if (releaseId) q.set("release", releaseId);
  return `/api/shop/software/${encodeURIComponent(slug)}/download?${q.toString()}`;
}

export const accountSoftwarePath = (lang: string, slug?: string) =>
  shopPath(lang, `/account/software${slug ? `/${slug}` : ""}`);

export const supportForSoftwareHref = (
  lang: string,
  q: { software?: string; license?: string; installation?: string; activation?: string },
) => {
  const params = new URLSearchParams(Object.entries(q).filter((e): e is [string, string] => Boolean(e[1])));
  const qs = params.toString();
  return `${shopPath(lang, "/account/support/new")}${qs ? `?${qs}` : ""}`;
};
