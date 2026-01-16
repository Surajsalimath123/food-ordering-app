// src/providers/CartProvider.tsx
import type { CartItem, PizzaSize, Product } from '@/types';
import { randomUUID } from 'expo-crypto';
import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
    useState,
} from 'react';

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: PizzaSize) => void;
  updateQuantity: (itemId: string, amount: 1 | -1) => void;
  clearCart: () => void;
  total: number;
  totalItems: number;
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  totalItems: 0,
});

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const clearCart = () => setItems([]);

  const updateQuantity = (itemId: string, amount: 1 | -1) => {
    setItems((existing) =>
      existing
        .map((it) => (it.id === itemId ? { ...it, quantity: it.quantity + amount } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const addItem = (product: Product, size: PizzaSize) => {
    setItems((existing) => {
      const existingItem = existing.find(
        (it) => it.product.id === product.id && it.size === size
      );

      if (existingItem) {
        return existing.map((it) =>
          it.id === existingItem.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }

      const newCartItem: CartItem = {
        id: randomUUID(),
        product,
        size,
        quantity: 1,
      };

      return [newCartItem, ...existing];
    });
  };

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, clearCart, total, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
