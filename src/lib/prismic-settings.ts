import { reverseLocaleLookup } from "@/i18n";
import { createClient } from "@/prismicio";


export async function getSettings(lang?: string) {
  const client = createClient();
  
  try {
    const settings = await client.getSingle("settings", {
      lang: lang ? reverseLocaleLookup(lang) : undefined,
    });
    return settings;
  } catch {
    console.warn("Settings document not found, using defaults");
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
    newsletter_description: "Subscribe to get the latest design news, articles, resources and inspiration.",
    copyright_text: "© Studio Agency Inc.",
  },
}; 