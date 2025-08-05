'use client';

import { useEffect } from 'react';
import { Container } from '@/components/Container';
import { FadeIn } from '@/components/FadeIn';
import { Button } from '@/components/Button';

interface SuccessClientProps {
  lang: string;
  paymentIntent?: string;
  sessionId?: string;
}

export function SuccessClient({ lang, paymentIntent, sessionId }: SuccessClientProps) {
  useEffect(() => {
    // You can verify the payment here if needed
    if (paymentIntent) {
      console.log('Payment successful (Elements):', paymentIntent);
    }
    if (sessionId) {
      console.log('Payment successful (Checkout Session):', sessionId);
    }
  }, [paymentIntent, sessionId]);

  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
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
            Payment Successful!
          </h1>
          
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Thank you for your purchase. You will receive a confirmation email shortly.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <Button href={`/${lang}`} className="bg-blue-600 hover:bg-blue-700">
              Continue Shopping
            </Button>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
} 