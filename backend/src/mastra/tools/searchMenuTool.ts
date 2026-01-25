import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabaseAdmin } from "../../supabase";

/**
 * Remove size words from a user query so menu search doesn't fail.
 * Example: "spicy jalapeno small" -> "spicy jalapeno"
 */
function stripSizeWords(input: string): string {
  const q = String(input ?? "").toLowerCase();

  // words/phrases users commonly type for size
  const phrases = [
    "extra large",
    "extra-large",
  ];

  let cleaned = q;
  for (const p of phrases) {
    cleaned = cleaned.replaceAll(p, " ");
  }

  // single tokens
  const tokensToRemove = new Set([
    "s",
    "m",
    "l",
    "xl",
    "small",
    "medium",
    "med",
    "regular",
    "reg",
    "large",
    "lg",
    "size",
  ]);

  const tokens = cleaned
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !tokensToRemove.has(t));

  return tokens.join(" ").trim();
}

export const searchMenuTool = createTool({
  id: "searchMenu",
  description:
    "Search menu products by a user query (name). Return matches and bestMatch.",
  inputSchema: z.object({
    query: z.string().min(1),
  }),

  execute: async (args: any) => {
    const qRaw = args?.query ?? args?.input?.query ?? args?.inputData?.query ?? "";
    const q0 = String(qRaw).trim();
    if (!q0) throw new Error("query is required");

    // ✅ strip sizes so searching doesn't fail
    const q = stripSizeWords(q0) || q0;

    // ✅ Only select columns that actually exist
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, image")
      .ilike("name", `%${q}%`)
      .order("id", { ascending: true })
      .limit(10);

    if (error) throw new Error(`products search failed: ${error.message}`);

    const matches = data ?? [];
    return {
      ok: true,
      query: q,
      originalQuery: q0,
      matches,
      bestMatch: matches[0] ?? null,
    };
  },
});
