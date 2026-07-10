/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { getCurrencySymbol } from "@/lib/format-currency";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ children }) => (
    <span className="text-blue-500 underline">{children}</span>
  ),
};

export default function Product({ slice }: SliceComponentProps<any>) {
  const { product_name, product_description, product_price, product_image, currency } =
    slice.primary;
  const displayCurrency = currency || "EUR";
  const currencySymbol = getCurrencySymbol(displayCurrency);
  const hasPrice = product_price != null && !Number.isNaN(product_price);

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product_name}
              </h2>
              <div className="mt-6 text-lg leading-8 text-gray-600">
                <PrismicRichText field={product_description} components={components} />
              </div>
              {hasPrice ? (
                <p className="mt-8 text-3xl font-bold text-gray-900">
                  {currencySymbol}
                  {product_price.toFixed(2)}
                  <span className="ml-2 text-sm font-normal uppercase tracking-wide text-gray-500">
                    {displayCurrency}
                  </span>
                </p>
              ) : null}
            </div>
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              {product_image ? (
                <PrismicNextImage
                  field={product_image}
                  className="rounded-2xl bg-gray-50 object-cover"
                  priority
                  alt=""
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-gray-200">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
