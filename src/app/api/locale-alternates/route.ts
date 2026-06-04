import { NextRequest, NextResponse } from "next/server";
import { getLocaleAlternatePaths } from "@/lib/locale-alternates";
/**
 * Resolves EN/FR paths for the language switcher (blog posts with different UIDs per locale).
 * SEO hreflang is still set in each page's `generateMetadata`.
 */
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname?.startsWith("/")) {
    return NextResponse.json({ error: "Invalid pathname" }, { status: 400 });
  }

  const alternates = await getLocaleAlternatePaths(pathname);
  return NextResponse.json(alternates);
}
