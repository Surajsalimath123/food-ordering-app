import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";
import { getOrCreateCartId } from "./cartHelpers";

export const removeCartItemTool = createTool({
  id: "removeCartItem",
  description: "Remove a cart item (by productId or productName).",
  inputSchema: z.object({
    userId: z.string(),
    productId: z.number().optional(),
    productName: z.string().optional(),
    size: z.string().optional().default("M"),
  }),
  outputSchema: z.object({
    ok: z.boolean(),
    removedCount: z.number().optional(),
    error: z.string().optional(),
  }),
  execute: async ({ userId, productId, productName, size }) => {
    try {
      if (!productId && !productName) {
        return { ok: false, error: "Provide productId or productName" };
      }

      // resolve product id if needed
      let pid = productId;
      if (!pid) {
        const { data: prod, error: prodErr } = await supabaseAdmin
          .from("products")
          .select("id,name")
          .ilike("name", `%${String(productName).trim()}%`)
          .limit(1)
          .maybeSingle();

        if (prodErr) return { ok: false, error: prodErr.message };
        if (!prod?.id) return { ok: false, error: "Product not found" };
        pid = prod.id;
      }

      const cartId = await getOrCreateCartId(userId);

      const { error: delErr, count } = await supabaseAdmin
        .from("cart_items")
        .delete({ count: "exact" })
        .eq("cart_id", cartId)
        .eq("product_id", pid)
        .eq("size", size);

      if (delErr) return { ok: false, error: delErr.message };
      return { ok: true, removedCount: count ?? 0 };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "unknown error" };
    }
  },
});
