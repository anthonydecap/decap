// Single source of truth for all products
// This file maintains consistent product data across all slices

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  weight: number; // in kg
  image: string;
  description?: string;
  category?: 'main' | 'accessory';
  compatibleWith?: string[]; // IDs of products this accessory is compatible with
}

// Main products database
export const PRODUCTS_DB: Record<string, Product> = {
  // Main Products - Using Real Stripe Product IDs
  'prod_Sl6YwTtMW5oaq7': {
    id: 'prod_Sl6YwTtMW5oaq7',
    name: 'Brass Core',
    price: 799.00,
    currency: 'EUR',
    weight: 1.2,
    image: 'https://images.prismic.io/decap/aIZQJVGsbswqTUfv_Trumpet_Assembly_03_2023-Jul-26_11-15-22PM-000_CustomizedView7737460106.png?auto=format,compress',
    description: 'Professional brass core trumpet with exceptional sound quality',
    category: 'main'
  },
  
  // Accessories
  'prod_So9YfS17gPgSnJ': {
    id: 'trumpet-clamp',
    name: 'Trumpet Clamp',
    price: 165.00,
    currency: 'EUR',
    weight: 0.8,
    image: 'https://images.prismic.io/decap/aJE6yqTt2nPbZ1VC_OX-SA002-XX_-Trumpet_Clamp-_2025-Aug-02_10-48-31AM-000_CustomizedView23254879266p.png?auto=format,compress',
    description: '',
    category: 'accessory',
    compatibleWith: ['prod_Sl6YwTtMW5oaq7']
  },

  'prod_So9ZHhsXjwemQQ': {
    id: 'trombone-clamp',
    name: 'Trombone Clamp',
    price: 185.00,
    currency: 'EUR', 
    weight: 0.9,
    image: 'https://images.prismic.io/decap/aJE6yqTt2nPbZ1VC_OX-SA002-XX_-Trumpet_Clamp-_2025-Aug-02_10-48-31AM-000_CustomizedView23254879266p.png?auto=format,compress',
    description: '',
    category: 'accessory',
    compatibleWith: ['prod_Sl6YwTtMW5oaq7']
  }
};

// Utility functions
export function getProduct(id: string): Product | undefined {
  return PRODUCTS_DB[id];
}

export function getProductsByCategory(category: 'main' | 'accessory'): Product[] {
  return Object.values(PRODUCTS_DB).filter(product => product.category === category);
}

export function getAccessoriesForProduct(productId: string): Product[] {
  return Object.values(PRODUCTS_DB).filter(
    product => product.category === 'accessory' && 
    product.compatibleWith?.includes(productId)
  );
}

export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS_DB);
}

export function validateProductId(id: string): boolean {
  return id in PRODUCTS_DB;
}