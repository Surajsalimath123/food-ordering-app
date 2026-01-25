import { addToCartTool } from "./tools/addToCartTool";
import { searchMenuTool } from "./tools/searchMenuTool";

import { getCartTool } from "./tools/getCartTool";
import { removeCartItemTool } from "./tools/removeCartItemTool";
import { updateQuantityTool } from "./tools/updateQuantityTool";

export const tools = [
  searchMenuTool,
  addToCartTool,
  getCartTool,
  removeCartItemTool,
  updateQuantityTool,
];
