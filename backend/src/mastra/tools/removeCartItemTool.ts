// backend/src/mastra/tools/removeCartItemTool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

export const removeCartItemTool = createTool({
  id: "removeCartItem",
  description: "Remove a cart item using cart_items.id",
  inputSchema: z.object({
    userId: z.string(),
    cartItemId: z.string().min(1),
  }),
  outputSchema: z.object({
    ok: z.boolean(),
    removed: z.boolean(),
    error: z.string().optional(),
  }),

  execute: async ({ cartItemId }) => {
    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) return { ok: false, removed: false, error: error.message };
    return { ok: true, removed: true };
  },
});
