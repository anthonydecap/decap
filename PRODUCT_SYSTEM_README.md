# Product System - Single Source of Truth

This document explains the new product system that ensures consistent product data across all slices.

## Overview

Previously, product data (price, image, weight, name) was entered manually in each Prismic slice, leading to potential inconsistencies. Now, all product data is centralized in a single file that serves as the source of truth.

## Files Structure

```
src/lib/
├── products-db.ts      # Single source of truth for all products
├── product-utils.ts    # Utility functions for product operations
├── cart-store.ts       # Cart management (unchanged)
└── stripe-client.ts    # Stripe utilities (unchanged)
```

## How It Works

### 1. Products Database (`products-db.ts`)
- Contains all product information: ID, name, price, currency, weight, image, description
- Categorizes products as 'main' or 'accessory'  
- Defines compatibility between products and accessories
- Provides utility functions to query products

### 2. Product Utilities (`product-utils.ts`)
- Functions to create cart items from product IDs
- Validation and formatting utilities
- Bridge between products database and UI components

### 3. Updated Slices
Both `Product` and `HeroImage` slices now:
- First try to get data from the products database using the `product_id`
- Fall back to slice data for backward compatibility
- Display consistent information regardless of slice settings

## Using the System

### In Prismic Slices
You only need to set the `product_id` field. All other data (price, image, weight) will be automatically pulled from the database:

```typescript
// In your slice, just set:
product_id: "trumpet-ox-sa001"

// The system automatically gets:
// - name: "OX-SA001 Professional Trumpet"
// - price: 2499.00
// - currency: "EUR" 
// - weight: 1.2
// - image: "/images/products/trumpet-ox-sa001.jpg"
```

### Adding New Products

1. **Add to products database:**
```typescript
// src/lib/products-db.ts
export const PRODUCTS_DB: Record<string, Product> = {
  'your-new-product': {
    id: 'your-new-product',
    name: 'Your New Product',
    price: 199.00,
    currency: 'EUR',
    weight: 0.5,
    image: '/images/products/your-new-product.jpg',
    description: 'Product description',
    category: 'main' // or 'accessory'
  }
}
```

2. **Use in slices:**
Simply reference the product ID in any Product, HeroImage, or Accessories slice.

### Accessories System

The new `Accessories` slice can:
- **Auto-detect accessories** for a main product
- **Manual selection** of specific accessories  
- **Apple-style design** with responsive grid

## Benefits

1. **Consistency**: Same product data everywhere
2. **Single Source**: Update price/image in one place
3. **Type Safety**: TypeScript ensures data integrity
4. **Backward Compatibility**: Existing slices still work
5. **Easy Maintenance**: No more hunting for price mismatches

## Migration Guide

### Existing Slices
No immediate action needed - slices will automatically use the database when `product_id` matches an entry, otherwise fall back to slice data.

### Recommended Migration
1. Add your products to `products-db.ts`
2. Test that slices display correctly
3. Remove redundant data from Prismic slice fields (optional)

## File Locations

- **Products Database**: `src/lib/products-db.ts`
- **Utilities**: `src/lib/product-utils.ts` 
- **Updated Product Slice**: `src/slices/Product/index.tsx`
- **Updated HeroImage Slice**: `src/slices/HeroImage/index.tsx`
- **New Accessories Slice**: `src/slices/Accessories/index.tsx`