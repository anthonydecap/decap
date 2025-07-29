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
        <h3 className="text-md font-medium text-gray-900">Shipping Method</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 rounded-md"></div>
          <div className="h-16 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (shippingMethods.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Shipping Method</h3>
        <div className="text-sm text-gray-500">
          No shipping methods available for this address.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium text-gray-900">Shipping Method</h3>
      <div className="space-y-3">
        {shippingMethods.map((method) => (
          <label
            key={method.id}
            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
              selectedMethod?.id === method.id
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="shipping-method"
              className="sr-only"
              checked={selectedMethod?.id === method.id}
              onChange={() => onSelectMethod(method)}
            />
            <div className="flex flex-1">
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-900">
                  {method.name}
                </span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  {method.min_delivery_time}-{method.max_delivery_time} business days
                </span>
                <span className="mt-1 text-sm text-gray-500">
                  {method.carrier}
                </span>
              </div>
            </div>
            <div className="ml-4 flex flex-shrink-0 items-center">
              <span className="text-lg font-medium text-gray-900">
                €{method.price}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
} 