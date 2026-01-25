import { addToCartTool } from "./tools/addToCartTool";
import { getCartTool } from "./tools/getCartTool";
import { removeCartItemTool } from "./tools/removeCartItemTool";
import { searchMenuTool } from "./tools/searchMenuTool";
import { updateQuantityTool } from "./tools/updateQuantityTool";

import { traceTool } from "./toolTracing";

export const tools = [
  traceTool(searchMenuTool),
  traceTool(addToCartTool),
  traceTool(getCartTool),
  traceTool(removeCartItemTool),
  traceTool(updateQuantityTool),
];

export const toolsById = Object.fromEntries(tools.map((t: any) => [t.id, t]));
