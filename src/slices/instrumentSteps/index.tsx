/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentSteps: FC<SliceComponentProps<any>> = ({ slice }) => {
  const bg = slice.primary.background_color || "#0a0a0a";
  const items = (slice.items || []).filter(
    (item: any) => item.step_title || item.step_description?.length > 0,
  );

  if (items.length === 0) return null;

  return (
    <section
      className={`${INSTRUMENT_SECTION_PY_LG} text-white`}
      style={{ backgroundColor: bg }}
    >
      <Container>
        {(slice.primary.section_title ||
          slice.primary.section_subtitle?.length > 0) && (
          <FadeIn className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
            {slice.primary.section_title && (
              <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                {slice.primary.section_title}
              </h2>
            )}
            {slice.primary.section_subtitle?.length > 0 && (
              <div className="mt-6 text-lg leading-relaxed text-neutral-300">
                <PrismicRichText
                  field={slice.primary.section_subtitle}
                  components={instrumentRichText}
                />
              </div>
            )}
          </FadeIn>
        )}

        <FadeInStagger faster>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {items.map((item: any, index: number) => (
              <FadeIn key={index}>
                <span className="font-display text-5xl font-bold text-neutral-700 lg:text-6xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.step_title && (
                  <h3 className="mt-4 font-display text-xl font-bold text-white sm:text-2xl">
                    {item.step_title}
                  </h3>
                )}
                {item.step_description?.length > 0 && (
                  <div className="mt-2 leading-relaxed text-neutral-300">
                    <PrismicRichText
                      field={item.step_description}
                      components={instrumentRichText}
                    />
                  </div>
                )}
              </FadeIn>
            ))}
          </div>
        </FadeInStagger>
      </Container>
    </section>
  );
};

export default InstrumentSteps;
