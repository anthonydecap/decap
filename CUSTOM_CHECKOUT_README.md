# Custom Checkout Implementation

This project now includes a custom checkout page that uses Stripe Elements instead of the default Stripe Checkout page. The custom checkout provides a better user experience that matches your website's design.

## Features

- **Custom Checkout Page**: Located at `/webshop/checkout`
- **Stripe Elements Integration**: Uses Stripe's PaymentElement for secure payment processing
- **Responsive Design**: Matches your website's styling and layout
- **Guest Checkout**: No account required for purchases
- **Order Summary**: Shows cart items and total during checkout
- **Success Page**: Custom success page at `/webshop/success`

## How It Works

### 1. Cart Side Panel
When users click "Proceed to Checkout" in the cart side panel, they are redirected to the custom checkout page instead of Stripe's hosted checkout.

### 2. Custom Checkout Page (`/webshop/checkout`)
- Creates a Stripe Payment Intent via the `/api/create-payment-intent` endpoint
- Displays a payment form using Stripe Elements
- Shows an order summary with cart items
- Handles payment processing and error states

### 3. Payment Processing
- Uses Stripe's PaymentElement for secure card processing
- Supports various payment methods (cards, digital wallets, etc.)
- Includes billing address collection
- Handles payment confirmation and error states

### 4. Success Page (`/webshop/success`)
- Displays a success message after successful payment
- Clears the cart automatically
- Provides a link to continue shopping

## API Endpoints

### `/api/create-payment-intent`
Creates a Stripe Payment Intent for the checkout process.

**Request Body:**
```json
{
  "items": [
    {
      "id": "product-1",
      "name": "Product Name",
      "price": 29.99,
      "quantity": 2,
      "currency": "USD",
      "image": "https://example.com/image.jpg"
    }
  ],
  "currency": "USD"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

## Environment Variables

Make sure you have the following environment variables set:

```env
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Components

### CheckoutForm (`src/components/CheckoutForm.tsx`)
- Handles payment form submission
- Integrates with Stripe Elements
- Manages loading and error states
- Provides a clean, branded payment interface

### CheckoutPage (`src/app/[lang]/webshop/checkout/page.tsx`)
- Main checkout page component
- Creates payment intent
- Displays order summary
- Handles cart validation

## Styling

The checkout page uses your existing design system:
- **Container**: Uses your `Container` component for consistent layout
- **Button**: Uses your `Button` component for consistent styling
- **FadeIn**: Uses your `FadeIn` component for animations
- **Typography**: Matches your website's font styles and spacing
- **Colors**: Uses your brand colors (blue-600, gray-900, etc.)

## Security

- All payment processing is handled securely by Stripe
- No sensitive payment data is stored on your server
- Payment intents are created server-side for security
- Client-side code only handles the UI and form submission

## Testing

To test the checkout:

1. Add items to your cart
2. Click "Proceed to Checkout" in the cart side panel
3. Fill out the payment form with test card details
4. Complete the payment to see the success page

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Future Enhancements

- Add order confirmation emails
- Implement inventory tracking
- Add shipping address collection
- Support for multiple currencies
- Add order history for users
- Implement webhook handling for payment status updates 