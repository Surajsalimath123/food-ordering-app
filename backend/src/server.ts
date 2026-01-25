// backend/src/server.ts
import cors from "cors";
import "dotenv/config";
import express from "express";
import { z } from "zod";

import { orderAssistantAgent } from "./mastra/agents/orderAssistantAgent";

import { addToCartTool } from "./mastra/tools/addToCartTool";
import { getCartTool } from "./mastra/tools/getCartTool";
import { removeCartItemTool } from "./mastra/tools/removeCartItemTool";
import { searchMenuTool } from "./mastra/tools/searchMenuTool";
import { updateQuantityTool } from "./mastra/tools/updateQuantityTool";

import { getTraces, runWithTraces } from "./mastra/toolTracing";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => res.json({ ok: true, message: "Backend booted" }));

const ChatBodySchema = z.object({
  userId: z.string().min(1),
  message: z.string().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]).optional(),
        content: z.string().min(1),
      })
    )
    .optional(),
});

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

function normalizeMessages(input: unknown): ChatMsg[] {
  if (!Array.isArray(input)) return [];
  const out: ChatMsg[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;

    const roleRaw = (raw as any).role;
    const contentRaw = (raw as any).content;

    const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
    if (!content) continue;

    const role: ChatMsg["role"] =
      roleRaw === "assistant" || roleRaw === "system" ? roleRaw : "user";

    out.push({ role, content });
  }
  return out;
}

function pickLatestUserText(message?: string, messages?: ChatMsg[]): string {
  if (typeof message === "string" && message.trim()) return message.trim();
  if (messages && messages.length) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content.trim();
    }
    return messages[messages.length - 1].content.trim();
  }
  return "";
}

function toUuidLikeUserId(userId: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) return userId;

  const map: Record<string, string> = {
    "test-user-1": "00000000-0000-0000-0000-000000000001",
    "test-user-2": "00000000-0000-0000-0000-000000000002",
  };

  return map[userId] ?? "00000000-0000-0000-0000-000000000001";
}

function formatCartClean(cart: any) {
  const items: any[] = cart?.items ?? [];
  if (!cart?.cartId || items.length === 0) return "Cart is empty.";

  const lines = items.map((it: any, idx: number) => {
    const name = it?.products?.name ?? "Item";
    const price = it?.products?.price;
    const qty = it?.quantity ?? 1;
    const size = it?.size ? ` (${it.size})` : "";
    const priceTxt = typeof price === "number" ? ` - $${price.toFixed(2)}` : "";
    return `${idx + 1}. ${qty}x ${name}${size}${priceTxt}`;
  });

  return `Cart\n${lines.join("\n")}`;
}

/**
 * Size parsing (DB-valid): S, M, L, XL
 * Users may say: small/medium/regular/large/xl/extra large OR S/M/L/XL
 */
function normalizeSizeToken(token: string): "S" | "M" | "L" | "XL" {
  const t = token.trim().toLowerCase();

  if (t === "s" || t === "sm" || t === "small") return "S";

  if (
    t === "m" ||
    t === "med" ||
    t === "medium" ||
    t === "regular" ||
    t === "reg" ||
    t === "normal" ||
    t === "standard"
  )
    return "M";

  if (t === "l" || t === "lg" || t === "large" || t === "big") return "L";

  if (
    t === "xl" ||
    t === "extra large" ||
    t === "extra-large" ||
    t === "x-large" ||
    t === "x large"
  )
    return "XL";

  return "M";
}

function extractSizeAndCleanQuery(addTextLower: string): {
  size: "S" | "M" | "L" | "XL";
  query: string;
} {
  // Normalize multi-word variants first so regex can catch them
  let cleaned = addTextLower
    .replace(/\bextra[\s-]?large\b/gi, "xl")
    .replace(/\bx[\s-]?large\b/gi, "xl")
    .trim();

  // Match size optionally preceded by "size"
  const sizeRegex =
    /\b(size\s+)?(small|sm|s|medium|med|m|regular|reg|normal|standard|large|lg|l|xl)\b/i;

  let size: "S" | "M" | "L" | "XL" = "M";

  const match = cleaned.match(sizeRegex);
  if (match?.[2]) {
    size = normalizeSizeToken(match[2]);
    cleaned = cleaned.replace(sizeRegex, " ");
  }

  // Remove stray "size" word if left behind
  cleaned = cleaned.replace(/\bsize\b/gi, " ");

  // Collapse spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return { size, query: cleaned };
}

function extractPriceCap(text: string): number | null {
  const m =
    text.match(/under\s*\$?\s*(\d+(\.\d+)?)/i) ||
    text.match(/below\s*\$?\s*(\d+(\.\d+)?)/i) ||
    text.match(/<=\s*\$?\s*(\d+(\.\d+)?)/i);
  if (!m) return null;

  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function extractIndexCommand(text: string): number | null {
  const m = text.match(/^(add|remove)\s+(\d+)$/i);
  if (!m) return null;

  const idx = Number(m[2]);
  return Number.isFinite(idx) ? idx : null;
}

function extractOrdinalAdd(text: string): number | null {
  if (/add\s+the\s+first/i.test(text) || /^add\s+first/i.test(text)) return 1;
  if (/add\s+the\s+second/i.test(text) || /^add\s+second/i.test(text)) return 2;
  if (/add\s+the\s+third/i.test(text) || /^add\s+third/i.test(text)) return 3;
  return null;
}

function extractIncreaseFirst(text: string): boolean {
  return /increase\s+quantity\s+of\s+the\s+first\s+item/i.test(text);
}

function extractRemoveSecond(text: string): boolean {
  return /remove\s+the\s+second\s+item/i.test(text);
}

function extractRemoveByNumber(text: string): number | null {
  const m = text.match(/remove\s+(item\s+)?(\d+)/i);
  if (!m) return null;

  const idx = Number(m[2]);
  return Number.isFinite(idx) ? idx : null;
}

function isShowCart(text: string) {
  const t = text.toLowerCase();
  return (
    t === "show cart" ||
    t.includes("show my cart") ||
    t.includes("view cart") ||
    t === "my cart"
  );
}

function isSuggestions(text: string) {
  const t = text.toLowerCase();
  return (
    t === "suggestions" ||
    t.includes("pizza suggestions") ||
    (t.includes("suggest") && (t.includes("pizza") || t.includes("pizzas"))) ||
    t.includes("suggest me")
  );
}

function isSpicyUnder(text: string) {
  const t = text.toLowerCase();
  return (
    t.includes("spicy") && (t.includes("under") || t.includes("below") || t.includes("<="))
  );
}

function isGenericUnder(text: string) {
  const t = text.toLowerCase();
  return (t.includes("under") || t.includes("below") || t.includes("<=")) && !t.includes("spicy");
}

// store last shown suggestions per user
type Suggestion = { id: number; name: string; price?: number };
const lastSuggestionsByUser = new Map<string, Suggestion[]>();

function formatSuggestionsClean(list: Suggestion[]) {
  if (!list.length) return "No matching items found.";

  const lines = list.slice(0, 5).map((p, i) => {
    const priceTxt = typeof p.price === "number" ? ` - $${p.price.toFixed(2)}` : "";
    return `${i + 1}. ${p.name}${priceTxt}`;
  });

  return `Suggestions\n${lines.join("\n")}\n\nSay: add 1 or add 2`;
}

async function toolSearchAndFilter(query: string, priceCap: number | null) {
  const r = await searchMenuTool.execute({ query });
  const matches: any[] = r?.matches ?? [];

  const cleaned: Suggestion[] = matches
    .filter((m) => typeof m?.id === "number")
    .map((m) => ({
      id: m.id,
      name: String(m.name ?? "Item"),
      price: typeof m.price === "number" ? m.price : undefined,
    }));

  const filtered =
    priceCap == null
      ? cleaned
      : cleaned.filter((p) => typeof p.price === "number" && p.price <= priceCap);

  return filtered;
}

app.get("/cart", async (req, res) => {
  try {
    const userIdRaw = String(req.query.userId ?? "").trim();
    if (!userIdRaw) {
      return res.status(400).json({ ok: false, error: "userId is required" });
    }

    const effectiveUserId = toUuidLikeUserId(userIdRaw);

    const result = await runWithTraces(async () => {
      const cart = await getCartTool.execute({ userId: effectiveUserId });
      return { cart };
    });

    const traces = getTraces();

    if ((result as any).cart?.error) {
      return res.status(500).json({ ok: false, error: (result as any).cart.error, traces });
    }

    return res.json({ ok: true, ...(result as any).cart, traces });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message ?? "Server error" });
  }
});

app.post("/ai/chat", async (req, res) => {
  try {
    const parsed = ChatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: parsed.error.issues?.[0]?.message ?? "Invalid request",
      });
    }

    const { userId, message, messages } = parsed.data;
    const effectiveUserId = toUuidLikeUserId(userId);

    const normalizedMsgs = normalizeMessages(messages);
    const rawText = pickLatestUserText(message, normalizedMsgs);
    const text = rawText.trim();
    const lower = text.toLowerCase();

    const result = await runWithTraces(async () => {
      // 1) show cart
      if (isShowCart(text)) {
        const cart = await getCartTool.execute({ userId: effectiveUserId });
        return { message: formatCartClean(cart), mode: "show_cart" };
      }

      // 2) suggestions (default pizza)
      if (isSuggestions(text)) {
        const list = await toolSearchAndFilter("pizza", null);
        lastSuggestionsByUser.set(effectiveUserId, list);
        return { message: formatSuggestionsClean(list.slice(0, 2)), mode: "suggestions" };
      }

      // 3) spicy under $X
      if (isSpicyUnder(text)) {
        const cap = extractPriceCap(text) ?? 15;
        const list = await toolSearchAndFilter("spicy", cap);
        lastSuggestionsByUser.set(effectiveUserId, list);
        return { message: formatSuggestionsClean(list.slice(0, 2)), mode: "spicy_under" };
      }

      // 4) under $X (generic)
      if (isGenericUnder(text)) {
        const cap = extractPriceCap(text);
        const list = await toolSearchAndFilter("pizza", cap);
        lastSuggestionsByUser.set(effectiveUserId, list);
        return { message: formatSuggestionsClean(list.slice(0, 2)), mode: "under_cap" };
      }

      // 5) add by ordinal or "add 1/add 2"
      const ordinal = extractOrdinalAdd(lower);
      const idxFromAddN = lower.match(/^add\s+(\d+)$/) ? extractIndexCommand(lower) : null;
      const addIndex = ordinal ?? idxFromAddN;

      if (addIndex != null) {
        const list = lastSuggestionsByUser.get(effectiveUserId) ?? [];
        const pick = list[addIndex - 1];
        if (!pick) {
          return {
            message: `I do not have suggestion ${addIndex}. Type "Suggestions" first.`,
            mode: "add_missing",
          };
        }

        await addToCartTool.execute({
          userId: effectiveUserId,
          productId: pick.id,
          quantity: 1,
          size: "M",
        });

        return { message: `Added: ${pick.name} (M)`, mode: "add_ok" };
      }

      // 6) increase quantity of first item
      if (extractIncreaseFirst(lower)) {
        const cart = await getCartTool.execute({ userId: effectiveUserId });
        const items: any[] = cart?.items ?? [];
        if (!items.length) return { message: "Cart is empty.", mode: "inc_empty" };

        const first = items[0];
        const newQty = Number(first.quantity ?? 1) + 1;

        await updateQuantityTool.execute({
          userId: effectiveUserId,
          cartItemId: first.id,
          quantity: newQty,
        });

        return { message: `Updated item 1 quantity to ${newQty}.`, mode: "inc_ok" };
      }

      // 7) remove second item
      if (extractRemoveSecond(lower)) {
        const cart = await getCartTool.execute({ userId: effectiveUserId });
        const items: any[] = cart?.items ?? [];
        if (items.length < 2) {
          return { message: "There is no second item to remove.", mode: "rm_no2" };
        }

        await removeCartItemTool.execute({
          userId: effectiveUserId,
          cartItemId: items[1].id,
        });

        return { message: "Removed item 2.", mode: "rm2_ok" };
      }

      // 8) remove N (by number)
      const rmIdx = lower.startsWith("remove") ? extractRemoveByNumber(lower) : null;
      if (rmIdx != null) {
        const cart = await getCartTool.execute({ userId: effectiveUserId });
        const items: any[] = cart?.items ?? [];
        const pick = items[rmIdx - 1];
        if (!pick) {
          return { message: `There is no item ${rmIdx} in your cart.`, mode: "rm_missing" };
        }

        await removeCartItemTool.execute({
          userId: effectiveUserId,
          cartItemId: pick.id,
        });

        return { message: `Removed item ${rmIdx}.`, mode: "rm_ok" };
      }

      // 9) add <name> <optional size> (supports small/large/xl anywhere)
      if (lower.startsWith("add ")) {
        const raw = lower.replace(/^add\s+/i, "").trim();
        const { size, query } = extractSizeAndCleanQuery(raw);

        if (!query) {
          return { message: "Tell me what item to add.", mode: "add_empty_query" };
        }

        const list = await toolSearchAndFilter(query, null);
        if (!list.length) return { message: "No matching items found.", mode: "add_nomatch" };

        const pick = list[0];

        await addToCartTool.execute({
          userId: effectiveUserId,
          productId: pick.id,
          quantity: 1,
          size,
        });

        return { message: `Added: ${pick.name} (${size})`, mode: "add_named" };
      }

      // 10) fallback to agent for anything else
      const finalMessages: ChatMsg[] =
        normalizedMsgs.length > 0
          ? normalizedMsgs
          : typeof message === "string" && message.trim()
          ? [{ role: "user", content: message.trim() }]
          : [];

      if (finalMessages.length === 0) return { message: "Empty message.", mode: "empty" };

      const agentMessages: ChatMsg[] = [
        {
          role: "system",
          content: `userId="${effectiveUserId}". Always include this exact userId in every tool call input.`,
        },
        ...finalMessages,
      ];

      const agentResult: any = await (orderAssistantAgent as any).generate(agentMessages, {
        maxSteps: 8,
      });

      const out =
        agentResult?.text ??
        agentResult?.message ??
        agentResult?.content ??
        agentResult?.output_text ??
        (typeof agentResult === "string" ? agentResult : JSON.stringify(agentResult));

      return { message: String(out), mode: "agent" };
    });

    const traces = getTraces();

    return res.json({
      ok: true,
      message: (result as any).message,
      traces,
    });
  } catch (e: any) {
    console.error("/ai/chat error:", e);
    return res.status(500).json({ ok: false, error: e?.message ?? "Server error" });
  }
});

const PORT = Number(process.env.PORT ?? 8787);
app.listen(PORT, () => console.log(`backend running: http://localhost:${PORT}`));
