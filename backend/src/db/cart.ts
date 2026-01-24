import { supabase } from "../supabase";

export type CartRow = {
  id: string;
  user_id: string;
  status: "active" | "completed";
};

export type CartItem = {
  id: string;
  cartId: string;
  productId: number;
  size: string | null;
  quantity: number;
};

export async function getActiveCart(userId: string): Promise<CartRow | null> {
  const { data, error } = await supabase
    .from("carts")
    .select("id,user_id,status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (error) {
    if ((error as any).code === "PGRST116") return null;
    throw error;
  }

  return data as CartRow;
}

export async function ensureActiveCart(userId: string): Promise<CartRow> {
  const existing = await getActiveCart(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId, status: "active" })
    .select("id,user_id,status")
    .single();

  if (error) throw error;
  return data as CartRow;
}

export async function getCartItems(cartId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id,cart_id,product_id,size,quantity")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    cartId: row.cart_id,
    productId: row.product_id,
    size: row.size ?? null,
    quantity: row.quantity ?? 0,
  }));
}

/**
 * Decrement quantity. If qty hits 0 -> delete row.
 */
export async function decrementCartItem(
  userId: string,
  productId: number,
  size: string | null,
  removeQty: number
) {
  const cart = await getActiveCart(userId);
  if (!cart) return { changed: false, reason: "NO_ACTIVE_CART" as const };

  const { data: existing, error: findErr } = await supabase
    .from("cart_items")
    .select("id,quantity")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .eq("size", size)
    .maybeSingle();

  if (findErr) throw findErr;
  if (!existing) return { changed: false, reason: "NOT_FOUND" as const };

  const currentQty = existing.quantity ?? 0;
  const newQty = currentQty - removeQty;

  if (newQty <= 0) {
    const { error: delErr } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", existing.id);
    if (delErr) throw delErr;
    return { changed: true, deleted: true as const };
  }

  const { error: upErr } = await supabase
    .from("cart_items")
    .update({ quantity: newQty })
    .eq("id", existing.id);
  if (upErr) throw upErr;

  return { changed: true, deleted: false as const, newQty };
}

/**
 * Set quantity (<=0 deletes)
 */
export async function setCartItemQuantity(
  userId: string,
  productId: number,
  size: string | null,
  quantity: number
) {
  const cart = await getActiveCart(userId);
  if (!cart) return { changed: false, reason: "NO_ACTIVE_CART" as const };

  const { data: existing, error: findErr } = await supabase
    .from("cart_items")
    .select("id")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .eq("size", size)
    .maybeSingle();

  if (findErr) throw findErr;
  if (!existing) return { changed: false, reason: "NOT_FOUND" as const };

  if (quantity <= 0) {
    const { error: delErr } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", existing.id);
    if (delErr) throw delErr;
    return { changed: true, deleted: true as const };
  }

  const { error: upErr } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", existing.id);

  if (upErr) throw upErr;
  return { changed: true, deleted: false as const };
}
