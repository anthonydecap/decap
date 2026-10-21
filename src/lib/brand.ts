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
 * - orchestrionix: dark with copper/brass, Brass Core and /orchestrionix only
 * - atelier: the site typography in warm workshop colours, Atelier Frank Decap only
 */
export const PAGE_THEMES = ["decap", "smartvalve", "orchestrionix", "atelier"] as const;
export type PageTheme = (typeof PAGE_THEMES)[number];

export function resolvePageTheme(value: unknown): PageTheme {
  return PAGE_THEMES.includes(value as PageTheme) ? (value as PageTheme) : "decap";
}

/** True for dark hex colours (luminance below 50%), e.g. to pick the header colour above a slice. */
export function isDarkColor(hex: string | null | undefined): boolean {
  const h = (hex ?? "").replace("#", "");
  if (h.length !== 6) return true;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}
