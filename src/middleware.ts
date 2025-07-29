import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";
import { createLocaleRedirect, pathnameHasLocale } from "@/i18n";

export async function middleware(request: NextRequest) {
  try {
    // First handle Auth0 authentication if available
    if (auth0) {
      const authResult = await auth0.middleware(request);
      
      // If Auth0 returns a response (redirect, error, etc.), use it
      if (authResult) {
        return authResult;
      }
    }
  } catch (error) {
    // If Auth0 fails, continue with internationalization
    console.warn("Auth0 middleware failed:", error);
  }
  
  // Then handle internationalization
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
