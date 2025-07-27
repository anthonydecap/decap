# Shopping Cart Implementation

This implementation adds a complete shopping cart system with Stripe checkout to your Prismic website.

## Features

- **Product Slice**: A new Prismic slice for displaying products with "Add to Cart" functionality
- **Shopping Cart**: Persistent cart state using Zustand
- **Cart Icon**: Header cart icon with item count
- **Checkout**: Stripe guest checkout integration
- **Success Page**: Order confirmation page

## Setup

### 1. Install Dependencies

The following packages have been installed:
- `stripe` - Stripe server-side SDK
- `@stripe/stripe-js` - Stripe client-side SDK
- `zustand` - State management for the cart

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 3. Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your environment variables

## Usage

### Adding Products

1. In Prismic, create a new Product slice
2. Fill in the product details:
   - Product Name
   - Product Description
   - Product Price
   - Product Image
   - Currency (USD, EUR, GBP)
   - Product ID (unique identifier)

### Cart Functionality

- **Add to Cart**: Click the "Add to Cart" button on any product
- **View Cart**: Click the cart icon in the header
- **Update Quantities**: Use the quantity dropdown in the cart
- **Remove Items**: Click the X button next to items
- **Checkout**: Click "Proceed to Checkout" to go to Stripe

### Pages

- `/cart` - Shopping cart page
- `/success` - Order confirmation page (after successful checkout)

## Components

### Product Slice (`src/slices/Product/`)
- Displays product information
- Includes "Add to Cart" button
- Supports multiple currencies

### Shopping Cart (`src/components/ShoppingCart.tsx`)
- Displays cart items
- Allows quantity updates
- Shows order summary
- Handles checkout process

### Cart Icon (`src/components/CartIcon.tsx`)
- Shows cart item count
- Links to cart page
- Updates automatically

## State Management

The cart state is managed using Zustand with persistence:

```typescript
const { items, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
```

## API Routes

### `/api/create-checkout-session`
- Creates Stripe checkout session
- Handles multiple currencies
- Supports guest checkout

## Internationalization

The implementation is compatible with your existing internationalization setup. The cart state persists across language changes.

## Styling

The components use Tailwind CSS and match your existing design system. The cart icon integrates seamlessly with your header.

## Testing

1. Add products to your cart
2. Navigate to the cart page
3. Test quantity updates and item removal
4. Test the checkout flow (use Stripe test cards)
5. Verify the success page appears after checkout

## Stripe Test Cards

For testing, use these Stripe test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Security

- Stripe handles all payment processing
- No sensitive payment data is stored locally
- Environment variables protect API keys
- HTTPS required for production

## Production Deployment

1. Update environment variables with production Stripe keys
2. Ensure HTTPS is enabled
3. Test the complete checkout flow
4. Monitor Stripe webhooks for order confirmations 