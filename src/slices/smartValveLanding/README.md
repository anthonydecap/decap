# ValveHero Slice

A simple, center-aligned hero section with title, subtitle, and buy button functionality.

## Features

- **Center-aligned layout**: All content is centered for a clean, focused design
- **Title and subtitle**: Clear hierarchy with customizable text
- **Buy button**: Integrated with cart functionality and Stripe
- **Product integration**: Supports product data from database or Prismic
- **Responsive design**: Works on all screen sizes
- **Smooth animations**: Fade-in effects for better UX

## Fields

### Primary Fields

- **title** (Text): Main hero title
- **subtitle** (Text): Subtitle text displayed above the title
- **buy_button_text** (Text): Custom text for the buy button
- **stripeid** (Text): Stripe product ID for purchase functionality
- **product_price** (Number): Product price
- **currency** (Select): Currency (USD, EUR, GBP)
- **product_id** (Text): Unique product identifier
- **product_weight** (Number): Product weight in kilograms

## Usage

This slice is perfect for:
- Product landing pages
- Simple hero sections
- Call-to-action focused content
- Valve or technical product showcases

## Styling

The slice uses:
- Neutral color scheme
- Modern typography with font-display
- Hover effects on the buy button
- Responsive text sizing
- Clean spacing and layout

## Dependencies

- Requires cart store functionality
- Integrates with Stripe for payments
- Uses product utilities for data management



