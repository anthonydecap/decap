/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentLogos: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";
  const items = slice.items || [];

  if (items.length === 0) return null;

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        {(section_title || section_subtitle?.length > 0) && (
          <FadeIn>
            <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
              {section_title && (
                <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {section_title}
                </h2>
              )}
              {section_subtitle?.length > 0 && (
                <div className="mt-4 text-lg text-neutral-400">
                  <PrismicRichText field={section_subtitle} components={instrumentRichText} />
                </div>
              )}
            </div>
          </FadeIn>
        )}

        <FadeInStagger faster>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 sm:gap-x-16 lg:gap-x-20">
            {items.map((item: any, index: number) => {
              const logoContent = (
                <div className="flex h-16 w-[140px] items-center justify-center opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-20 sm:w-[160px]">
                  {item.logo?.url ? (
                    <PrismicNextImage
                      field={item.logo}
                      className="max-h-full w-auto object-contain"
                      alt=""
                    />
                  ) : (
                    <span className="text-sm font-medium text-neutral-500">
                      {item.company_name || "Logo"}
                    </span>
                  )}
                </div>
              );

              return (
                <FadeIn key={index}>
                  {item.link?.url ? (
                    <PrismicNextLink
                      field={item.link}
                      className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500"
                      aria-label={item.company_name || "Partner logo"}
                    >
                      {logoContent}
                    </PrismicNextLink>
                  ) : (
                    logoContent
                  )}
                </FadeIn>
              );
            })}
          </div>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentLogos;
