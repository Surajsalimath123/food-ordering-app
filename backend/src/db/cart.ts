import { getOrCreateActiveCartId, normalizeCartSize, type CartSize } from "../mastra/tools/cartHelpers";
import { supabaseAdmin } from "../supabase";

type AddToCartParams = {
  userId: string;
  productId: number;
  size?: unknown; // allow raw values, normalize inside
  quantity?: number;
};

export async function addToCart(params: AddToCartParams) {
  const userId = String(params.userId).trim();
  const productId = Number(params.productId);
  const quantity = Math.max(1, Number(params.quantity ?? 1));
  const size: CartSize = normalizeCartSize(params.size);

  if (!userId) throw new Error("userId is required");
  if (!Number.isFinite(productId) || productId <= 0) throw new Error("productId is invalid");

  const cartId = await getOrCreateActiveCartId(userId);

  // Check if item already exists (same product + size)
  const { data: existing, error: existErr } = await supabaseAdmin
    .from("cart_items")
    .select("id,quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("size", size)
    .maybeSingle();

  if (existErr) throw new Error(`cart_items lookup failed: ${existErr.message}`);

  if (existing?.id) {
    const newQuantity = Number(existing.quantity ?? 0) + quantity;

    const { error: updErr } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (updErr) throw new Error(`cart_items update failed: ${updErr.message}`);

    return {
      action: "updated" as const,
      cartItemId: existing.id,
      newQuantity,
    };
  }

  const { data: inserted, error: insErr } = await supabaseAdmin
    .from("cart_items")
    .insert([
      {
        cart_id: cartId,
        product_id: productId,
        size,
        quantity,
      },
    ])
    .select("id,quantity")
    .single();

  if (insErr) throw new Error(`cart_items insert failed: ${insErr.message}`);

  return {
    action: "inserted" as const,
    cartItemId: inserted.id,
    newQuantity: inserted.quantity,
  };
}
