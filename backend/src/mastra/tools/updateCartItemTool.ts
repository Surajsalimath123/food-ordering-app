import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";
import { getOrCreateActiveCartId, normalizeCartSize } from "./cartHelpers";

export const updateCartItemTool = createTool({
  id: "updateCartItem",
  description: "Update quantity for a cart item (by productId or productName).",

  inputSchema: z.object({
    userId: z.string().min(1),
    productId: z.number().optional(),
    productName: z.string().optional(),
    quantity: z.number().int().min(1),

    // Force size into DB-allowed values
    size: z
      .preprocess((v) => normalizeCartSize(v), z.enum(["S", "M", "L", "XL"]))
      .optional()
      .default("M"),
  }),

  outputSchema: z.object({
    ok: z.boolean(),
    updated: z.any().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ userId, productId, productName, quantity, size }) => {
    try {
      if (!productId && !productName) {
        return { ok: false, error: "Provide productId or productName" };
      }

      // Resolve productId from name if needed
      let pid = productId;
      if (!pid) {
        const name = String(productName ?? "").trim();
        const { data: prod, error: prodErr } = await supabaseAdmin
          .from("products")
          .select("id,name")
          .ilike("name", `%${name}%`)
          .limit(1)
          .maybeSingle();

        if (prodErr) return { ok: false, error: prodErr.message };
        if (!prod?.id) return { ok: false, error: "Product not found" };
        pid = prod.id;
      }

      const cartId = await getOrCreateActiveCartId(userId);

      // size is already normalized by schema preprocess
      const { data: existing, error: existErr } = await supabaseAdmin
        .from("cart_items")
        .select("id,quantity")
        .eq("cart_id", cartId)
        .eq("product_id", pid)
        .eq("size", size)
        .maybeSingle();

      if (existErr) return { ok: false, error: existErr.message };
      if (!existing?.id) return { ok: false, error: "Item not found in cart" };

      const { data: updated, error: updErr } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updErr) return { ok: false, error: updErr.message };
      return { ok: true, updated };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "unknown error" };
    }
  },
});
