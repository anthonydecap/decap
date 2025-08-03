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

  return (
    <Container className="mt-8 sm:mt-12 lg:mt-16">
      <FadeIn className="-mx-6 rounded-4xl bg-neutral-950 px-6 py-20 sm:mx-0 sm:py-32 md:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="max-w-xl">
            {title && (
              <h2 className="font-display text-3xl font-medium text-white sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <div className="mt-6 text-base text-neutral-300">
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