# E-commerce (removed) — how it worked

This document describes the checkout/cart system that was removed from the codebase so it can be reimplemented later. **Nothing in this file is active code** — it is reference only.

Archived: 2026-06-04

---

## Summary

The site used a **hybrid catalog**:

- **Prices & product data for checkout:** hardcoded in `src/lib/products-db.ts` (keys were Stripe-style product IDs like `prod_Sl6YwTtMW5oaq7`).
- **Marketing display:** Prismic slices (`Product`, `HeroImage`, `Accessories`) could override copy/images; cart always preferred `products-db.ts` when adding items.

**Payments:** Stripe (two flows — see below).  
**Shipping:** Sendcloud API (UPS methods + fallback rates).  
**Cart state:** Zustand + `localStorage` key `cart-storage`.

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `STRIPE_SECRET_KEY` | Yes (server) | Stripe API — Payment Intents & Checkout Sessions |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes (client) | Stripe.js / Elements on checkout page |
| `SENDCLOUD_PUBLIC_KEY` | Yes (shipping) | Sendcloud API basic auth |
| `SENDCLOUD_SECRET_KEY` | Yes (shipping) | Sendcloud API basic auth |

`src/lib/stripe.ts` threw at startup if `STRIPE_SECRET_KEY` was missing.

Sendcloud client logged a warning if keys were missing and could fall back to hardcoded UPS rate estimates.

---

## Product catalog (`products-db.ts`)

Single source of truth in repo (not Prismic):

| Key (lookup ID) | Name | Price | Notes |
|-----------------|------|-------|--------|
| `prod_Sl6YwTtMW5oaq7` | Brass Core | €799 | `category: main` |
| `prod_So9YfS17gPgSnJ` | Trumpet Clamp | €165 | accessory, `compatibleWith` main |
| `prod_So9ZHhsXjwemQQ` | Trombone Clamp | €185 | accessory |

Prismic `product_id` / `accessory_id` fields had to match these keys.

---

## Cart

- **Store:** `src/lib/cart-store.ts` (Zustand + persist).
- **UI:** `CartIcon` + `CartSidePanel` in header; full page `/[lang]/cart`.
- **Line item fields:** id, name, price, currency, image, quantity, weight (kg).

---

## Checkout flows (two paths)

### A — Custom checkout (primary for header cart)

1. User opens side panel → **Checkout** → `/[lang]/webshop/checkout`.
2. `CheckoutClient` called `POST /api/create-payment-intent` with cart items + optional shipping cost.
3. `CheckoutForm` (Stripe Elements), 3 steps:
   - Shipping address (`AddressElement`, EU + US + CA).
   - Shipping method (`POST /api/get-shipping-rates` → Sendcloud).
   - Payment (`PaymentElement`, `stripe.confirmPayment`).
4. Success → `/[lang]/webshop/success` (`SuccessClient`).

Optional Prismic page UID `checkout` for titles/copy.

**Known issues at removal time:**

- Payment Intent was created **before** shipping was selected → amount often excluded shipping.
- `return_url` in `confirmPayment` was `/webshop/success` without `/{lang}/`.

### B — Stripe Hosted Checkout (cart page only)

1. `/[lang]/cart` → **Proceed to Checkout**.
2. `POST /api/create-checkout-session` → redirect to Stripe-hosted page.
3. Success/cancel URLs passed with `/{lang}/` when called from `ShoppingCart`.

No Sendcloud on this path.

---

## API routes (removed)

| Route | Method | Role |
|-------|--------|------|
| `/api/create-payment-intent` | POST | Stripe PaymentIntent for Elements |
| `/api/create-checkout-session` | POST | Stripe Checkout Session (hosted) |
| `/api/get-shipping-rates` | POST | Sendcloud rates from address + weight |
| `/api/test-sendcloud` | GET/POST | Dev test for Sendcloud |

---

## Sendcloud

- Client: `src/lib/sendcloud-client.ts` → `https://panel.sendcloud.sc/api/v2`.
- Flow: list methods → filter UPS → price per method via shipping-price endpoint → fallback rates if none.
- **From address** in `get-shipping-rates/route.ts` was a placeholder (Amsterdam warehouse) — had to be replaced for production.

---

## Prismic integration

| Piece | Role |
|-------|------|
| `Product` slice | Product block + “Add to cart” |
| `HeroImage` slice | Optional price + “Buy” when `stripeid` + `product_id` + `product_price` set |
| `Accessories` slice | Grid; items or auto-detect via `main_product_id` + `products-db` |
| `Checkout` slice | **Placeholder only** — real UI was `CheckoutClient` |
| Custom type `checkout_page` | Unused alternative model |
| Page UID `checkout` | Loaded in `webshop/checkout/page.tsx` |

---

## NPM packages (removed)

- `stripe`
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`

---

## Files removed (reference)

**Lib:** `products-db.ts`, `product-utils.ts`, `cart-store.ts`, `stripe.ts`, `stripe-client.ts`, `sendcloud-client.ts`

**API:** `create-payment-intent`, `create-checkout-session`, `get-shipping-rates`, `test-sendcloud`

**Pages:** `[lang]/cart`, `[lang]/webshop/checkout`, `[lang]/webshop/success`

**Components:** `CartIcon`, `CartSidePanel`, `ShoppingCart`, `CheckoutClient`, `CheckoutForm`, `ShippingMethodSelector`, `SuccessClient`

**Slices:** `Checkout/` (entire folder)

**Docs:** `PRODUCT_SYSTEM_README.md`

**Custom types (repo):** `customtypes/checkout_page/`

---

## Reimplementation tips

1. Pick **one** checkout path (custom Elements vs hosted).
2. Create Payment Intent **after** shipping is chosen (or use Checkout Session with shipping options).
3. Decide catalog source: Prismic-only, Stripe Products, or a DB — avoid duplicating `products-db` + Prismic IDs.
4. Add Stripe **webhooks** for `payment_intent.succeeded` / order fulfillment.
5. Verify payments on success page server-side.
6. Set real Sendcloud ship-from address and `NEXT_PUBLIC_SITE_URL` for production.

---

## Slice fields after cleanup (Prismic-only display)

- **Product:** `product_name`, `product_description`, `product_price`, `product_image`, `currency` — no cart button.
- **HeroImage:** `product_price`, `currency` for display; CTAs via `primary_button_*` / `secondary_button_*` links. Removed: `stripeid`, `product_id`, `product_weight`.
- **Accessories:** repeater items with `custom_title`, `custom_price`, `custom_image`, `custom_description` — no `products-db` lookup.

Re-sync Slice Machine after model JSON changes, then regenerate `prismicio-types.d.ts` (Slice Machine → “Generate types” or your project’s codegen script).

**Do not commit real secrets.** Store keys only in `.env` (gitignored). If this file ever contained live keys, rotate them in Stripe/Sendcloud dashboards.
