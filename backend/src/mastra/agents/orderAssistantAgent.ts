// src/mastra/agents/orderAssistantAgent.ts
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { tools } from "../index";

/**
 * Order Assistant Agent
 * - Uses tools in the exact order exported from ../index
 * - tools[0] must be searchMenuTool (becomes _0)
 * - tools[1] must be addToCartTool  (becomes _1 in most setups)
 *
 * NOTE:
 * Your OpenAI debug showed add-to-cart tool name as _2 earlier.
 * That mapping is controlled by how you pass tools to the model.
 * For now, we just wire the tools correctly and then we’ll verify
 * tool names from /chat debug output.
 */
export const orderAssistantAgent = new Agent({
  name: "AI Order Assistant",
  instructions: `
You are a food ordering assistant.

Hard rules:
- If user wants to add an item to cart:
  1) Call the menu search tool to find the item.
  2) If a bestMatch exists, call the add-to-cart tool with productId and userId.
- Do NOT invent items.
- If multiple matches exist and no clear best match, ask the user to choose.
  `.trim(),
  model: openai("gpt-4o-mini"),
  tools,
});
