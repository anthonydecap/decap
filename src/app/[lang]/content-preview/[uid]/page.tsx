/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { PageThemeScope } from "@/components/PageThemeScope";
import { resolvePageTheme } from "@/lib/brand";
import { createSliceContext } from "@/lib/slice-context";
import { components } from "@/slices";
import { urlLangToPrismic } from "@/i18n";

/**
 * Development only: renders a content file (content/pages, content/projects) before it is sent
 * to Prismic. Build the JSON first with `node scripts/content/check.mjs --write`.
 */
export const dynamic = "force-dynamic";

export default async function ContentPreview({ params }: { params: Promise<{ lang: string; uid: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { lang, uid } = await params;
  const prismicLang = urlLangToPrismic(lang) ?? "en-us";
  const name = `${prismicLang === "en-us" ? "" : `${prismicLang}-`}${uid.replace(/[^a-z0-9-]/g, "")}`;
  const file = join(process.cwd(), ".content-build", `${name}.json`);
  if (!existsSync(file)) notFound();
  const doc = JSON.parse(readFileSync(file, "utf8"));
  const theme = resolvePageTheme(doc.data.theme);

  return (
    <PageThemeScope theme={theme}>
      <SliceZone slices={doc.data.slices as any} components={components} context={createSliceContext(lang, { theme })} />
    </PageThemeScope>
  );
}
