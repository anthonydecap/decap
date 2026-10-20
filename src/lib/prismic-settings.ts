import { createClient, repositoryName } from "@/prismicio";
import { urlLangToPrismic } from "@/i18n";
import { prismicErrorFromUnknown, prismicLog } from "@/lib/prismic-debug";

export async function getSettings(lang?: string) {
  const client = createClient();
  const prismicLang = lang ? urlLangToPrismic(lang) : undefined;

  prismicLog("getSettings: request", {
    repository: repositoryName,
    urlLang: lang ?? "(none)",
    prismicLang: prismicLang ?? "(master / default)",
  });

  try {
    const settings = await client.getSingle("settings", {
      ...(prismicLang ? { lang: prismicLang } : {}),
    });
    prismicLog("getSettings: ok", {
      id: settings.id,
      lang: settings.lang,
      type: settings.type,
    });
    return settings;
  } catch (err) {
    prismicErrorFromUnknown(
      "getSettings: failed (singleton type \"settings\") — using defaultSettings",
      err,
      {
        repository: repositoryName,
        urlLang: lang ?? "(none)",
        prismicLang: prismicLang ?? "(master / default)",
      },
    );
    return null;
  }
}

export const defaultSettings = {
  data: {
    site_name: "Decap",
    contact_button_link: { url: "/contact" },
    logo: null,
    // Menu, contact label, footer sections and company details fall back to the translated
    // defaults in Header/Footer (lib/site-nav) for the current language.
    copyright_text: "© Decap Herentals",
  },
};
