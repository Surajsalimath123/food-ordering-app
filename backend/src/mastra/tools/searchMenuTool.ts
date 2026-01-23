// src/tools/searchMenuTool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

export const searchMenuTool = createTool({
  id: "searchMenu",
  description:
    "Search menu products by a user query (name/description). Return matches and bestMatch.",
  inputSchema: z.object({
    query: z.string().min(1),
  }),

  execute: async (args: any) => {
    const qRaw =
      args?.query ??
      args?.input?.query ??
      args?.inputData?.query ??
      "";

    const q = String(qRaw).trim();
    if (!q) throw new Error("query is required");

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image, description")
      .ilike("name", `%${q}%`)
      .order("id", { ascending: true })
      .limit(10);

    if (error) throw new Error(`products search failed: ${error.message}`);

    const matches = data ?? [];
    return {
      ok: true,
      query: q,
      matches,
      bestMatch: matches[0] ?? null,
    };
  },
});
