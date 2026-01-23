import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

export const getCartTool = createTool({
  id: "getCart",
  description: "Fetch the current active cart for a user from Supabase.",
  inputSchema: z.object({
    userId: z.string(),
  }),
  outputSchema: z.object({
    cartId: z.string().nullable(),
    items: z.array(
      z.object({
        id: z.string(),
        product_id: z.union([z.string(), z.number()]),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        size: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
      })
    ),
  }),
  execute: async ({ userId }) => {
    // 1) get latest active cart
    const cartRes = await supabaseAdmin
      .from("carts")
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cartRes.error) throw new Error(cartRes.error.message);

    const cartId = cartRes.data?.id ?? null;
    if (!cartId) return { cartId: null, items: [] };

    // 2) load cart items + join products
    const itemsRes = await supabaseAdmin
      .from("cart_items")
      .select("id,product_id,quantity,size,products(name,price,image)")
      .eq("cart_id", cartId)
      .order("created_at", { ascending: false });

    if (itemsRes.error) throw new Error(itemsRes.error.message);

    const items = (itemsRes.data ?? []).map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      quantity: Number(row.quantity ?? 0),
      size: row.size ?? null,
      name: row.products?.name ?? "Unknown",
      price: Number(row.products?.price ?? 0),
      image: row.products?.image ?? null,
    }));

    return { cartId, items };
  },
});
