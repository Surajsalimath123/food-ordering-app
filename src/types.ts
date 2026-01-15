export type PizzaSize = 'S' | 'M' | 'L' | 'XL';

export type Product = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
};

export type CartItem = {
  id: string;
  product: Product;
  size: PizzaSize;
  quantity: number;
};

export type OrderStatus = 'New' | 'Cooking' | 'Delivering' | 'Delivered';

export type OrderItem = {
  id: number;
  quantity: number;
  size: PizzaSize;
  products: Product;
};

export type Order = {
  id: number;
  created_at: string;
  status: OrderStatus;
  order_items: OrderItem[];
};
