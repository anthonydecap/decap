import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/*/shop/account", "/*/shop/checkout", "/*/slice-simulator"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
