import { Agent } from "@mastra/core/agent";
import { addToCartTool } from "../tools/addToCartTool";
import { getCartTool } from "../tools/getCartTool";
import { removeCartItemTool } from "../tools/removeCartItemTool";
import { searchMenuTool } from "../tools/searchMenuTool";
import { updateCartItemTool } from "../tools/updateCartItemTool";

export const orderAssistantAgent = new Agent({
  id: "orderAssistantAgent",
  name: "AI Order Assistant",
  model: "openai/gpt-4o-mini",
  instructions: `
You are an AI food ordering assistant.

Hard rules:
- You MUST use tools for ALL real data.
- If user asks "show my cart" / "view my cart" -> call getCart.
- If user asks for suggestions (spicy, under $X, no dairy, etc.) -> call searchMenu.
- If user says "add <item>" -> call addToCart.
- If user says "make <item> quantity N" -> call updateCartItem.
- If user says "remove <item>" -> call removeCartItem.

Never guess cart contents. If a tool fails, say: "Tool failed: <error>".
Keep responses short.
`,
  tools: [
    searchMenuTool,
    getCartTool,
    addToCartTool,
    updateCartItemTool,
    removeCartItemTool,
  ],
});
