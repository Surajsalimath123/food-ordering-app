// src/types.ts
import type { Database } from './database.types';

// ✅ Supabase table helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// ✅ App-specific types
export type PizzaSize = 'S' | 'M' | 'L' | 'XL';

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string | null; // ✅ IMPORTANT: make it NOT optional (matches Supabase better)
};

// ✅ Cart types
export type CartItem = {
  id: string;
  product: Product;
  size: PizzaSize;
  quantity: number;
};

// ✅ Supabase DB row types (optional helpers)
export type DbProduct = Tables<'products'>;
export type DbOrder = Tables<'orders'>;
export type DbOrderItem = Tables<'order_items'>;

// ✅ Orders UI types
export type OrderStatus = 'New' | 'Cooking' | 'Delivering' | 'Delivered';
export const OrderStatusList: OrderStatus[] = [
  'New',
  'Cooking',
  'Delivering',
  'Delivered',
];

export type OrderItem = {
  id: number;
  quantity: number;
  size: PizzaSize;
  products: Product; // keep app Product to support mock assets
};

export type Order = {
  id: number;
  created_at: string;
  status: OrderStatus;
  order_items: OrderItem[];
};

// ✅ Profiles
export type ProfileRole = 'ADMIN' | 'USER';
export type Profile = {
  id: string;
  role: ProfileRole;
};
