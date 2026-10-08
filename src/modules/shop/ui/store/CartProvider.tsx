"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartPricingResult, ExcludedLine, PricingNotice } from "../../domain/cart-pricing";
import { apiFetch } from "../api";

export type CartState = { cartId: string | null; pricing: CartPricingResult; itemCount: number };

type CartContextValue = {
  cart: CartState | null;
  loading: boolean;
  /** Lines the server dropped (owned / unavailable). Reported once, kept for this visit. */
  removedNotices: ExcludedLine[];
  /** Price changes the server reported since the page loaded. */
  priceNotices: Extract<PricingNotice, { code: "PRICE_CHANGED" }>[];
  refresh: () => Promise<void>;
  add: (item: { type: "ARRANGEMENT"; arrangementId: string } | { type: "BUNDLE"; bundleId: string }) => Promise<void>;
  remove: (cartItemId: string) => Promise<void>;
  /** ids currently in the cart (charged or covered) */
  contains: (refId: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

function mergeBy<T extends { cartItemId: string }>(prev: T[], next: T[]) {
  return next.length ? [...prev, ...next.filter((n) => !prev.some((p) => p.cartItemId === n.cartItemId))] : prev;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState | null>(null);
  const [loading, setLoading] = useState(true);
  const [removedNotices, setRemoved] = useState<ExcludedLine[]>([]);
  const [priceNotices, setPrices] = useState<CartContextValue["priceNotices"]>([]);

  const apply = useCallback((next: CartState) => {
    setCart(next);
    setRemoved((prev) => mergeBy(prev, next.pricing.excluded.filter((e) => e.removeFromCart)));
    setPrices((prev) =>
      mergeBy(prev, next.pricing.notices.filter((n): n is CartContextValue["priceNotices"][number] => n.code === "PRICE_CHANGED")),
    );
  }, []);

  const refresh = useCallback(async () => {
    try {
      apply(await apiFetch<CartState>("/api/shop/cart"));
    } catch {
      // Keep the previous state; the cart page shows its own errors.
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    let alive = true;
    apiFetch<CartState>("/api/shop/cart")
      .then((next) => { if (alive) apply(next); })
      .catch(() => undefined)
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [apply]);

  const add = useCallback<CartContextValue["add"]>(async (item) => {
    apply(await apiFetch<CartState>("/api/shop/cart", { method: "POST", body: item }));
  }, [apply]);

  const remove = useCallback(async (cartItemId: string) => {
    apply(await apiFetch<CartState>("/api/shop/cart", { method: "DELETE", body: { cartItemId } }));
  }, [apply]);

  const value = useMemo<CartContextValue>(() => {
    const ids = new Set<string>();
    for (const l of cart?.pricing.lines ?? []) ids.add(l.refId);
    for (const e of cart?.pricing.excluded ?? []) if (!e.removeFromCart) ids.add(e.refId);
    return { cart, loading, removedNotices, priceNotices, refresh, add, remove, contains: (id) => ids.has(id) };
  }, [cart, loading, removedNotices, priceNotices, refresh, add, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
