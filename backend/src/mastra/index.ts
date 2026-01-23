// src/mastra/index.ts
import { addToCartTool } from "./tools/addToCartTool";
import { getCartTool } from "./tools/getCartTool";
import { removeCartItemTool } from "./tools/removeCartItemTool";
import { searchMenuTool } from "./tools/searchMenuTool";
import { updateCartItemTool } from "./tools/updateCartItemTool";

/**
 * IMPORTANT:
 * Tool order matters
 * _0 MUST be searchMenuTool
 */
export const tools = [
  searchMenuTool, // _0
  addToCartTool,  // _1
  getCartTool,
  updateCartItemTool,
  removeCartItemTool,
] as const;

export const toolsById = Object.fromEntries(
  tools.map((t) => [t.id, t])
);
