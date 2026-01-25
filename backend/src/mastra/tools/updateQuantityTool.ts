import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

export const updateQuantityTool = createTool({
  id: "update_quantity",
  description: "Update quantity for a cart item using cart_items.id",
  inputSchema: z.object({
    userId: z.string(),
    cartItemId: z.string().min(1),
    quantity: z.number().int().min(1),
  }),
  execute: async ({ cartItemId, quantity }) => {
    const { error } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("id", cartItemId);

    if (error) return { ok: false, updated: false, error: error.message };
    return { ok: true, updated: true };
  },
});
