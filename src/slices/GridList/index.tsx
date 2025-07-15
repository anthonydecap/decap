/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { GridList, GridListItem } from "@/components/GridList";
import { SectionIntro } from "@/components/SectionIntro";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
};

/**
 * Props for `GridList`.
 */
type GridListProps = SliceComponentProps<Content.GridListSlice>;

/**
 * Component for "GridList" Slices.
 */
const GridListSlice: FC<GridListProps> = ({ slice }) => {
  const { title, invert } = slice.primary;

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      {title && (
        <SectionIntro title={title} invert={invert} />
      )}
      <GridList className="mt-16">
        {slice.items.map((item: any, index: number) => (
          <GridListItem
            key={index}
            title={item.item_title || ""}
            invert={invert}
          >
            {item.item_description && (
              <PrismicRichText field={item.item_description} components={components} />
            )}
          </GridListItem>
        ))}
      </GridList>
    </Container>
  );
};

export default GridListSlice; 