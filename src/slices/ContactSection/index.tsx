import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { PrismicNextLink } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { Border } from "@/components/Border";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <PrismicNextLink field={node.data}>{children}</PrismicNextLink>;
  },
};

/**
 * Props for `ContactSection`.
 */
type ContactSectionProps = SliceComponentProps<Content.ContactSectionSlice>;

/**
 * Component for "ContactSection" Slices.
 */
const ContactSection: FC<ContactSectionProps> = ({ slice }) => {
  const { title, description, email, phone } = slice.primary;
  const background_color = (slice.primary as { background_color?: string }).background_color;
  const bgColor = background_color || "#0a0a0a";

  return (
    <Container className="mt-8 sm:mt-12 lg:mt-16">
      <FadeIn className="-mx-6 rounded-4xl px-6 py-20 sm:mx-0 sm:py-32 md:px-12" style={{ backgroundColor: bgColor }}>
        <div className="mx-auto max-w-4xl">
          <div className="max-w-xl">
            {title && (
              <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight text-white">
                {title}
              </div>
            )}
            {description && (
              <div className="mt-6 text-xl text-neutral-400">
                <PrismicRichText field={description} components={components} />
              </div>
            )}
            <div className="mt-10">
              {email && (
                <Border className="mt-6 pt-6" invert>
                  <h3 className="font-semibold text-white">Email us</h3>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${email}`}
                      className="text-neutral-300 hover:text-white"
                    >
                      {email}
                    </a>
                  </dd>
                </Border>
              )}
              {phone && (
                <Border className="mt-6 pt-6" invert>
                  <h3 className="font-semibold text-white">Call us</h3>
                  <dd className="mt-2">
                    <a
                      href={`tel:${phone}`}
                      className="text-neutral-300 hover:text-white"
                    >
                      {phone}
                    </a>
                  </dd>
                </Border>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
};

export default ContactSection; 