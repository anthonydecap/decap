import type { UrlLocale } from "@/i18n";

/*
 * Fallback menu and footer per language, used when the Prismic settings document for that
 * language does not exist (yet). Client-safe. Keep in step with scripts/content/site-updates.mjs.
 */
type Link = { label: string; link: { url: string } };
type FooterSection = { section_title: string; section_links: { link_text: string; link_url: { url: string } }[] };

const NAV: Record<UrlLocale, [string, string][]> = {
  en: [["Organs", "/organs"], ["Organ pipes", "/organ-pipes"], ["Instruments", "/instruments"], ["smARTvalve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Work", "/work"], ["About", "/about"]],
  fr: [["Orgues", "/organs"], ["Tuyaux d’orgue", "/organ-pipes"], ["Instruments", "/instruments"], ["smARTvalve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Logiciels", "/software"], ["Réalisations", "/work"], ["À propos", "/about"]],
  nl: [["Orgels", "/organs"], ["Orgelpijpen", "/organ-pipes"], ["Instrumenten", "/instruments"], ["smARTvalve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Realisaties", "/work"], ["Over ons", "/about"]],
  de: [["Orgeln", "/organs"], ["Orgelpfeifen", "/organ-pipes"], ["Instrumente", "/instruments"], ["smARTvalve", "/smartvalve"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Projekte", "/work"], ["Über uns", "/about"]],
};

const INSTRUMENTS: [string, string][] = [["Accordion Pedestal & Cube", "/accordion"], ["Pipes", "/pipes"], ["Percussion Unit", "/percussion-unit"], ["Mallet Percussion", "/mallet-percussion"], ["Bellow Organ", "/bellow-organ"]];

const FOOTER: Record<UrlLocale, [string, [string, string][]][]> = {
  en: [
    ["Organs", [["New organs", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI conversion", "/midi-conversion"], ["Organ pipes", "/organ-pipes"], ["Restoration", "/frank-decap"]]],
    ["Instruments", INSTRUMENTS],
    ["Decap", [["smARTvalve", "/smartvalve"], ["For organ builders", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Work", "/work"], ["About", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
  ],
  fr: [
    ["Orgues", [["Nouveaux orgues", "/organs"], ["Organ Composer", "/organ-composer"], ["Conversion MIDI", "/midi-conversion"], ["Tuyaux d’orgue", "/organ-pipes"], ["Restauration", "/frank-decap"]]],
    ["Instruments", INSTRUMENTS],
    ["Decap", [["smARTvalve", "/smartvalve"], ["Pour les facteurs d’orgues", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Logiciels", "/software"], ["Réalisations", "/work"], ["À propos", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
  ],
  nl: [
    ["Orgels", [["Nieuwe orgels", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI-ombouw", "/midi-conversion"], ["Orgelpijpen", "/organ-pipes"], ["Restauratie", "/frank-decap"]]],
    ["Instrumenten", INSTRUMENTS],
    ["Decap", [["smARTvalve", "/smartvalve"], ["Voor orgelbouwers", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Realisaties", "/work"], ["Over ons", "/about"], ["Journal", "/blog"], ["Contact", "/contact"]]],
  ],
  de: [
    ["Orgeln", [["Neue Orgeln", "/organs"], ["Organ Composer", "/organ-composer"], ["MIDI-Umbau", "/midi-conversion"], ["Orgelpfeifen", "/organ-pipes"], ["Restaurierung", "/frank-decap"]]],
    ["Instrumente", INSTRUMENTS],
    ["Decap", [["smARTvalve", "/smartvalve"], ["Für Orgelbauer", "/smartvalve-for-organ-builders"], ["Brass Core", "/brass-core"], ["Software", "/software"], ["Projekte", "/work"], ["Über uns", "/about"], ["Journal", "/blog"], ["Kontakt", "/contact"]]],
  ],
};

export const CONTACT_LABEL: Record<UrlLocale, string> = { en: "Contact", fr: "Contact", nl: "Contact", de: "Kontakt" };

export function defaultNavigation(lang: UrlLocale): Link[] {
  return NAV[lang].map(([label, url]) => ({ label, link: { url } }));
}

export function defaultFooterSections(lang: UrlLocale): FooterSection[] {
  return FOOTER[lang].map(([section_title, links]) => ({
    section_title,
    section_links: links.map(([link_text, url]) => ({ link_text, link_url: { url } })),
  }));
}

/** English menu (kept for existing imports). */
export const DEFAULT_NAVIGATION = defaultNavigation("en");
