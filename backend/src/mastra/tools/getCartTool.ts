import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

export const getCartTool = createTool({
  id: "getCart",
  description: "Fetch the current ACTIVE cart with product details",

  inputSchema: z.object({
    userId: z.string().min(1),
  }),

  execute: async ({ userId }) => {
    // 1️⃣ Active cart
    const { data: cart } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!cart) {
      return { cartId: null, items: [] };
    }

    // 2️⃣ Cart items + product info
    const { data: items } = await supabaseAdmin
      .from("cart_items")
      .select(`
        id,
        quantity,
        size,
        products (
          id,
          name,
          price
        )
      `)
      .eq("cart_id", cart.id);

    return {
      cartId: cart.id,
      items: items ?? [],
    };
  },
});
