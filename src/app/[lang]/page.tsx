import { type Metadata } from "next";

import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";

import {
  LOCALE_OG,
  LOCALE_PATH_PREFIXES,
  DEFAULT_PRISMIC_LANG,
  resolveUrlLang,
  urlLangToPrismic,
} from "@/i18n";
import { prismicErrorFromUnknown, prismicLog } from "@/lib/prismic-debug";
import { prismicGetByUID } from "@/lib/prismic-get-by-uid";
import { createSliceContext } from "@/lib/slice-context";
import { fallbackToDefaultLocale } from "@/lib/locale-fallback";
import { resolvePageTheme } from "@/lib/brand";
import { PageThemeScope } from "@/components/PageThemeScope";
import {
  buildLocaleMetadataAlternates,
} from "@/lib/locale-alternates";
import { existingLocalePathsFromDocument } from "@/lib/locale-path";
import { createClient, repositoryName } from "@/prismicio";
import { components } from "@/slices";
/** ISR: refresh Prismic HTML hourly; webhook calls `revalidateTag("prismic")` on publish. */
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALE_PATH_PREFIXES.map((lang) => ({ lang }));
}

type Params = { lang: string };

export default async function Home({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;
  const client = createClient();

  prismicLog("home: query (combined UID predicate)", {
    repository: repositoryName,
    urlLang,
    prismicLang,
    uid: "home",
    type: "page",
  });

  let home;
  try {
    home = await prismicGetByUID(client, "page", "home", { lang: prismicLang });
  } catch (err) {
    prismicErrorFromUnknown(
      'home: prismicGetByUID(page, "home") failed',
      err,
      {
        repository: repositoryName,
        urlLang,
        prismicLang,
      },
    );
    // Home not translated yet: English instead of an error.
    if (urlLang !== "en") await fallbackToDefaultLocale("page", "home", urlLang);
    throw err;
  }

  prismicLog("home: resolved", {
    id: home.id,
    uid: home.uid,
    lang: home.lang,
    sliceCount: home.data.slices?.length ?? 0,
  });

  const theme = resolvePageTheme(home.data.theme);

  return (
    <PageThemeScope theme={theme}>
      <SliceZone
        slices={home.data.slices}
        components={components}
        context={createSliceContext(urlLang, { theme })}
      />
    </PageThemeScope>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  const urlLang = resolveUrlLang(lang);
  const prismicLang = urlLangToPrismic(urlLang) ?? DEFAULT_PRISMIC_LANG;
  const client = createClient();
  const home = await prismicGetByUID(client, "page", "home", { lang: prismicLang }).catch(
    (err) => {
      prismicErrorFromUnknown("home: generateMetadata prismicGetByUID failed", err, {
        repository: repositoryName,
        urlLang,
        prismicLang,
      });
      throw err;
    },
  );

  const localePaths = existingLocalePathsFromDocument(home);

  return {
    title: asText(home.data.title),
    description: home.data.meta_description,
    alternates: buildLocaleMetadataAlternates(localePaths, urlLang),
    openGraph: {
      title: home.data.meta_title ?? undefined,
      images: [{ url: home.data.meta_image.url ?? "" }],
      locale: LOCALE_OG[urlLang],
    },
  };
}
