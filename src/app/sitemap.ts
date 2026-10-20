import type { MetadataRoute } from "next";
import { asLink, filter } from "@prismicio/client";
import { absoluteUrl } from "@/lib/site-url";
import { createClient } from "@/prismicio";

export const revalidate = 3600;

/** Every published page, Work project and Journal post, in every language. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient();
  const docs = await client.dangerouslyGetAll({
    filters: [filter.any("document.type", ["page", "project", "blog", "blog_overview"])],
    lang: "*",
  });

  return docs
    .map((doc) => {
      const path = asLink(doc);
      if (!path) return null;
      return {
        url: absoluteUrl(path),
        lastModified: new Date(doc.last_publication_date),
        priority: doc.uid === "home" ? 1 : doc.type === "page" ? 0.8 : 0.6,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
}
