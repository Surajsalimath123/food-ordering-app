import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabase } from "./supabase";

/**
 * Tool: searchMenu
 * Reads real products from Supabase
 */
const searchMenu = createTool({
  id: "searchMenu",
  description: "Search menu items by keyword and max price",
  inputSchema: z.object({
    query: z.string().optional(),
    maxPrice: z.number().optional(),
  }),
  execute: async ({ query, maxPrice }) => {
    let q = supabase.from("products").select("id, name, price");

    if (query) {
      q = q.ilike("name", `%${query}%`);
    }

    if (maxPrice) {
      q = q.lte("price", maxPrice);
    }

    const { data, error } = await q.limit(5);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
});

/**
 * Mastra AI Order Assistant
 */
export const orderAssistant = new Agent({
  name: "OrderAssistant",
  instructions: `
You are an AI food ordering assistant.

RULES:
- You MUST use the searchMenu tool to find products.
- Do NOT invent menu items.
- If user says "under $15", extract maxPrice.
- Ask clarifying questions if needed.
- Only recommend items returned by tools.
  `.trim(),
  model: openai("gpt-4o-mini"),
  tools: {
    searchMenu,
  },
});
