import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Permanent (308) redirects from the old WordPress site (orchestrionix.com, which decap.be used
 * to redirect to) to the new decap.be pages, so old links and search rankings carry over.
 *
 * When orchestrionix.com points at this deployment, every request on that host lands on
 * decap.be: mapped paths go to their new page, anything else to /en/orchestrionix.
 * Old NL/FR/DE pages map to English for now (only EN content exists at launch).
 */

const CANONICAL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.decap.be").replace(/\/$/, "");
const ORCHESTRIONIX_HOST = "(?:www\\.)?orchestrionix\\.com";

/** Old path (without trailing slash) → new path (without language prefix). */
const MAP: Array<[string, string]> = [
  ["/home", "/"],
  ["/about", "/orchestrionix"],
  ["/contact", "/contact"],
  ["/our-projects", "/work"],
  ["/technology", "/smartvalve"],
  ["/technology/smartvalve", "/smartvalve"],
  ["/technology/brass-technology", "/brass-core"],
  ["/technology/percussion-technology", "/percussion-unit"],
  ["/technology/wind-technology", "/smartvalve"],
  ["/project/stephan-eicher-und-die-automaten", "/work/stephan-eicher"],
  ["/project/yves-rechsteiner-lexplorateur", "/work/yves-rechsteiner"],
  ["/project/medence-design-creative-sound-space", "/work/house-of-music-hungary"],
  ["/project/walter-hus-belem-the-mekanics", "/work/walter-hus-belem"],
  ["/decap", "/"],
  ["/decap/about", "/about"],
  ["/decap/contact", "/contact"],
  ["/decap/portfolio", "/work"],
  ["/decap/instruments", "/instruments"],
  ["/decap/instruments/automatic-accordion-pedestal-cube", "/accordion"],
  ["/decap/instruments/bellow-organ", "/bellow-organ"],
  ["/decap/instruments/pipe-cube", "/pipes"],
  ["/decap/instruments/mallet-percussion", "/mallet-percussion"],
  ["/decap/instruments/percussion-unit", "/percussion-unit"],
  ["/decap/instruments/midi-conversion", "/midi-conversion"],
  ["/decap/virtual-orchestrion", "/virtual-orchestrion"],
  ["/decap/midimapper", "/midimapper"],
  ["/decap/organ-pipes", "/organ-pipes"],
  ["/privacy-policy", "/privacy-policy"],
  ["/cookie-policy", "/privacy-policy"],
  ["/terms-and-conditions", "/privacy-policy"],
  ["/no-access", "/"],
];

/** Section catch-alls for old paths not listed above (portfolio items, translated slugs). */
const PREFIXES: Array<[string, string]> = [
  ["/portfolio-list/:slug*", "/work"],
  ["/portfolio-categories/:slug*", "/work"],
  ["/project/:slug*", "/work"],
  ["/decap/instruments/:slug*", "/instruments"],
  ["/decap/:slug*", "/about"],
  ["/technology/:slug*", "/smartvalve"],
];

const en = (path: string) => (path === "/" ? "/en" : `/en${path}`);

/** Old paths that are also valid new-site paths: only redirected on orchestrionix.com. */
const ORCHESTRIONIX_ONLY = new Set(["/about", "/contact", "/privacy-policy"]);

export function legacyRedirects(): Redirect[] {
  const rules: Redirect[] = [];
  const add = (source: string, target: string, onDecapToo = true) => {
    // orchestrionix.com → decap.be (absolute), then the same path on decap.be itself (relative).
    rules.push({ source, destination: `${CANONICAL}${en(target)}`, permanent: true, has: [{ type: "host", value: ORCHESTRIONIX_HOST }] });
    if (onDecapToo) rules.push({ source, destination: en(target), permanent: true });
  };

  for (const [from, to] of MAP) {
    add(from, to, !ORCHESTRIONIX_ONLY.has(from));
    // Old language versions of the same page: /nl/…, /fr/…, /de/… (only when the old path is
    // not a valid new-site path, i.e. under /decap, /technology, /project or /home).
    if (/^\/(decap|technology|project|home)/.test(from)) add(`/:lang(nl|fr|de)${from}`, to);
  }
  for (const [from, to] of PREFIXES) {
    add(from, to);
    add(`/:lang(nl|fr|de)${from}`, to);
  }

  // Old Dutch and German roots (the new site has no NL/DE yet).
  add("/:lang(nl|de)", "/");

  // Everything else on orchestrionix.com: the Orchestrionix page on decap.be.
  rules.push({ source: "/:path*", destination: `${CANONICAL}/en/orchestrionix`, permanent: true, has: [{ type: "host", value: ORCHESTRIONIX_HOST }] });
  return rules;
}
