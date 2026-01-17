import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

type ProductsContextType = {
  products: Product[];
  bestSellerIds: string[]; // product ids as strings
  loading: boolean;
  errorMsg: string | null;
  reload: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextType>({
  products: [],
  bestSellerIds: [],
  loading: false,
  errorMsg: null,
  reload: async () => {},
});

export function useProducts() {
  return useContext(ProductsContext);
}

export function ProductsProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellerIds, setBestSellerIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    setProducts((data ?? []) as Product[]);
  };

  const loadBestSellers = async () => {
    // Top 2 from your view: product_sales(product_id, total_sold)
    const { data, error } = await supabase
      .from('product_sales')
      .select('product_id,total_sold')
      .order('total_sold', { ascending: false })
      .limit(2);

    if (error) throw error;

    const ids = (data ?? []).map((r: any) => String(r.product_id));
    setBestSellerIds(ids);
  };

  const reload = async () => {
    try {
      setErrorMsg(null);
      setLoading(true);
      await Promise.all([loadProducts(), loadBestSellers()]);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Failed to load products');
      setProducts([]);
      setBestSellerIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();

    // Optional: auto-refresh best sellers if orders/items change
    const channel = supabase
      .channel('best-sellers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () =>
        loadBestSellers().catch(() => {})
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => loadBestSellers().catch(() => {})
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo(
    () => ({ products, bestSellerIds, loading, errorMsg, reload }),
    [products, bestSellerIds, loading, errorMsg]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
