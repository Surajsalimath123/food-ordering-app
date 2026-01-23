// src/tools/index.ts
import { addToCartTool } from "./addToCartTool";
import { getCartTool } from "./getCartTool";
import { removeCartItemTool } from "./removeCartItemTool";
import { searchMenuTool } from "./searchMenuTool";
import { updateCartItemTool } from "./updateCartItemTool";

/**
 * IMPORTANT:
 * The order here matters if your server maps tools to _0, _1, _2...
 * _0 MUST be searchMenuTool
 */
export const tools = [
  searchMenuTool,        // _0
  addToCartTool,         // _1 (or _2 depending on your setup)
  getCartTool,
  updateCartItemTool,
  removeCartItemTool,
] as const;

export const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]));
