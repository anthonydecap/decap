/**
 * Changes to existing Prismic documents that are not full content files: page styles, the
 * Brass Core URL, and the settings (navigation, footer, company details).
 */
import { markdownToRichText } from "./markdown-to-rich-text.mjs";

const web = (url) => ({ link_type: "Web", url });

/** Menu and footer labels per language (paths stay the same; the site adds the language prefix). */
export const NAV = {
  "en-us": [["Organs", "/organs"], ["Organ pipes", "/organ-pipes"], ["Instruments", "/instruments"], ["SmartValve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Work", "/work"], ["About", "/about"]],
  "fr-fr": [["Orgues", "/organs"], ["Tuyaux d’orgue", "/organ-pipes"], ["Instruments", "/instruments"], ["SmartValve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Logiciels", "/software"], ["Réalisations", "/work"], ["À propos", "/about"]],
  "nl-be": [["Orgels", "/organs"], ["Orgelpijpen", "/organ-pipes"], ["Instrumenten", "/instruments"], ["SmartValve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Realisaties", "/work"], ["Over ons", "/about"]],
  "de-de": [["Orgeln", "/organs"], ["Orgelpfeifen", "/organ-pipes"], ["Instrumente", "/instruments"], ["SmartValve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Projekte", "/work"], ["Über uns", "/about"]],
};

const FOOTER_I18N = {
  "fr-fr": { contact: "Contact", sections: [
    ["Orgues", [["Nouveaux orgues", "/organs"], ["Organ Composer", "/organ-composer"], ["Conversion MIDI", "/midi-conversion"], ["Tuyaux d’orgue", "/organ-pipes"], ["Restauration", "/frank-decap"]]],
    ["Instruments", [["Accordion Pedestal & Cube", "/accordion"], ["Pipes", "/pipes"], ["Percussion Unit", "/percussion-unit"], ["Mallet Percussion", "/mallet-percussion"], ["Bellow Organ", "/bellow-organ"]]],
    ["Decap", [["SmartValve", "/smartvalve"], ["Pour les facteurs d’orgues", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Logiciels", "/software"], ["Réalisations", "/work"], ["À propos", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
  ], address: "Langepad 51C\n2200 Herentals, Belgique" },
  "nl-be": { contact: "Contact", sections: [
    ["Orgels", [["Nieuwe orgels", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI-ombouw", "/midi-conversion"], ["Orgelpijpen", "/organ-pipes"], ["Restauratie", "/frank-decap"]]],
    ["Instrumenten", [["Accordion Pedestal & Cube", "/accordion"], ["Pipes", "/pipes"], ["Percussion Unit", "/percussion-unit"], ["Mallet Percussion", "/mallet-percussion"], ["Bellow Organ", "/bellow-organ"]]],
    ["Decap", [["SmartValve", "/smartvalve"], ["Voor orgelbouwers", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Realisaties", "/work"], ["Over ons", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
  ], address: "Langepad 51C\n2200 Herentals, België" },
  "de-de": { contact: "Kontakt", sections: [
    ["Orgeln", [["Neue Orgeln", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI-Umbau", "/midi-conversion"], ["Orgelpfeifen", "/organ-pipes"], ["Restaurierung", "/frank-decap"]]],
    ["Instrumente", [["Accordion Pedestal & Cube", "/accordion"], ["Pipes", "/pipes"], ["Percussion Unit", "/percussion-unit"], ["Mallet Percussion", "/mallet-percussion"], ["Bellow Organ", "/bellow-organ"]]],
    ["Decap", [["SmartValve", "/smartvalve"], ["Für Orgelbauer", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Projekte", "/work"], ["Über uns", "/about"], ["Journal", "/blog"], ["Kontakt", "/contact"]]],
  ], address: "Langepad 51C\n2200 Herentals, Belgien" },
};

/** Settings data for a translated language (menu, footer, company details). */
export function localizedSettingsData(lang) {
  const f = FOOTER_I18N[lang];
  return {
    site_name: "Decap",
    contact_button_text: f.contact,
    contact_button_link: web("/contact"),
    navigation: NAV[lang].map(([label, url]) => ({ label, link: web(url) })),
    footer_sections: f.sections.map(([section_title, links]) => ({
      section_title,
      section_links: links.map(([link_text, url]) => ({ link_text, link_url: web(url) })),
    })),
    company_name: "Decap Herentals",
    company_address: markdownToRichText(f.address),
    company_phone: "+32 14 22 44 94",
    company_email: "info@decap.be",
    company_vat: "DECAP TONY BV · BE 0450.352.984",
    copyright_text: "© Decap Herentals",
  };
}
export const SETTINGS_LANGS = Object.keys(FOOTER_I18N);

const footer = [
  ["Organs", [["New organs", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI conversion", "/midi-conversion"], ["Organ pipes", "/organ-pipes"], ["Restoration", "/frank-decap"]]],
  ["Instruments", [["Accordion Pedestal & Cube", "/accordion"], ["Pipes", "/pipes"], ["Percussion Unit", "/percussion-unit"], ["Mallet Percussion", "/mallet-percussion"], ["Bellow Organ", "/bellow-organ"]]],
  ["Decap", [["SmartValve", "/smartvalve"], ["For organ builders", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Work", "/work"], ["About", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
];

export const siteUpdates = [
  {
    type: "page",
    uid: "core",
    title: "Brass Core",
    description: "uid core → brass-core, Orchestrionix style, SEO",
    apply(doc) {
      doc.uid = "brass-core";
      doc.data.title = [{ type: "heading1", text: "Brass Core", spans: [] }];
      doc.data.theme = "orchestrionix";
      doc.data.meta_title = "Brass Core: robotic brass by Orchestrionix | Decap";
      doc.data.meta_description =
        "Brass Core drives a real trumpet or trombone from an audio signal. A voice-coil embouchure, no modification to the instrument. An Orchestrionix instrument by Decap.";
      for (const s of doc.data.slices ?? []) {
        if (s.slice_type === "core_hero") {
          s.primary.title = "Brass Core";
          s.primary.subtitle = "Orchestrionix";
          const text = "One of our few off-the-shelf products: when it is in stock, it ships straight away.";
          const desc = s.primary.description ?? [];
          if (!desc.some((b) => b.text === text)) s.primary.description = [...desc, { type: "paragraph", text, spans: [] }];
        }
      }
    },
  },
  {
    type: "page",
    uid: "smartvalve",
    title: "SmartValve",
    description: "SmartValve page style, link to the organ builders page",
    apply(doc) {
      doc.data.theme = "smartvalve";
      const link = "/smartvalve-for-organ-builders";
      const has = (doc.data.slices ?? []).some((s) => s.slice_type === "site_cta" && s.primary?.primary_cta_link?.url === link);
      if (!has) {
        doc.data.slices = [
          ...(doc.data.slices ?? []),
          {
            slice_type: "site_cta",
            slice_label: null,
            variation: "default",
            version: "initial",
            primary: {
              eyebrow: "For organ builders",
              title: "Build SmartValve into your next organ",
              body: markdownToRichText("Technical documentation, a demonstration and integration support for organ builders. Prices on request."),
              primary_cta_label: "SmartValve for organ builders",
              primary_cta_link: web(link),
              secondary_cta_label: "Request documentation",
              secondary_cta_link: web(link + "#contact-form"),
              tone: "Default",
            },
            items: [],
          },
        ];
      }
    },
  },
  ...["accordion", "pipes", "percussion-unit", "mallet-percussion"].map((uid) => ({
    type: "page",
    uid,
    description: "standard page style",
    apply(doc) {
      doc.data.theme = "decap";
    },
  })),
  {
    type: "settings",
    uid: null,
    title: "Settings",
    description: "navigation, footer, company details",
    apply(doc) {
      Object.assign(doc.data, {
        site_name: "Decap",
        contact_button_text: "Contact",
        contact_button_link: web("/contact"),
        navigation: NAV["en-us"].map(([label, url]) => ({ label, link: web(url) })),
        footer_sections: footer.map(([section_title, links]) => ({
          section_title,
          section_links: links.map(([link_text, url]) => ({ link_text, link_url: web(url) })),
        })),
        company_name: "Decap Herentals",
        company_address: markdownToRichText("Langepad 51C\n2200 Herentals, Belgium"),
        company_phone: "+32 14 22 44 94",
        company_email: "info@decap.be",
        company_vat: "DECAP TONY BV · BE 0450.352.984",
        copyright_text: "© Decap Herentals",
      });
      delete doc.data.newsletter_title;
      delete doc.data.newsletter_description;
    },
  },
];
