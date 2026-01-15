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
