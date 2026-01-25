// src/providers/CartProvider.tsx
import type { CartItem, PizzaSize, Product } from '@/types';
import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import React, { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { payWithStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: PizzaSize) => void;
  updateQuantity: (itemId: string, amount: 1 | -1) => void;
  clearCart: () => void;
  checkout: () => Promise<boolean>;
  total: number;
  totalItems: number;
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  checkout: async () => false,
  total: 0,
  totalItems: 0,
});

type PricingResult = {
  discount_percent: number;
  discount_amount: number;
  total_after_discount: number;
  used_loyalty_reward: boolean;
};

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

  const checkout = async (): Promise<boolean> => {
    if (!items.length) return false;

    const subtotal = total;

    try {
      // ✅ ensure user exists
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData?.user) {
        Alert.alert('Not signed in', 'Please sign in again.');
        return false;
      }
      const userId = authData.user.id;

      // ✅ 1) Server pricing (loyalty discount enforcement)
      const { data: pricingData, error: pricingErr } = await supabase.rpc(
        'compute_order_pricing',
        { subtotal }
      );

      if (pricingErr) {
        console.log('compute_order_pricing error', pricingErr);
        Alert.alert('Checkout failed', 'Could not calculate loyalty discount.');
        return false;
      }

      const p0 = Array.isArray(pricingData) ? pricingData[0] : pricingData;

      const pricing: PricingResult = {
        discount_percent: Number(p0?.discount_percent ?? 0),
        discount_amount: Number(p0?.discount_amount ?? 0),
        total_after_discount: Number(p0?.total_after_discount ?? subtotal),
        used_loyalty_reward: Boolean(p0?.used_loyalty_reward ?? false),
      };

      const chargeAmount = pricing.total_after_discount;
      const totalInCents = Math.max(0, Math.round(chargeAmount * 100));

      // ✅ 2) TAKE PAYMENT
      const payResult = await payWithStripe(totalInCents);

      if (!payResult.ok) {
        // user cancelled or failed — do NOT create order
        if (payResult.cancelled) return false;
        Alert.alert('Payment failed', payResult.message);
        return false;
      }

      // ✅ 3) Create order (Paid)
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'Paid',
          subtotal,
          discount_percent: pricing.discount_percent,
          discount_amount: pricing.discount_amount,
          total_after_discount: pricing.total_after_discount,
          used_loyalty_reward: pricing.used_loyalty_reward,
        })
        .select()
        .single();

      if (orderErr || !order) {
        console.log('order insert error', orderErr);
        Alert.alert(
          'Payment succeeded',
          'Payment went through but order creation failed. Please contact support.'
        );
        return false;
      }

      // ✅ 4) Create order items
      const orderItems = items.map((ci) => ({
        order_id: order.id,
        product_id: ci.product.id,
        quantity: ci.quantity,
        size: ci.size,
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);

      if (itemsErr) {
        console.log('order_items insert error', itemsErr);
        Alert.alert(
          'Payment succeeded',
          'Order was created but adding items failed. Please contact support.'
        );
        return false;
      }

      Alert.alert(
        'Success',
        pricing.used_loyalty_reward
          ? 'Order placed! 🎉 50% loyalty discount applied.'
          : 'Payment completed and order placed!'
      );

      clearCart();
      router.push('/(user)/orders');
      return true;
    } catch (e: any) {
      Alert.alert('Checkout failed', e?.message ?? 'Something went wrong');
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        clearCart,
        checkout,
        total,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
