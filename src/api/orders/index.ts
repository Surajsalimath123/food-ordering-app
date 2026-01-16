// src/api/orders/index.ts
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { useQuery } from '@tanstack/react-query';

const orderSelect = `
  id,
  created_at,
  status,
  order_items (
    id,
    quantity,
    size,
    products (
      id,
      name,
      price,
      image
    )
  )
`;

export const useOrderList = () => {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(orderSelect)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Order[];
    },
  });
};

export const useOrder = (id: number) => {
  return useQuery<Order>({
    queryKey: ['orders', id], // ✅ keep it consistent
    enabled: Number.isFinite(id) && id > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(orderSelect)
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as unknown as Order;
    },
  });
};
