import React from "react";
import { PrismicRichText } from "@prismicio/react";
import { SliceComponentProps } from "@prismicio/react";



/**
 * BlogOverview slice component for Prismic.
 */
const BlogOverview = ({ slice }: SliceComponentProps<>) => {
  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        {slice.primary.section_title && (
          <h2 className="text-3xl font-bold mb-4 text-neutral-950">
            <PrismicRichText field={slice.primary.section_title} />
          </h2>
        )}
        {slice.primary.section_description && (
          <div className="text-lg text-neutral-600 mb-6">
            <PrismicRichText field={slice.primary.section_description} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogOverview; 