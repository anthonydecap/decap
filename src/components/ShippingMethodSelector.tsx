'use client';

import { ShippingMethod } from '@/lib/cart-store';

interface ShippingMethodSelectorProps {
  shippingMethods: ShippingMethod[];
  selectedMethod: ShippingMethod | null;
  onSelectMethod: (method: ShippingMethod) => void;
  isLoading?: boolean;
}

export function ShippingMethodSelector({
  shippingMethods,
  selectedMethod,
  onSelectMethod,
  isLoading = false,
}: ShippingMethodSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-neutral-100 rounded-lg"></div>
          <div className="h-20 bg-neutral-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (shippingMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-neutral-500">
          <p className="text-sm">No shipping methods available for this address.</p>
          <p className="text-xs mt-1">Please try a different address or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shippingMethods.map((method) => (
        <label
          key={method.id}
          className={`relative flex cursor-pointer rounded-lg border p-5 shadow-sm focus:outline-none transition-all duration-200 ${
            selectedMethod?.id === method.id
              ? 'border-neutral-950 ring-2 ring-neutral-950 bg-neutral-50'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          <input
            type="radio"
            name="shipping-method"
            className="sr-only"
            checked={selectedMethod?.id === method.id}
            onChange={() => onSelectMethod(method)}
          />
          
          {/* Custom radio button */}
          <div className="flex items-center mr-4">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedMethod?.id === method.id 
                ? 'border-neutral-950 bg-neutral-950' 
                : 'border-neutral-300'
            }`}>
              {selectedMethod?.id === method.id && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
          </div>
          
          <div className="flex flex-1 items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-neutral-950">
                {method.name}
              </span>
              <span className="text-sm text-neutral-600 mt-1">
                {method.min_delivery_time}-{method.max_delivery_time} business days
              </span>
              <span className="text-xs text-neutral-500 mt-1">
                {method.carrier}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-neutral-950">
                €{method.price}
              </span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
} 