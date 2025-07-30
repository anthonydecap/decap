'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/Button';
import { ShippingMethodSelector } from '@/components/ShippingMethodSelector';
import { useCartStore, ShippingMethod } from '@/lib/cart-store';

interface CheckoutFormProps {
  onSuccess: () => void;
}

interface ShippingAddress {
  name: string;
  address: {
    country: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
  };
  phone?: string;
}

// List of allowed countries: European countries + US + Canada
const ALLOWED_COUNTRIES = [
  // European countries
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // US and Canada
  'US', 'CA'
];

type CheckoutStep = 'shipping' | 'shipping-method' | 'payment';

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { 
    items, 
    selectedShippingMethod, 
    setShippingMethod, 
    getTotalWithShipping 
  } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total weight for shipping based on actual product weights
  const totalWeight = items.reduce((weight, item) => weight + (item.weight * item.quantity), 0);

  const fetchShippingRates = async (address: ShippingAddress) => {
    setIsLoadingShipping(true);
    setError(null);
    
    try {
      const response = await fetch('/api/get-shipping-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: address,
          weight: totalWeight,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipping rates');
      }

      const { shippingRates } = await response.json();
      setShippingMethods(shippingRates);
      
      // Auto-select the first shipping method
      if (shippingRates.length > 0) {
        setShippingMethod(shippingRates[0]);
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      setError('Failed to load shipping options. Please try again.');
    } finally {
      setIsLoadingShipping(false);
    }
  };

  const handleShippingAddressChange = async () => {
    const addressElement = elements?.getElement(AddressElement);
    if (addressElement) {
      const { complete, value } = await addressElement.getValue();
      if (complete && value) {
        setShippingAddress(value);
        // Fetch shipping rates when address is complete
        await fetchShippingRates(value);
      }
    }
  };

  const handleShippingAddressComplete = async () => {
    const addressElement = elements?.getElement(AddressElement);
    if (addressElement) {
      const { complete, value } = await addressElement.getValue();
      if (complete && value) {
        setShippingAddress(value);
        await fetchShippingRates(value);
        setCurrentStep('shipping-method');
      } else {
        setError('Please complete your shipping address');
      }
    }
  };

  const handleShippingMethodSelect = (method: ShippingMethod) => {
    setShippingMethod(method);
    setCurrentStep('payment');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!selectedShippingMethod) {
      setError('Please select a shipping method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/webshop/success`,
        ...(shippingAddress && {
          payment_method_data: {
            billing_details: {
              address: {
                ...shippingAddress.address,
                line2: shippingAddress.address.line2 || undefined,
              },
            },
          },
          shipping: {
            address: {
              ...shippingAddress.address,
              line2: shippingAddress.address.line2 || undefined,
            },
            name: shippingAddress.name,
          },
        }),
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      // Payment succeeded
      onSuccess();
    }
  };

  const goBackToShipping = () => {
    setCurrentStep('shipping');
  };

  const goBackToShippingMethod = () => {
    setCurrentStep('shipping-method');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-8">
          <div className={`flex items-center space-x-3 ${currentStep === 'shipping' ? 'text-neutral-950' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === 'shipping' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              1
            </div>
            <span className="text-sm font-medium">Shipping</span>
          </div>
          <div className={`flex items-center space-x-3 ${currentStep === 'shipping-method' ? 'text-neutral-950' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === 'shipping-method' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Shipping Method</span>
          </div>
          <div className={`flex items-center space-x-3 ${currentStep === 'payment' ? 'text-neutral-950' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep === 'payment' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-400'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Shipping Address */}
      {currentStep === 'shipping' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Shipping Address</h2>
            <p className="text-neutral-600">Enter your shipping address to calculate shipping costs.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <AddressElement
              options={{
                mode: 'shipping',
                allowedCountries: ALLOWED_COUNTRIES,
                defaultValues: {
                  name: '',
                  address: {
                    country: 'US',
                  },
                },
                fields: {
                  phone: 'always',
                },
                validation: {
                  phone: {
                    required: 'always',
                  },
                },
              }}
              onChange={handleShippingAddressChange}
            />
          </div>
          
          <Button
            type="button"
            onClick={handleShippingAddressComplete}
            className="w-full bg-neutral-950 text-white hover:bg-neutral-800 transition-colors"
          >
            Continue to Shipping Method
          </Button>
        </div>
      )}

      {/* Step 2: Shipping Method */}
      {currentStep === 'shipping-method' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Shipping Method</h2>
            <p className="text-neutral-600">Choose your preferred shipping option.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <ShippingMethodSelector
              shippingMethods={shippingMethods}
              selectedMethod={selectedShippingMethod}
              onSelectMethod={handleShippingMethodSelect}
              isLoading={isLoadingShipping}
            />
          </div>
          
          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={goBackToShipping}
              className="flex-1 bg-neutral-100 text-neutral-950 hover:bg-neutral-200 transition-colors"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep('payment')}
              disabled={!selectedShippingMethod}
              className="flex-1 bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 'payment' && (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 mb-2">Payment Information</h2>
            <p className="text-neutral-600">Complete your purchase securely.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <PaymentElement 
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    name: 'auto',
                    email: 'auto',
                    phone: 'auto',
                    address: {
                      country: 'auto',
                      line1: 'auto',
                      line2: 'auto',
                      city: 'auto',
                      state: 'auto',
                      postalCode: 'auto',
                    },
                  },
                },
              }}
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={goBackToShippingMethod}
              className="flex-1 bg-neutral-100 text-neutral-950 hover:bg-neutral-200 transition-colors"
            >
              Back
            </Button>
            
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : `Pay €${getTotalWithShipping().toFixed(2)}`}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-12 text-center text-sm text-neutral-500">
        <p>Your payment is secured by Stripe. We never store your payment information.</p>
        <p className="mt-1">We currently ship to European countries, United States, and Canada only.</p>
      </div>
    </div>
  );
} 