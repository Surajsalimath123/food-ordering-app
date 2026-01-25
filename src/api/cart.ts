// src/api/cart.ts
import { BACKEND_URL } from "@/lib/backend";

export type CartItemDto = {
  id: string;
  cart_id: string;
  product_id: number;
  quantity: number;
  size: string | null;
  products: {
    id: number;
    name: string;
    price: number;
    image?: string | null;
  };
};

export type BackendCartResponse = {
  ok: boolean;
  cartId?: string;
  items?: CartItemDto[];
  error?: string;
};

export async function fetchCartFromBackend(userId: string) {
  const res = await fetch(
    `${BACKEND_URL}/cart?userId=${encodeURIComponent(userId)}`
  );
  const data = (await res.json().catch(() => ({}))) as BackendCartResponse;

  if (!res.ok || !data.ok) {
    throw new Error(data?.error ?? "Failed to fetch cart");
  }

  return {
    cartId: data.cartId ?? null,
    items: data.items ?? [],
  };
}

export async function clearCartFromBackend(userId: string) {
  const res = await fetch(`${BACKEND_URL}/cart/clear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok)
    throw new Error(data?.error ?? "Failed to clear cart");
  return data;
}

export async function addToCartOnBackend(params: {
  userId: string;
  productId: number;
  quantity?: number;
  size?: string;
}) {
  const res = await fetch(`${BACKEND_URL}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok)
    throw new Error(data?.error ?? "Failed to add to cart");
  return data;
}

/**
 * ✅ NEW: Decrease quantity by 1 (or remove if it becomes 0).
 * Used by the Cart screen "−" button.
 *
 * Backend handles:
 * - if quantity > 1 => decrement
 * - if quantity == 1 => remove row
 */
export async function removeFromCartOnBackend(params: {
  userId: string;
  productId: number;
  size?: string | null;
}) {
  const res = await fetch(`${BACKEND_URL}/cart/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok)
    throw new Error(data?.error ?? "Failed to remove from cart");
  return data;
}
