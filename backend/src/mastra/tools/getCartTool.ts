// backend/src/mastra/tools/getCartTool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

const ACTIVE_STATUSES = ["active", "ACTIVE", "Active"];

export const getCartTool = createTool({
  id: "getCart",
  description: "Fetch the current active cart with product details",

  inputSchema: z.object({
    userId: z.string().min(1),
  }),

  execute: async ({ userId }) => {
    // Try to find an active cart (handles status case mismatch)
    const { data: cart, error: cartErr } = await supabaseAdmin
      .from("carts")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cartErr) {
      return { cartId: null, items: [], error: cartErr.message };
    }

    if (!cart?.id) {
      return { cartId: null, items: [] };
    }

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        size,
        product_id,
        products (
          id,
          name,
          price
        )
      `
      )
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: true });

    if (itemsErr) {
      return { cartId: cart.id, items: [], error: itemsErr.message };
    }

    return {
      cartId: cart.id,
      status: cart.status,
      items: items ?? [],
    };
  },
});
