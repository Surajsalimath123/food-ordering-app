// backend/src/mastra/index.ts

import { addToCartTool } from "./tools/addToCartTool";
import { getCartTool } from "./tools/getCartTool";
import { removeCartItemTool } from "./tools/removeCartItemTool";
import { searchMenuTool } from "./tools/searchMenuTool";
import { updateQuantityTool } from "./tools/updateQuantityTool";

// ✅ Mastra expects a ToolSet: Record<string, Tool>
// Keys here become the tool names the agent can call.
export const tools = {
  searchMenu: searchMenuTool,
  addToCart: addToCartTool,
  getCart: getCartTool,
  removeCartItem: removeCartItemTool,
  updateQuantity: updateQuantityTool,
};
