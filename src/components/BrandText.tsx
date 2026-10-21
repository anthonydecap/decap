import { Fragment } from "react";

/**
 * Brand names as recognisable text: "SmartValve" in its rainbow gradient, "Brass Core" and
 * "Orchestrionix" in the Orchestrionix brass gradient (classes in globals.css). Use it for short
 * labels: buttons, pills, tags, eyebrows and menu items.
 */
const BRANDS = /(smart ?valve|smARTvalve|brass core|orchestrionix)/gi;

export function BrandText({ children }: { children: string }) {
  const parts = children.split(BRANDS);
  if (parts.length === 1) return <>{children}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={/valve/i.test(part) ? "text-smartvalve" : "text-orchestrionix"}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
