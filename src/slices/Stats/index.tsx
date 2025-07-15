/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from "react";
import { type Content } from "@prismicio/client";
import { type SliceComponentProps } from "@prismicio/react";
import { Container } from "@/components/Container";
import { FadeIn, FadeInStagger } from "@/components/FadeIn";

/**
 * Props for `Stats`.
 */
type StatsProps = SliceComponentProps<Content.StatsSlice>;

/**
 * Component for "Stats" Slices.
 */
const Stats: FC<StatsProps> = ({ slice }) => {
  const { title } = slice.primary;

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn className="max-w-2xl">
        {title && (
          <h2 className="font-display text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            {title}
          </h2>
        )}
      </FadeIn>
      <FadeInStagger className="mt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {slice.items.map((item: any, index: number) => (
            <div key={index} className="flex">
              <div className="flex-none rounded-full bg-neutral-950 p-1">
                <div className="h-8 w-8 rounded-full bg-white" />
              </div>
              <dl className="ml-6 flex-auto">
                <dt className="font-display text-2xl font-medium text-neutral-950">
                  {item.value}
                </dt>
                <dd className="mt-1 text-base text-neutral-600">
                  {item.label}
                </dd>
              </dl>
            </div>
          ))}
        </div>
      </FadeInStagger>
    </Container>
  );
};

export default Stats; 