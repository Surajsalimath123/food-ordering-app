// src/api/orders/mutations.ts
import { supabase } from '@/lib/supabase';
import type { CartItem, OrderStatus } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Create order + order_items. Returns the NEW order id (number).
 */
export async function createOrder(items: CartItem[]): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Not authenticated');
  if (!items?.length) throw new Error('Cart is empty');

  // 1) Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'New',
    })
    .select('id')
    .single();

  if (orderError) throw orderError;
  if (!order?.id) throw new Error('Order create failed (missing id)');

  // 2) Insert order_items
  const payload = items.map((it) => ({
    order_id: order.id,
    product_id: it.product.id,
    quantity: it.quantity,
    size: it.size,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(payload);
  if (itemsError) throw itemsError;

  return order.id;
}

export const useCreateOrder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (items: CartItem[]) => createOrder(items),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['my-orders'] });
      await qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

type UpdateOrderStatusArgs = { id: number; status: OrderStatus };

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: UpdateOrderStatusArgs) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (_data, vars) => {
      await qc.invalidateQueries({ queryKey: ['orders'] });
      await qc.invalidateQueries({ queryKey: ['order', vars.id] });
      await qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};
