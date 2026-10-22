import { Fragment } from "react";

/**
 * "smARTvalve" in its rainbow gradient (class in globals.css), so the product is instantly
 * recognisable. Only for buttons, labels, badges and pills, never for running text, headings,
 * eyebrows or menus. No other brand gets a gradient.
 */
const SMARTVALVE = /(smart ?valves?)/gi;

export function BrandText({ children }: { children: string }) {
  const parts = children.split(SMARTVALVE);
  if (parts.length === 1) return <>{children}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-smartvalve">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
