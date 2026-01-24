// src/api/cart.ts
import { BACKEND_URL } from "@/lib/backend";

export type CartItemDto = {
  id: string;
  quantity: number;
  size: string | null;
  products: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
  };
};

export type CartDto = {
  cartId: string | null;
  items: CartItemDto[];
};

export async function fetchCartFromBackend(userId: string): Promise<CartDto> {
  const url = `${BACKEND_URL}/cart?userId=${encodeURIComponent(userId)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to fetch cart (${res.status}). ${txt}`);
  }

  return res.json();
}
