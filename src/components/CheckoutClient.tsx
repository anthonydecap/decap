"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/lib/cart-store";
import { getCurrencySymbol } from "@/lib/stripe-client";
import { Container } from "@/components/Container";
import { FadeIn } from "@/components/FadeIn";
import { CheckoutForm } from "@/components/CheckoutForm";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CheckoutClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkoutContent: any;
  lang: string;
}

export function CheckoutClient({ checkoutContent, lang }: CheckoutClientProps) {
  const { items, getTotal, getTotalWithShipping, selectedShippingMethod, clearCart, addItem } = useCartStore();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if cart is empty

    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            currency: items[0]?.currency || "USD",
            shippingCost: selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0,
          }),
        });

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        alert("Failed to initialize checkout. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, router, lang, addItem, selectedShippingMethod]);

  if (items.length === 0) {
    return (
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Your Cart is Empty
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Add some products to your cart to continue with checkout.
            </p>
          </div>
        </FadeIn>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading checkout...</p>
          </div>
        </FadeIn>
      </Container>
    );
  }

  // If we have Prismic content, render it with dynamic cart integration
  if (checkoutContent) {
    return (
      <Container className="mt-24 sm:mt-32 lg:mt-40">
        <FadeIn>
          <div className="mx-auto max-w-4xl">
            {/* Render Prismic content for headers and text */}
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {checkoutContent.data.title?.[0]?.text || "Checkout"}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                {checkoutContent.data.slices?.[0]?.primary?.subtitle ||
                  "Complete your purchase securely"}
              </p>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
              {/* Checkout Form */}
              <div className="lg:col-span-1">
                {clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      onSuccess={() => {
                        clearCart();
                        router.push(`/${lang}/webshop/success`);
                      }}
                    />
                  </Elements>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1 mt-12 lg:mt-0">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    {checkoutContent.data.slices?.[0]?.primary?.summary_title ||
                      "Order Summary"}
                  </h2>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {getCurrencySymbol(item.currency)}
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Subtotal</dt>
                      <dd className="text-sm text-gray-900">
                        {getCurrencySymbol(items[0]?.currency || "USD")}
                        {getTotal().toFixed(2)}
                      </dd>
                    </div>
                    
                    {selectedShippingMethod && (
                      <div className="flex items-center justify-between">
                        <dt className="text-sm text-gray-600">Shipping ({selectedShippingMethod.name})</dt>
                        <dd className="text-sm text-gray-900">
                          €{selectedShippingMethod.price}
                        </dd>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <dt className="text-base font-medium text-gray-900">
                        {checkoutContent.data.slices?.[0]?.primary
                          ?.total_label || "Total"}
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {getCurrencySymbol(items[0]?.currency || "USD")}
                        {getTotalWithShipping().toFixed(2)}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    );
  }

  // Default checkout UI if no Prismic content
  return (
    <Container className="mt-24 sm:mt-32 lg:mt-40">
      <FadeIn>
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Checkout
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Complete your purchase securely
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            {/* Checkout Form */}
            <div className="lg:col-span-1">
              {clientSecret && (
                                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      onSuccess={() => {
                        clearCart();
                        router.push(`/${lang}/webshop/success`);
                      }}
                    />
                  </Elements>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 mt-12 lg:mt-0">
              <div className="rounded-lg bg-gray-50 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {getCurrencySymbol(item.currency)}
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-gray-600">Subtotal</dt>
                    <dd className="text-sm text-gray-900">
                      {getCurrencySymbol(items[0]?.currency || "USD")}
                      {getTotal().toFixed(2)}
                    </dd>
                  </div>
                  
                  {selectedShippingMethod && (
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600">Shipping ({selectedShippingMethod.name})</dt>
                      <dd className="text-sm text-gray-900">
                        €{selectedShippingMethod.price}
                      </dd>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">
                      Total
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {getCurrencySymbol(items[0]?.currency || "USD")}
                      {getTotalWithShipping().toFixed(2)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}
