// backend/src/server.ts

import cors from "cors";
import "dotenv/config";
import express from "express";
import { z } from "zod";

import { orderAssistantAgent } from "./mastra/agents/orderAssistantAgent";

// ✅ Direct tool imports (deterministic core flows)
import { addToCartTool } from "./mastra/tools/addToCartTool";
import { getCartTool } from "./mastra/tools/getCartTool";
import { searchMenuTool } from "./mastra/tools/searchMenuTool";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "✅ Backend booted" });
});

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

// ✅ Map non-UUID ids to UUID for curl/local testing
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

function formatCart(cart: any) {
  const items: any[] = cart?.items ?? [];
  if (!cart?.cartId || items.length === 0) return "🛒 Your cart is empty.";

  const lines = items.map((it, idx) => {
    const name = it?.products?.name ?? "Item";
    const price = it?.products?.price;
    const qty = it?.quantity ?? 1;
    const size = it?.size ? ` (${it.size})` : "";
    const priceTxt = typeof price === "number" ? ` — $${price.toFixed(2)}` : "";
    return `${idx + 1}. ${qty}× ${name}${size}${priceTxt} (cart_item_id: ${it.id})`;
  });

  return `🛒 Cart\n${lines.join("\n")}`;
}

function formatSuggestions(matches: any[], topN = 2) {
  const picks = (matches ?? []).slice(0, topN);
  if (picks.length === 0) return "Sorry — no pizzas found in the menu right now.";

  const lines = picks.map((p, idx) => {
    const name = p?.name ?? `Pizza ${idx + 1}`;
    const price = p?.price;
    const priceTxt = typeof price === "number" ? `$${price.toFixed(2)}` : "";
    const idTxt = typeof p?.id !== "undefined" ? ` (productId: ${p.id})` : "";
    return `${idx + 1}. ${name}${priceTxt ? ` — ${priceTxt}` : ""}${idTxt}`;
  });

  return `🍕 Pizza suggestions:\n${lines.join("\n")}`;
}

/**
 * ✅ FIXES your Cart tab error: "Cannot GET /cart"
 * Frontend should call: GET /cart?userId=<uuid>
 */
app.get("/cart", async (req, res) => {
  try {
    const userIdRaw = String(req.query.userId ?? "").trim();
    if (!userIdRaw) {
      return res.status(400).json({ ok: false, error: "userId is required" });
    }

    const effectiveUserId = toUuidLikeUserId(userIdRaw);
    const cart = await getCartTool.execute({ userId: effectiveUserId });

    if (cart?.error) {
      return res.status(500).json({ ok: false, error: cart.error });
    }

    return res.json({ ok: true, ...cart });
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
    const text = rawText.toLowerCase();

    const wantsShowCart =
      text === "show cart" ||
      text.includes("show my cart") ||
      text.includes("view cart") ||
      text.includes("my cart") ||
      (text.includes("cart") && !text.includes("add") && !text.includes("remove"));

    const wantsPizzaSuggestions =
      text.includes("pizza suggestions") ||
      (text.includes("suggest") && text.includes("pizza")) ||
      text === "suggest pizza" ||
      text === "suggest pizzas" ||
      text === "i want pizza suggestions";

    // ✅ IMPORTANT: handle "Add the first one" as a standalone message
    const wantsAddFirstOnly =
      text === "add the first one" ||
      text === "add first" ||
      text.includes("add the first one") ||
      text.includes("add first one") ||
      text.includes("add first");

    const wantsAddFirstInline =
      (text.includes("suggest") && text.includes("add") && text.includes("first")) ||
      text.includes("add the first") ||
      text.includes("add first");

    // ------------------------------------------------------------
    // ✅ 1) SHOW CART (always tool call)
    // ------------------------------------------------------------
    if (wantsShowCart) {
      const cart = await getCartTool.execute({ userId: effectiveUserId });

      if (cart?.error) {
        return res.json({ ok: true, message: `❌ getCart error: ${cart.error}` });
      }

      return res.json({ ok: true, message: formatCart(cart) });
    }

    // ------------------------------------------------------------
    // ✅ 2) PIZZA SUGGESTIONS (always tool call)
    // ------------------------------------------------------------
    if (wantsPizzaSuggestions) {
      const menuResult = await searchMenuTool.execute({ query: "pizza" });
      const matches: any[] = menuResult?.matches ?? [];
      const suggestionText = formatSuggestions(matches, 2);

      // If user asked "suggest 2 pizzas and add the first one"
      if (wantsAddFirstInline) {
        if (matches.length === 0) {
          return res.json({
            ok: true,
            message: `Sorry — I couldn’t find pizzas right now.`,
          });
        }

        const first = matches[0];
        const productId = first?.id;

        if (typeof productId !== "number") {
          return res.json({
            ok: true,
            message:
              suggestionText +
              "\n\n❌ I found pizzas but productId was not a number. Check products.id type.",
          });
        }

        const addResult = await addToCartTool.execute({
          userId: effectiveUserId,
          productId,
          quantity: 1,
          size: "M",
        });

        return res.json({
          ok: true,
          message: `${suggestionText}\n\n${String(addResult)}`,
        });
      }

      return res.json({
        ok: true,
        message: `${suggestionText}\n\nSay: “add the first one” to add it to your cart.`,
      });
    }

    // ------------------------------------------------------------
    // ✅ 3) ADD FIRST ONE (standalone) — fixes your screenshot issue
    // ------------------------------------------------------------
    if (wantsAddFirstOnly) {
      const menuResult = await searchMenuTool.execute({ query: "pizza" });
      const matches: any[] = menuResult?.matches ?? [];

      if (matches.length === 0) {
        return res.json({
          ok: true,
          message: `Sorry — I couldn’t find pizzas right now.`,
        });
      }

      const first = matches[0];
      const productId = first?.id;

      if (typeof productId !== "number") {
        return res.json({
          ok: true,
          message: `I found pizzas but productId was not a number.`,
        });
      }

      const addResult = await addToCartTool.execute({
        userId: effectiveUserId,
        productId,
        quantity: 1,
        size: "M",
      });

      return res.json({
        ok: true,
        message: `✅ Added the first suggestion (${first.name}).\n${String(addResult)}`,
      });
    }

    // ------------------------------------------------------------
    // Fallback: let agent handle other chat (optional)
    // ------------------------------------------------------------
    const finalMessages: ChatMsg[] =
      normalizedMsgs.length > 0
        ? normalizedMsgs
        : typeof message === "string" && message.trim()
          ? [{ role: "user", content: message.trim() }]
          : [];

    if (finalMessages.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Either 'message' or 'messages' is required",
      });
    }

    const agentMessages: ChatMsg[] = [
      {
        role: "system",
        content: `userId="${effectiveUserId}". Always include this exact userId in every tool call input.`,
      },
      ...finalMessages,
    ];

    const result: any = await (orderAssistantAgent as any).generate(agentMessages, {
      maxSteps: 8,
    });

    const out =
      result?.text ??
      result?.message ??
      result?.content ??
      result?.output_text ??
      (typeof result === "string" ? result : JSON.stringify(result));

    return res.json({ ok: true, message: String(out) });
  } catch (e: any) {
    console.error("❌ /ai/chat error:", e);
    return res.status(500).json({
      ok: false,
      error: e?.message ?? "Server error",
    });
  }
});

const PORT = Number(process.env.PORT ?? 8787);
app.listen(PORT, () => {
  console.log(`✅ backend running: http://localhost:${PORT}`);
});
