// backend/src/mastra/tools/addToCartTool.ts

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

const ACTIVE_STATUSES = ["active", "ACTIVE", "Active"];

export const addToCartTool = createTool({
  id: "add_to_cart",
  description:
    "Add a product to the user's ACTIVE cart by productId, with optional size and quantity.",

  inputSchema: z.object({
    userId: z.string().min(1),
    productId: z.number().int().positive(),
    size: z.string().optional(),
    quantity: z.number().int().positive().default(1),
  }),

  execute: async ({ userId, productId, size, quantity }) => {
    const normalizedSize = (size ?? "").trim() || null;

    const cartId = await ensureActiveCartId(userId);

    // If item exists (same product+size), update quantity; else insert
    const existing = await findCartItem(cartId, productId, normalizedSize);

    if (existing) {
      const newQty = (existing.quantity ?? 0) + quantity;

      const { error: updErr } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existing.id);

      if (updErr) throw new Error(`update quantity failed: ${updErr.message}`);

      return `✅ Updated cart item (productId: ${productId}${
        normalizedSize ? `, size: ${normalizedSize}` : ""
      }) to quantity ${newQty}.`;
    }

    const { error: insErr } = await supabaseAdmin.from("cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      quantity,
      size: normalizedSize,
    });

    if (insErr) throw new Error(`insert cart item failed: ${insErr.message}`);

    return `✅ Added to cart (productId: ${productId}${
      normalizedSize ? `, size: ${normalizedSize}` : ""
    }) x${quantity}.`;
  },
});

async function ensureActiveCartId(userId: string): Promise<string> {
  // 1) Try find active cart (case-safe)
  const { data: existingCart, error: existingErr } = await supabaseAdmin
    .from("carts")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingErr) throw new Error(`get active cart failed: ${existingErr.message}`);
  if (existingCart?.id) return existingCart.id as string;

  // 2) Try create with status "active"
  const { data: newCart, error: newCartErr } = await supabaseAdmin
    .from("carts")
    .insert({ user_id: userId, status: "active" })
    .select("id")
    .single();

  if (!newCartErr && newCart?.id) return newCart.id as string;

  // 3) If duplicate, re-select (handles your carts_one_active_per_user constraint)
  const msg = newCartErr?.message ?? "";
  const isDuplicate =
    msg.toLowerCase().includes("duplicate key value") ||
    msg.toLowerCase().includes("unique constraint") ||
    msg.toLowerCase().includes("carts_one_active_per_user");

  if (isDuplicate) {
    const { data: cartAfter, error: afterErr } = await supabaseAdmin
      .from("carts")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (afterErr) throw new Error(`re-check active cart failed: ${afterErr.message}`);
    if (cartAfter?.id) return cartAfter.id as string;

    // Last resort: newest cart for user (status mismatch fallback)
    const { data: anyCart, error: anyErr } = await supabaseAdmin
      .from("carts")
      .select("id, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (anyErr) throw new Error(`fallback cart lookup failed: ${anyErr.message}`);
    if (anyCart?.id) return anyCart.id as string;
  }

  throw new Error(`create cart failed: ${msg || "unknown error"}`);
}

async function findCartItem(
  cartId: string,
  productId: number,
  size: string | null
): Promise<{ id: string; quantity: number } | null> {
  // ✅ IMPORTANT:
  // Supabase `.is()` is only for null/boolean. For text values use `.eq()`.
  let q = supabaseAdmin
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId);

  q = size === null ? q.is("size", null) : q.eq("size", size);

  const { data, error } = await q.limit(1).maybeSingle();

  if (error) throw new Error(`check cart item failed: ${error.message}`);
  return data?.id ? (data as any) : null;
}
