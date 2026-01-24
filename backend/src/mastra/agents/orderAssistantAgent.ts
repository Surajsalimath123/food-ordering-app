// backend/src/mastra/agents/orderAssistantAgent.ts

import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { tools } from "../index";

export const orderAssistantAgent = new Agent({
  name: "AI Order Assistant",
  instructions: `
You are a food ordering assistant connected to real backend tools and a real database.

RULES
- Never invent menu items.
- Only recommend items returned by searchMenu.
- If user asks for suggestions, MUST call searchMenu.
- If user says "show my cart" MUST call getCart.
- Always use tools to mutate cart (addToCart/removeCartItem/updateQuantity).
- If user says "add <something>" call searchMenu first, then addToCart only using tool results.
- If user says "remove <something>" call getCart first, then removeCartItem/updateQuantity using cart_items.id.

Be concise.
`.trim(),
  model: openai("gpt-4o-mini"),
  tools,
});
