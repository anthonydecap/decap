/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { PrismicRichText, type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";
import { INSTRUMENT_SECTION_PY_LG, instrumentRichText } from "@/lib/instrument-ui";

const InstrumentStats: FC<SliceComponentProps<any>> = ({ slice }) => {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const bg = background_color || "#0a0a0a";
  const items = slice.items || [];

  const hasSubtitle = section_subtitle && section_subtitle.length > 0;
  if (!section_title && !hasSubtitle && items.length === 0) return null;

  return (
    <section className={`${INSTRUMENT_SECTION_PY_LG} text-white`} style={{ backgroundColor: bg }}>
      <Container>
        {(section_title || hasSubtitle) && (
          <div className="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
            {section_title && (
              <FadeIn>
                <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  {section_title}
                </h2>
              </FadeIn>
            )}
            {hasSubtitle && (
              <FadeIn>
                <div className="mt-4 text-lg text-neutral-300">
                  <PrismicRichText field={section_subtitle} components={instrumentRichText} />
                </div>
              </FadeIn>
            )}
          </div>
        )}
        {items.length > 0 && (
          <FadeInStagger faster>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {items.map((item: any, index: number) => (
                <FadeIn key={index}>
                  <div className="text-center">
                    {item.value && (
                      <div className="font-display text-4xl font-bold tabular-nums text-white sm:text-5xl lg:text-6xl">
                        {item.value}
                      </div>
                    )}
                    {item.label && (
                      <div className="mt-2 text-sm font-medium uppercase tracking-wider text-neutral-400">
                        {item.label}
                      </div>
                    )}
                    {item.description && (
                      <div className="mt-2 text-sm text-neutral-300">{item.description}</div>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeInStagger>
        )}
      </Container>
    </section>
  );
};

export default InstrumentStats;
