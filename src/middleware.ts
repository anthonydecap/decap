import type { NextRequest } from "next/server";
import { createLocaleRedirect, pathnameHasLocale } from "@/i18n";

export async function middleware(request: NextRequest) {
  if (!pathnameHasLocale(request)) {
    return createLocaleRedirect(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images/ (public images)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|images/|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
