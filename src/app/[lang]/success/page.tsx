'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { Button } from '@/components/Button';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn>
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Thank you for your order!
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Your order has been successfully placed. You will receive a confirmation email shortly.
          </p>
          {sessionId && (
            <p className="mt-2 text-sm text-gray-500">
              Order ID: {sessionId}
            </p>
          )}
          <div className="mt-8">
            <Button href="/" className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
} 