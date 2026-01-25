import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { addToCart } from "../../db/cart";
import { normalizeCartSize, type CartSize } from "./cartHelpers";

export const addToCartTool = createTool({
  id: "add_to_cart",
  description: "Add a menu item to the user's ACTIVE cart by productId, with optional size and quantity.",

  inputSchema: z.object({
    userId: z.string().min(1),
    productId: z.number().int().positive(),

    // Always normalize to DB-allowed values: S/M/L/XL
    size: z
      .preprocess((v) => normalizeCartSize(v), z.enum(["S", "M", "L", "XL"]))
      .optional()
      .default("M"),

    quantity: z.number().int().positive().default(1),
  }),

  execute: async ({ userId, productId, size, quantity }) => {
    const normalizedSize = normalizeCartSize(size) as CartSize;

    const result = await addToCart({
      userId,
      productId,
      size: normalizedSize,
      quantity,
    });

    return {
      ok: true,
      action: result.action,
      cartItemId: result.cartItemId,
      userId,
      productId,
      size: normalizedSize,
      quantity,
      message:
        result.action === "updated"
          ? `Updated cart item (productId: ${productId}, size: ${normalizedSize}) to quantity ${result.newQuantity}.`
          : `Added item (productId: ${productId}, size: ${normalizedSize}) x${quantity} to your cart.`,
    };
  },
});
