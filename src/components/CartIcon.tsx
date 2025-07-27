"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

interface CartIconProps {
  onOpenCart: () => void;
}

export function CartIcon({ onOpenCart }: CartIconProps) {
  const { getItemCount } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue by only showing after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = getItemCount();

  // Only show cart icon if there are items in the cart
  if (!mounted || itemCount === 0) {
    return null;
  }

  return (
    <button onClick={onOpenCart} className="relative group">
      <div className="relative p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 text-gray-700 group-hover:text-gray-900 transition-colors"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>

        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      </div>
    </button>
  );
}
