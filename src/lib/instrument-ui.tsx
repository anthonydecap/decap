import { PrismicNextLink } from "@prismicio/next";
import type { JSXMapSerializer } from "@prismicio/react";

export const INSTRUMENT_SECTION_PY = "py-12 sm:py-16 lg:py-24";
export const INSTRUMENT_SECTION_PY_LG = "py-16 sm:py-24 lg:py-32";

export const instrumentRichText: JSXMapSerializer = {
  hyperlink: ({ node, children }) => (
    <PrismicNextLink field={node.data}>{children}</PrismicNextLink>
  ),
  label: ({ node, children }) =>
    node.data.label === "codespan" ? (
      <code className="rounded bg-neutral-800 px-1 py-0.5 text-sm font-mono text-neutral-400">
        {children}
      </code>
    ) : null,
};
