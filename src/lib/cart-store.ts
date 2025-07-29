import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  weight: number; // Weight in kg
}

export interface ShippingMethod {
  id: number;
  name: string;
  price: string;
  currency: string;
  min_delivery_time: number;
  max_delivery_time: number;
  carrier: string;
  service_point_input: string;
}

interface CartStore {
  items: CartItem[];
  selectedShippingMethod: ShippingMethod | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  setShippingMethod: (method: ShippingMethod) => void;
  getTotalWithShipping: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedShippingMethod: null,
      
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== id) });
      },
      
      updateQuantity: (id, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.id !== id) });
        } else {
          set({
            items: items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },
      
      clearCart: () => {
        set({ items: [], selectedShippingMethod: null });
      },
      
      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getItemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      setShippingMethod: (method) => {
        set({ selectedShippingMethod: method });
      },

      getTotalWithShipping: () => {
        const { items, selectedShippingMethod } = get();
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const shippingCost = selectedShippingMethod ? parseFloat(selectedShippingMethod.price) : 0;
        return subtotal + shippingCost;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
); 