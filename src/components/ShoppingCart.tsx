'use client';

import { useState } from 'react';
import { useCartStore, type CartItem } from '@/lib/cart-store';
import { getCurrencySymbol } from '@/lib/stripe-client';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';

export function ShoppingCart() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Your Cart is Empty
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Add some products to your cart to get started.
            </p>
          </div>
        </FadeIn>
      </Container>
    );
  }

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn>
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shopping Cart ({getItemCount()} items)
          </h1>

          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <div className="lg:col-span-7">
              <ul className="divide-y divide-gray-200 border-b border-t border-gray-200">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </ul>
            </div>

            <div className="mt-16 lg:col-span-5 lg:mt-0">
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {getCurrencySymbol(items[0]?.currency || 'USD')}{getTotal().toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">Total</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {getCurrencySymbol(items[0]?.currency || 'USD')}{getTotal().toFixed(2)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 space-y-4">
                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                  <Button
                    onClick={clearCart}
                    className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300"
                  >
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}

function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}) {
  const currencySymbol = getCurrencySymbol(item.currency);

  return (
    <li className="flex py-6 sm:py-10">
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div>
            <div className="flex justify-between">
              <h3 className="text-sm">
                <a href="#" className="font-medium text-gray-700 hover:text-gray-800">
                  {item.name}
                </a>
              </h3>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {currencySymbol}{item.price}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 sm:pr-9">
            <label htmlFor={`quantity-${item.id}`} className="sr-only">
              Quantity, {item.name}
            </label>
            <select
              id={`quantity-${item.id}`}
              name={`quantity-${item.id}`}
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
              className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            <div className="absolute right-0 top-0">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Remove</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 flex space-x-2 text-sm text-gray-700">
          <span>Total: {currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
        </p>
      </div>
    </li>
  );
} 