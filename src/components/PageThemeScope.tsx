import clsx from "clsx";
import type { PageTheme } from "@/lib/brand";

/**
 * Wraps a page's slices in its page style (decap, smartvalve, orchestrionix, atelier).
 * Theme-aware slices read the matching CSS variables from globals.css.
 */
export function PageThemeScope({ theme, children }: { theme: PageTheme; children: React.ReactNode }) {
  return (
    <div data-theme={theme} className={clsx("bg-page text-ink", theme === "atelier" && "atelier-paper")}>
      {children}
    </div>
  );
}
