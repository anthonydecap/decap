'use client';

import { useState, useEffect } from 'react';
import { useCartStore, type CartItem } from '@/lib/cart-store';
import { getCurrencySymbol } from '@/lib/stripe-client';
import { Button } from '@/components/Button';

interface CartSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidePanel({ isOpen, onClose }: CartSidePanelProps) {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
          cancelUrl: `${window.location.origin}`,
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

  // Don't prevent body scroll - keep page visible
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = 'unset';
  //   }

  //   return () => {
  //     document.body.style.overflow = 'unset';
  //   };
  // }, [isOpen]);

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({getItemCount()} items)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">Add some products to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>{getCurrencySymbol(items[0]?.currency || 'USD')}{getTotal().toFixed(2)}</p>
              </div>
              <div className="space-y-3">
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
          )}
        </div>
      </div>
    </>
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
    <div className="flex py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-16 w-16 rounded-md object-cover"
        />
      </div>

      <div className="ml-4 flex-1">
        <div className="flex justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {currencySymbol}{item.price}
            </p>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <select
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <p className="text-sm font-medium text-gray-900">
            {currencySymbol}{(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
} 