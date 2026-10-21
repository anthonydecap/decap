import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createLocaleRedirect, pathnameHasLocale } from "@/i18n";
import { auth0 } from "@/modules/shop/auth/auth0";

/** Paths that must not be treated as `/:lang` (matcher excludes these so proxy did not run). */
function shouldSkipLocaleRedirect(pathname: string): boolean {
  return (
    pathname === "/favicon.ico" ||
    pathname === "/icon.png" ||
    pathname === "/apple-icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images/") ||
    // Files from /public (3D models, videos, PDFs…): never locale-prefixed.
    /\.[a-z0-9]{2,5}$/i.test(pathname)
  );
}

/** DMI shop routes that live outside the `/:lang` tree. */
function isShopSystemPath(pathname: string): boolean {
  return (
    pathname.startsWith("/auth/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/shop/") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/stripe/")
  );
}

/** Shop pages that use the Auth0 session (rolling session refresh). */
function usesShopSession(pathname: string): boolean {
  return /^\/[a-z]{2}\/(shop|software)(\/|$)/.test(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/api/shop/") || pathname.startsWith("/api/admin/");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (shouldSkipLocaleRedirect(pathname)) {
    return NextResponse.next();
  }

  // Auth0 Universal Login routes: /auth/login, /auth/logout, /auth/callback, …
  if (pathname.startsWith("/auth/")) {
    return auth0().middleware(request);
  }

  // Stripe webhooks: raw body, no session, no locale.
  if (pathname.startsWith("/api/stripe/")) {
    return NextResponse.next();
  }

  if (isShopSystemPath(pathname)) {
    return auth0().middleware(request);
  }

  // Other API routes (contact, Prismic preview/revalidate webhook): never locale-prefixed.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!pathnameHasLocale(request)) {
    return createLocaleRedirect(request);
  }

  if (usesShopSession(pathname)) {
    return auth0().middleware(request);
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
