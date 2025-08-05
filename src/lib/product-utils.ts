// Product utility functions for cart and slice integration
import { getProduct, Product } from './products-db';
import { CartItem } from './cart-store';

/**
 * Creates a CartItem from a product ID using the single source of truth
 */
export function createCartItemFromProductId(productId: string): CartItem | null {
  const product = getProduct(productId);
  
  if (!product) {
    console.warn(`Product with ID "${productId}" not found in products database`);
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    image: product.image,
    weight: product.weight,
    quantity: 1 // Will be set by cart store
  };
}

/**
 * Gets product data for display in slices
 */
export function getProductForSlice(productId: string): Product | null {
  const product = getProduct(productId);
  
  if (!product) {
    console.warn(`Product with ID "${productId}" not found in products database`);
    return null;
  }

  return product;
}

/**
 * Validates if a product ID exists in the database
 */
export function isValidProductId(productId: string): boolean {
  return getProduct(productId) !== undefined;
}

/**
 * Gets product display price with currency symbol
 */
export function getProductDisplayPrice(productId: string): string {
  const product = getProduct(productId);
  
  if (!product) {
    return 'Price not available';
  }

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
  };
  
  const symbol = symbols[product.currency] || '$';
  return `${symbol}${product.price.toFixed(2)}`;
}

/**
 * Gets formatted weight display
 */
export function getProductWeightDisplay(productId: string): string {
  const product = getProduct(productId);
  
  if (!product) {
    return '';
  }
  
  return `${product.weight}kg`;
}