'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type SliceComponentProps } from '@prismicio/react';
import { Container } from '@/components/Container';
import { FadeIn, FadeInStagger } from '@/components/FadeIn';
import { Button } from '@/components/Button';
import { useCartStore } from '@/lib/cart-store';
import { getProduct, getAccessoriesForProduct } from '@/lib/products-db';
import { createCartItemFromProductId } from '@/lib/product-utils';
import { getCurrencySymbol } from '@/lib/stripe-client';
import clsx from 'clsx';

/**
 * Props for `Accessories`.
 */
type AccessoriesProps = SliceComponentProps<{
  id: string;
  slice_type: "accessories";
  slice_label: null;
  primary: {
    section_title: string;
    section_subtitle: string;
    main_product_id: string;
  };
  items: Array<{
    accessory_id: string;
    custom_title?: string;
    custom_price?: number;
    custom_image?: any;
    custom_description?: string;
  }>;
}>;

/**
 * Individual accessory card component with Apple-style design
 */
const AccessoryCard = ({ 
  productId, 
  customData,
  onAddToCart 
}: { 
  productId: string;
  customData?: {
    custom_title?: string;
    custom_price?: number;
    custom_image?: any;
    custom_description?: string;
  };
  onAddToCart: (id: string) => void;
}) => {
  const product = getProduct(productId);
  
  if (!product) {
    return null;
  }

  // For DISPLAY: Use Prismic custom data first, fall back to database
  const displayName = customData?.custom_title || product.name;
  const displayPrice = customData?.custom_price || product.price;
  const displayImage = customData?.custom_image?.url || product.image;
  const displayDescription = customData?.custom_description || product.description;
  const displayCurrency = product.currency; // Always use database currency

  const currencySymbol = getCurrencySymbol(displayCurrency);

  return (
    <FadeIn>
      <div className="group relative bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
        {/* Product Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
          <div className="w-full h-full relative">
            {customData?.custom_image ? (
              <img
                src={customData.custom_image.url}
                alt={displayName}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <img
                src={displayImage}
                alt={displayName}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {displayName}
          </h3>
          
          {displayDescription && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {displayDescription}
            </p>
          )}
          
          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900">
              {currencySymbol}{displayPrice.toFixed(2)}
            </div>
            
            <Button
              onClick={() => onAddToCart(productId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Add
            </Button>
          </div>
        </div>
        
        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </FadeIn>
  );
};

/**
 * Component for "Accessories" Slices.
 */
export default function Accessories({ slice }: AccessoriesProps) {
  const { addItem } = useCartStore();
  const { section_title, section_subtitle, main_product_id } = slice.primary;

  // Get accessories either from the items list or auto-detect from main product
  let accessoriesData: Array<{id: string, customData?: any}> = [];
  
  if (slice.items && slice.items.length > 0) {
    // Use manually specified accessories from slice items with custom data
    accessoriesData = slice.items
      .filter((item: any) => item.accessory_id)
      .map((item: any) => ({
        id: item.accessory_id,
        customData: {
          custom_title: item.custom_title,
          custom_price: item.custom_price,
          custom_image: item.custom_image,
          custom_description: item.custom_description,
        }
      }));
  } else if (main_product_id) {
    // Auto-detect compatible accessories for the main product
    const compatibleAccessories = getAccessoriesForProduct(main_product_id);
    accessoriesData = compatibleAccessories.map(acc => ({
      id: acc.id,
      customData: undefined
    }));
  }

  // Filter out invalid product IDs
  const validAccessories = accessoriesData
    .filter(item => getProduct(item.id) !== undefined);

  const handleAddToCart = (productId: string) => {
    // For CART: Always use database data for consistency
    const cartItem = createCartItemFromProductId(productId);
    if (cartItem) {
      addItem(cartItem);
    } else {
      console.warn(`Product ${productId} not found in database for cart`);
    }
  };

  if (validAccessories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50">
      <Container>
        <FadeInStagger>
          {/* Section Header */}
          <FadeIn>
            <div className="text-center mb-16">
              {section_title && (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                  {section_title}
                </h2>
              )}
              
              {section_subtitle && (
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                  {section_subtitle}
                </p>
              )}
            </div>
          </FadeIn>

          {/* Accessories Grid - Full Width Layout */}
          <div className={clsx(
            "grid gap-8 w-full",
            validAccessories.length === 1 && "grid-cols-1",
            validAccessories.length === 2 && "grid-cols-1 md:grid-cols-2",
            validAccessories.length === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            validAccessories.length === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
            validAccessories.length === 5 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
            validAccessories.length >= 6 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          )}>
            {validAccessories.map((accessory) => (
              <AccessoryCard
                key={accessory.id}
                productId={accessory.id}
                customData={accessory.customData}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Optional CTA Section */}
          {validAccessories.length >= 4 && (
            <FadeIn className="mt-16 text-center">
              <div className="bg-gray-900 rounded-3xl p-8 sm:p-12">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Complete Your Setup
                </h3>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                  Get everything you need for the perfect musical experience. 
                  All accessories are carefully selected to complement your instrument.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold">
                    View All Accessories
                  </Button>
                  <Button className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-full font-semibold transition-all duration-300">
                    Need Help Choosing?
                  </Button>
                </div>
              </div>
            </FadeIn>
          )}
        </FadeInStagger>
      </Container>
    </section>
  );
}