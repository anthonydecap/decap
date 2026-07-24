import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink, PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { SectionIntro } from "@/components/SectionIntro";
import { Button } from "@/components/Button";
import clsx from "clsx";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
  label: ({ node, children }) => {
    if (node.data.label === "codespan") {
      return <code>{children}</code>;
    }
  },
  heading2: ({ children }) => (
    <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
      {children}
    </h2>
  ),
  heading3: ({ children }) => (
    <h3 className="font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
      {children}
    </h3>
  ),
  heading4: ({ children }) => (
    <h4 className="font-display text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
      {children}
    </h4>
  ),
  paragraph: ({ children }) => (
    <p className="text-lg text-neutral-600 leading-relaxed">
      {children}
    </p>
  ),
  preformatted: ({ children }) => (
    <pre className="bg-neutral-100 rounded-lg p-4 text-sm text-neutral-800 overflow-x-auto">
      {children}
    </pre>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-950">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),

};

/**
 * Props for `Content`.
 */
type ContentProps = SliceComponentProps<Content.ContentSlice>;

/**
 * Component for "Content" Slices.
 */
const ContentSlice: FC<ContentProps> = ({ slice }) => {
  const {
    title,
    eyebrow,
    content,
    image,
    image_position,
    background_color,
    call_to_action,
    cta_text,
  } = slice.primary;

  const backgroundClasses = {
    white: "bg-white",
    gray: "bg-neutral-50",
    dark: "bg-neutral-950",
  };

  const textColorClasses = {
    white: "text-neutral-950",
    gray: "text-neutral-950",
    dark: "text-white",
  };

  const bgColor = (background_color as string) || "white";
  const isDark = bgColor === "dark";

  const containerClasses = clsx(
            "py-8 sm:py-12 lg:py-16",
    backgroundClasses[bgColor as keyof typeof backgroundClasses]
  );

  const textColor = textColorClasses[bgColor as keyof typeof textColorClasses];

  const renderContent = () => (
    <div className={clsx("space-y-8", textColor)}>
      {(title || eyebrow) && (
        <SectionIntro title={title || ""} eyebrow={eyebrow || ""} invert={isDark}>
          {/* No description in SectionIntro for this slice */}
        </SectionIntro>
      )}
      
      {content && (
        <div className="prose prose-lg max-w-none">
          <PrismicRichText field={content} components={components} />
        </div>
      )}
      
      {call_to_action && (
        <div className="pt-8">
          <Button href={call_to_action} invert={!isDark}>
            {cta_text || "Learn More"}
          </Button>
        </div>
      )}
    </div>
  );

  const renderImage = () => {
    if (!image) return null;
    
    return (
      <div className="relative overflow-hidden rounded-3xl bg-neutral-100">
        <PrismicNextImage
          field={image}
          className="aspect-[3/2] w-full object-cover"
          alt=""
        />
      </div>
    );
  };

  if (!image || image_position === "top") {
    return (
      <div className={containerClasses}>
        <Container>
          <FadeIn>
            {image && image_position === "top" && (
              <div className="mb-16">
                {renderImage()}
              </div>
            )}
            {renderContent()}
          </FadeIn>
        </Container>
      </div>
    );
  }

  if (image_position === "bottom") {
    return (
      <div className={containerClasses}>
        <Container>
          <FadeIn>
            {renderContent()}
            <div className="mt-16">
              {renderImage()}
            </div>
          </FadeIn>
        </Container>
      </div>
    );
  }

  // Left/Right layout
  const isImageLeft = image_position === "left";
  
  return (
    <div className={containerClasses}>
      <Container>
        <FadeIn>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
            {isImageLeft && (
              <div className="lg:order-first">
                {renderImage()}
              </div>
            )}
            
            <div className={clsx(isImageLeft ? "lg:order-last" : "lg:order-first")}>
              {renderContent()}
            </div>
            
            {!isImageLeft && (
              <div className="lg:order-last">
                {renderImage()}
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </div>
  );
};

export default ContentSlice; 