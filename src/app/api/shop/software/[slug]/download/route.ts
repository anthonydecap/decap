import { NextResponse } from "next/server";
import { isValidUrlLang } from "@/i18n";
import { loginUrl } from "@/modules/shop/auth/auth0";
import { getCurrentCustomer } from "@/modules/shop/auth/session";
import { ShopError } from "@/modules/shop/errors";
import { jsonError } from "@/modules/shop/http";
import { rateLimit } from "@/modules/shop/services/rate-limit";
import { startDownload } from "@/modules/shop/services/software";

export const dynamic = "force-dynamic";

/**
 * Authenticated installer download. Signed out: back through Auth0 to the software page,
 * which resumes the download. Signed in: records a SoftwareDownload and redirects to a
 * short-lived signed URL (the browser downloads straight from storage).
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const lang = isValidUrlLang(url.searchParams.get("lang") ?? "") ? url.searchParams.get("lang")! : "en";
  const safeSlug = /^[a-z0-9-]{1,120}$/.test(slug) ? slug : "";
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.redirect(new URL(loginUrl(`/${lang}/software/${safeSlug}?download=1`), url.origin), 302);
  }
  try {
    await rateLimit(`software-download:${customer.id}`, 60, 3600);
    const releaseId = url.searchParams.get("release");
    const source = url.searchParams.get("source") === "account" ? "ACCOUNT" : "SOFTWARE_PAGE";
    const { url: signed } = await startDownload(customer, safeSlug, {
      releaseId: releaseId && /^[0-9a-f-]{36}$/i.test(releaseId) ? releaseId : null,
      source,
    });
    const res = NextResponse.redirect(signed, 302);
    res.headers.set("cache-control", "no-store");
    res.headers.set("referrer-policy", "no-referrer");
    return res;
  } catch (e) {
    // The browser navigated here: send people back to the product page, not to JSON.
    if (e instanceof ShopError && (e.code === "UNAVAILABLE" || e.code === "RATE_LIMITED" || e.code === "NOT_FOUND")) {
      const back = new URL(`/${lang}/software/${safeSlug}`, url.origin);
      back.searchParams.set("downloadError", e.code === "RATE_LIMITED" ? "busy" : "unavailable");
      return NextResponse.redirect(back, 302);
    }
    return jsonError(e);
  }
}
