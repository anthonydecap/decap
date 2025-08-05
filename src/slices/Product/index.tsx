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
import { createCartItemFromProductId, getProductForSlice } from "@/lib/product-utils";
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
  
  // For DISPLAY: Use Prismic data first, fall back to database
  const productData = getProductForSlice(slice.primary.product_id);
  const displayName = slice.primary.product_name || productData?.name || 'Product';
  const displayPrice = slice.primary.product_price || productData?.price || 0;
  const displayCurrency = slice.primary.currency || productData?.currency || 'EUR';
  const displayImage = slice.primary.product_image?.url || productData?.image;
  
  const currencySymbol = getCurrencySymbol(displayCurrency);

  const handleAddToCart = () => {
    // For CART: Always use database data for consistency
    const cartItem = createCartItemFromProductId(slice.primary.product_id);
    
    if (cartItem) {
      addItem(cartItem);
    } else {
      // Only as last resort if product not in database
      console.warn(`Product ${slice.primary.product_id} not found in database, using slice data for cart`);
      addItem({
        id: slice.primary.product_id,
        name: displayName,
        price: displayPrice,
        currency: displayCurrency,
        image: displayImage,
        weight: slice.primary.product_weight || 1,
      });
    }
  };

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <FadeIn>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {displayName}
              </h2>
              <div className="mt-6 text-lg leading-8 text-gray-600">
                <PrismicRichText field={slice.primary.product_description} components={components} />
              </div>
              <div className="mt-8 flex items-center gap-x-6">
                <div className="text-3xl font-bold text-gray-900">
                  {currencySymbol}{displayPrice?.toFixed(2)}
                </div>
                <Button onClick={handleAddToCart} className="bg-blue-600 hover:bg-blue-700">
                  Add to Cart
                </Button>
              </div>
            </div>
            <div className="mx-auto w-full max-w-2xl lg:mx-0">
              <div className="relative">
                {slice.primary.product_image ? (
                  <PrismicNextImage
                    field={slice.primary.product_image}
                    className="rounded-2xl bg-gray-50 object-cover"
                    priority
                    alt=""
                  />
                ) : displayImage ? (
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="rounded-2xl bg-gray-50 object-cover w-full h-auto"
                  />
                ) : (
                  <div className="rounded-2xl bg-gray-200 aspect-square flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
} 