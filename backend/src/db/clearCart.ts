// backend/src/db/clearCart.ts
import { getOrCreateActiveCartId } from "../mastra/tools/cartHelpers";
import { supabaseAdmin } from "../supabase";

export async function clearActiveCart(userIdRaw: string) {
  const userId = String(userIdRaw ?? "").trim();
  if (!userId) throw new Error("userId is required");

  // Source-of-truth: same helper used by addToCart/getCart tools
  const cartId = await getOrCreateActiveCartId(userId);

  const { error: delErr } = await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId);

  if (delErr) throw new Error(`cart_items delete failed: ${delErr.message}`);

  return { ok: true, cartId };
}
