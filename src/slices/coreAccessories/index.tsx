'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type SliceComponentProps } from '@prismicio/react';
import { PrismicNextImage } from '@prismicio/next';
import { Container } from '@/components/Container';
import { FadeIn, FadeInStagger } from '@/components/FadeIn';
import { getCurrencySymbol } from '@/lib/format-currency';
import clsx from 'clsx';

type AccessoryItem = {
  custom_title?: string | null;
  custom_price?: number | null;
  custom_image?: any;
  custom_description?: string | null;
  currency?: string | null;
};

/**
 * Accessory tile — Smart Valve "immersive tile" language, standard (light)
 * theme, no gradient. Accessories are product shots, so each tile uses the
 * clean light-card (contain) branch from coreBento: image uncropped on a
 * neutral top area, bold font-display title, muted description, price below.
 */
function AccessoryCard({ item }: { item: AccessoryItem }) {
  const title = item.custom_title?.trim();
  const price = item.custom_price;
  const hasPrice = price != null && !Number.isNaN(price);
  const currency = item.currency || 'EUR';
  const currencySymbol = getCurrencySymbol(currency);

  if (!title && !item.custom_image) {
    return null;
  }

  return (
    <FadeIn className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-md lg:rounded-3xl">
      {item.custom_image ? (
        <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
          <PrismicNextImage
            field={item.custom_image}
            className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
            alt=""
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6 lg:p-8">
        {title ? (
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-2xl">
            {title}
          </h3>
        ) : null}
        {item.custom_description ? (
          <p className="mt-2 flex-grow text-sm leading-relaxed text-neutral-600">
            {item.custom_description}
          </p>
        ) : null}
        {hasPrice ? (
          <div className="mt-4 font-display text-lg font-semibold text-neutral-900">
            {currencySymbol}
            {price.toFixed(2)}
          </div>
        ) : null}
      </div>
    </FadeIn>
  );
}

export default function CoreAccessories({
  slice,
}: SliceComponentProps<any>) {
  const { section_title, section_subtitle, background_color } = slice.primary;
  const bgColor = background_color || '#ffffff';
  const items = ((slice.items ?? []) as AccessoryItem[]).filter(
    (item) => item.custom_title || item.custom_image,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 lg:py-32" style={{ backgroundColor: bgColor }}>
      <Container>
        <FadeInStagger>
          <FadeIn>
            <div className="mb-12 text-center lg:mb-16">
              {section_title ? (
                <h2 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-neutral-950 sm:text-4xl lg:text-5xl">
                  {section_title}
                </h2>
              ) : null}
              {section_subtitle ? (
                <p className="mx-auto max-w-2xl text-lg text-neutral-600 sm:text-xl">
                  {section_subtitle}
                </p>
              ) : null}
            </div>
          </FadeIn>

          <div
            className={clsx(
              'grid w-full gap-4 lg:gap-5',
              items.length === 1 && 'grid-cols-1',
              items.length === 2 && 'grid-cols-1 md:grid-cols-2',
              items.length === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
              items.length >= 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            )}
          >
            {items.map((item, index) => (
              <AccessoryCard key={index} item={item} />
            ))}
          </div>
        </FadeInStagger>
      </Container>
    </section>
  );
}
