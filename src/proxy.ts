import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createLocaleRedirect, pathnameHasLocale } from "@/i18n";

/** Paths that must not be treated as `/:lang` (matcher excludes these so proxy did not run). */
function shouldSkipLocaleRedirect(pathname: string): boolean {
  return (
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images/")
  );
}

export async function proxy(request: NextRequest) {
  if (shouldSkipLocaleRedirect(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!pathnameHasLocale(request)) {
    return createLocaleRedirect(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run proxy for almost all paths so we can skip locale redirect for
     * /favicon.ico etc. Excluding them from the matcher made proxy not run,
     * so /favicon.ico was handled by `app/[lang]` with lang = "favicon.ico".
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
