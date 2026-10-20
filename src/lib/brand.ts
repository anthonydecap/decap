/**
 * Brand tokens shared by slices and components. See BRAND_STYLE.md.
 *
 * The rainbow gradient is the SmartValve signature (Decap's flagship technology, the
 * "Apple Intelligence" of the site). It is never used on standard, Orchestrionix or
 * Atelier pages.
 */
export const SMARTVALVE_GRADIENT = [
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#eab308",
] as const;

/** The full gradient as a CSS `linear-gradient` (also available as `var(--gradient-smartvalve)`). */
export function smartValveGradient(direction = "to right") {
  return `linear-gradient(${direction}, ${SMARTVALVE_GRADIENT.join(", ")})`;
}

/**
 * Page styles. A page picks one in Prismic (`theme` field); the page wrapper sets
 * `data-theme`, and globals.css maps it to colors and fonts.
 *
 * - decap: the standard light, Apple-like style (default)
 * - smartvalve: dark + gradient, SmartValve and Optical MIDI only
 * - orchestrionix: light with a brass accent, Brass Core and /orchestrionix only
 * - atelier: warm ivory, serif headings, Atelier Frank Decap only
 */
export const PAGE_THEMES = ["decap", "smartvalve", "orchestrionix", "atelier"] as const;
export type PageTheme = (typeof PAGE_THEMES)[number];

export function resolvePageTheme(value: unknown): PageTheme {
  return PAGE_THEMES.includes(value as PageTheme) ? (value as PageTheme) : "decap";
}
