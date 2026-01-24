// src/mastra/index.ts
import { addToCartTool } from "./tools/addToCartTool";
import { getCartTool } from "./tools/getCartTool";
import { removeCartItemTool } from "./tools/removeCartItemTool";
import { searchMenuTool } from "./tools/searchMenuTool";
import { updateCartItemTool } from "./tools/updateCartItemTool";

/**
 * IMPORTANT:
 * Tool order matters because the OpenAI tool list maps them to _0, _1, _2...
 * _0 MUST be searchMenuTool
 */
export const tools = [
  searchMenuTool,  // _0
  addToCartTool,   // _1 (your prompt might call it _2; we can align after)
  getCartTool,
  updateCartItemTool,
  removeCartItemTool,
] as const;

export const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]));
