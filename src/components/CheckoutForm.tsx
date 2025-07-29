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
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${currentStep === 'shipping' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'shipping' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Shipping Address</span>
          </div>
          <div className={`flex items-center ${currentStep === 'shipping-method' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'shipping-method' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Shipping Method</span>
          </div>
          <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              currentStep === 'payment' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Shipping Address */}
      {currentStep === 'shipping' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <div className="border border-gray-200 rounded-md p-4">
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
          </div>
          
          <Button
            type="button"
            onClick={handleShippingAddressComplete}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue to Shipping Method
          </Button>
        </div>
      )}

      {/* Step 2: Shipping Method */}
      {currentStep === 'shipping-method' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h2>
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
              className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep('payment')}
              disabled={!selectedShippingMethod}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {currentStep === 'payment' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
            <div className="border border-gray-200 rounded-md p-4">
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
          </div>

                     <div className="flex space-x-4">
             <Button
               type="button"
               onClick={goBackToShippingMethod}
               className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
             >
               Back
             </Button>
            
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Pay €${getTotalWithShipping().toFixed(2)}`}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p>Your payment is secured by Stripe. We never store your payment information.</p>
        <p className="mt-1">We currently ship to European countries, United States, and Canada only.</p>
      </div>
    </div>
  );
} 