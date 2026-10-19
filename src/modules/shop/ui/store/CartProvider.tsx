"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartPricingResult, ExcludedLine, PricingNotice } from "../../domain/cart-pricing";
import { apiFetch } from "../api";

/** One of the customer's players that can receive music (as returned by the cart API). */
export type CartPlayer = { id: string; name: string; typeName: string; maskedRegistration: string };

export type CartState = {
  cartId: string | null;
  pricing: CartPricingResult;
  itemCount: number;
  /** The customer's eligible players (empty for anonymous carts). */
  players?: CartPlayer[];
  /** Music may be bought now and assigned to a player later. */
  assignLaterAllowed?: boolean;
};

export type CartAddRequest =
  | { type: "ARRANGEMENT"; arrangementId: string; targetPlayerId?: string | null }
  | { type: "BUNDLE"; bundleId: string; targetPlayerId?: string | null }
  | { type: "SOFTWARE_LICENSE"; softwareProductId: string };

type CartContextValue = {
  cart: CartState | null;
  loading: boolean;
  /** Lines the server dropped (owned / unavailable). Reported once, kept for this visit. */
  removedNotices: ExcludedLine[];
  /** Price changes the server reported since the page loaded. */
  priceNotices: Extract<PricingNotice, { code: "PRICE_CHANGED" }>[];
  refresh: () => Promise<void>;
  add: (item: CartAddRequest) => Promise<void>;
  remove: (cartItemId: string) => Promise<void>;
  /** "This line is for player P" (only while the line is in the cart). */
  setTarget: (cartItemId: string, playerId: string) => Promise<void>;
  /**
   * Whether an item is in the cart (charged or covered). With a player id (or null for
   * "assign later") only lines for that target count; without one, any target does.
   */
  contains: (refId: string, playerId?: string | null) => boolean;
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

  const setTarget = useCallback(async (cartItemId: string, playerId: string) => {
    apply(await apiFetch<CartState>("/api/shop/cart", { method: "PATCH", body: { cartItemId, playerId } }));
  }, [apply]);

  const value = useMemo<CartContextValue>(() => {
    const ids = new Set<string>();
    const keys = new Set<string>();
    const track = (refId: string, target: string | null | undefined) => {
      ids.add(refId);
      keys.add(`${refId}|${target ?? ""}`);
    };
    for (const l of cart?.pricing.lines ?? []) track(l.refId, l.targetPlayerId);
    for (const e of cart?.pricing.excluded ?? []) if (!e.removeFromCart) track(e.refId, e.targetPlayerId);
    const contains = (refId: string, playerId?: string | null) =>
      playerId === undefined ? ids.has(refId) : keys.has(`${refId}|${playerId ?? ""}`);
    return { cart, loading, removedNotices, priceNotices, refresh, add, remove, setTarget, contains };
  }, [cart, loading, removedNotices, priceNotices, refresh, add, remove, setTarget]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
