/**
 * Changes to existing Prismic documents that are not full content files: page styles, the
 * Brass Core URL, and the settings (navigation, footer, company details).
 */
import { markdownToRichText } from "./markdown-to-rich-text.mjs";

const web = (url) => ({ link_type: "Web", url });

const footer = [
  ["Organs", [["New organs", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI conversion", "/midi-conversion"], ["Organ pipes", "/organ-pipes"], ["Restoration", "/frank-decap"]]],
  ["Instruments", [["Accordion Pedestal & Cube", "/accordion"], ["Pipes", "/pipes"], ["Percussion Unit", "/percussion-unit"], ["Mallet Percussion", "/mallet-percussion"], ["Bellow Organ", "/bellow-organ"], ["Brass Core", "/brass-core"]]],
  ["Decap", [["SmartValve", "/smartvalve"], ["Software", "/software"], ["Work", "/work"], ["About", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
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
        if (s.slice_type === "core_hero") s.primary.subtitle = "Orchestrionix";
      }
    },
  },
  {
    type: "page",
    uid: "smartvalve",
    title: "SmartValve",
    description: "SmartValve page style",
    apply(doc) {
      doc.data.theme = "smartvalve";
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
        navigation: [
          ["Organs", "/organs"],
          ["Instruments", "/instruments"],
          ["SmartValve", "/smartvalve"],
          ["Software", "/software"],
          ["Work", "/work"],
          ["About", "/about"],
        ].map(([label, url]) => ({ label, link: web(url) })),
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
