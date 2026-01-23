import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";
import { getOrCreateActiveCartId } from "./cartHelpers";

export const addToCartTool = createTool({
  id: "addToCart",
  description:
    "Add a product to the user's ACTIVE cart. Reuse existing ACTIVE cart if present. If item exists, increment quantity.",
  // ✅ Keep schema simple so Mastra won't force null-required fields
  inputSchema: z.object({
    userId: z.string().min(1),
    productId: z.number(),
  }),

  execute: async (args: any) => {
    const userId =
      String(args?.userId ?? args?.input?.userId ?? args?.inputData?.userId ?? "").trim();
    const productId = Number(
      args?.productId ?? args?.input?.productId ?? args?.inputData?.productId
    );

    if (!userId) throw new Error("userId is required");
    if (!Number.isFinite(productId)) throw new Error("productId must be a number");

    const cartId = await getOrCreateActiveCartId(userId);

    // Defaults (your current tool calls don’t pass size/qty)
    const size = "M";
    const addQty = 1;

    // If exists -> increment
    const { data: existingItem, error: findErr } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("size", size)
      .limit(1)
      .maybeSingle();

    if (findErr) throw new Error(`cart_items lookup failed: ${findErr.message}`);

    if (existingItem?.id) {
      const newQty = Number(existingItem.quantity ?? 0) + addQty;

      const { data: updated, error: updErr } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existingItem.id)
        .select("id, cart_id, product_id, size, quantity")
        .single();

      if (updErr) throw new Error(`cart_items update failed: ${updErr.message}`);

      return { ok: true, action: "updated", cartId, item: updated };
    }

    // Else insert
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("cart_items")
      .insert([{ cart_id: cartId, product_id: productId, size, quantity: addQty }])
      .select("id, cart_id, product_id, size, quantity")
      .single();

    if (insErr) throw new Error(`cart_items insert failed: ${insErr.message}`);

    return { ok: true, action: "inserted", cartId, item: inserted };
  },
});
