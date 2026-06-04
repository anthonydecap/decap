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
    <FadeIn>
      <article className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          {item.custom_image ? (
            <PrismicNextImage
              field={item.custom_image}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
              alt=""
            />
          ) : null}
        </div>
        <div className="p-6">
          {title ? (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          ) : null}
          {item.custom_description ? (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {item.custom_description}
            </p>
          ) : null}
          {hasPrice ? (
            <p className="mt-4 text-xl font-bold text-gray-900">
              {currencySymbol}
              {price.toFixed(2)}
            </p>
          ) : null}
        </div>
      </article>
    </FadeIn>
  );
}

export default function Accessories({
  slice,
}: SliceComponentProps<any>) {
  const { section_title, section_subtitle } = slice.primary;
  const items = ((slice.items ?? []) as AccessoryItem[]).filter(
    (item) => item.custom_title || item.custom_image,
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24 sm:py-32">
      <Container>
        <FadeInStagger>
          <FadeIn>
            <div className="mb-16 text-center">
              {section_title ? (
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  {section_title}
                </h2>
              ) : null}
              {section_subtitle ? (
                <p className="mx-auto max-w-2xl text-lg text-gray-600 sm:text-xl">
                  {section_subtitle}
                </p>
              ) : null}
            </div>
          </FadeIn>

          <div
            className={clsx(
              'grid w-full gap-8',
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
