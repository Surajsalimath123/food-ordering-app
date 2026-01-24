import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

export const removeCartItemTool = createTool({
  id: "removeCartItem",
  description:
    "Remove or decrement a cart item using cartItemId. If removeQuantity >= current quantity, item is deleted.",

  inputSchema: z.object({
    cartItemId: z.string().min(1),
    removeQuantity: z.number().int().positive().default(1),
  }),

  outputSchema: z.object({
    ok: z.boolean(),
    newQuantity: z.number().optional(),
    deleted: z.boolean().optional(),
    error: z.string().optional(),
  }),

  execute: async ({ cartItemId, removeQuantity }) => {
    try {
      const { data: row, error: readErr } = await supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("id", cartItemId)
        .single();

      if (readErr) return { ok: false, error: readErr.message };

      const currentQty = row.quantity ?? 0;
      const nextQty = currentQty - removeQuantity;

      if (nextQty <= 0) {
        const { error: delErr } = await supabaseAdmin
          .from("cart_items")
          .delete()
          .eq("id", cartItemId);

        if (delErr) return { ok: false, error: delErr.message };
        return { ok: true, deleted: true };
      }

      const { error: upErr } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: nextQty })
        .eq("id", cartItemId);

      if (upErr) return { ok: false, error: upErr.message };
      return { ok: true, deleted: false, newQuantity: nextQty };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "unknown error" };
    }
  },
});
