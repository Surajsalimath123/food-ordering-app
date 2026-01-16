import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { useQuery } from '@tanstack/react-query';

const orderSelect = `
  id,
  created_at,
  status,
  user_id,
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

export const useMyOrders = () => {
  return useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(orderSelect)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return (data ?? []) as unknown as Order[];
    },
  });
};
