import initialProducts from '@/assets/data/products';
import React, { createContext, useContext, useMemo, useState } from 'react';

export type Product = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
};

type CreateInput = Omit<Product, 'id'>;

type ProductsContextType = {
  products: Product[];
  getById: (id: number) => Product | undefined;
  createProduct: (input: CreateInput) => Product;
  updateProduct: (id: number, input: CreateInput) => void;
  deleteProduct: (id: number) => void;
};

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(
    // normalize possible differences in your seed file
    (initialProducts as any[]).map((p) => ({
      id: Number(p.id),
      name: p.name,
      price: Number(p.price),
      image: p.image ?? null,
    }))
  );

  const getById = (id: number) => products.find((p) => p.id === id);

  const createProduct = (input: CreateInput) => {
    const newId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = { id: newId, ...input };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: number, input: CreateInput) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...input, id } : p))
    );
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const value = useMemo(
    () => ({ products, getById, createProduct, updateProduct, deleteProduct }),
    [products]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider');
  return ctx;
}
