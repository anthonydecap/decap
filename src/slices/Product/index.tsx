'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  type SliceComponentProps,
  type JSXMapSerializer,
} from "@prismicio/react";
import { useCartStore } from "@/lib/cart-store";
import { getCurrencySymbol } from "@/lib/stripe-client";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";

const components: JSXMapSerializer = {
  hyperlink: ({ node, children }) => {
    return <a href={node.data.url} target="_blank" rel="noopener noreferrer">{children}</a>;
  },
};

/**
 * Props for `Product`.
 */
type ProductProps = SliceComponentProps<{
  id: string;
  slice_type: "product";
  slice_label: null;
  primary: {
    product_name: string;
    product_description: any;
    product_price: number;
    product_image: any;
    currency: string;
    product_id: string;
    product_weight: number;
  };
  items: any[];
}>;

export default function Product({ slice }: ProductProps) {
  const { addItem } = useCartStore();
  const currencySymbol = getCurrencySymbol(slice.primary.currency);

  const handleAddToCart = () => {
    addItem({
      id: slice.primary.product_id,
      name: slice.primary.product_name,
      price: slice.primary.product_price,
      currency: slice.primary.currency,
      image: slice.primary.product_image.url,
      weight: slice.primary.product_weight || 1, // Default to 1kg if not set
    });
  };

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {slice.primary.product_name}
              </h2>
              <div className="mt-6 text-lg leading-8 text-gray-600">
                <PrismicRichText field={slice.primary.product_description} components={components} />
              </div>
              <div className="mt-8 flex items-center gap-x-6">
                <div className="text-3xl font-bold text-gray-900">
                  {currencySymbol}{slice.primary.product_price}
                </div>
                <Button onClick={handleAddToCart} className="bg-blue-600 hover:bg-blue-700">
                  Add to Cart
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              <div className="relative">
                <PrismicNextImage
                  field={slice.primary.product_image}
                  className="rounded-2xl bg-gray-50 object-cover"
                  priority
                  alt=""
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
} 