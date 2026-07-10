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
    site_name: "Studio",
    contact_button_text: "Contact us",
    contact_button_link: { url: "/contact" },
    logo: null,
    navigation: [
      { label: "Work", link: { url: "/work" } },
      { label: "About", link: { url: "/about" } },
      { label: "Services", link: { url: "/services" } },
      { label: "Blog", link: { url: "/blog" } },
      { label: "Contact", link: { url: "/contact" } },
    ],
    footer_sections: [
      {
        section_title: "Work",
        section_links: [
          { link_text: "Our Work", link_url: { url: "/work" } },
          { link_text: "Case Studies", link_url: { url: "/case-studies" } },
          { link_text: "Process", link_url: { url: "/process" } },
        ],
      },
      {
        section_title: "Company",
        section_links: [
          { link_text: "About", link_url: { url: "/about" } },
          { link_text: "Blog", link_url: { url: "/blog" } },
          { link_text: "Contact us", link_url: { url: "/contact" } },
        ],
      },
      {
        section_title: "Connect",
        section_links: [
          { link_text: "Facebook", link_url: { url: "#" } },
          { link_text: "Instagram", link_url: { url: "#" } },
          { link_text: "Twitter", link_url: { url: "#" } },
        ],
      },
    ],
    newsletter_title: "Newsletter",
    newsletter_description:
      "Subscribe to get the latest design news, articles, resources and inspiration.",
    copyright_text: "© Studio Agency Inc.",
  },
};
