// src/server.ts
import cors from "cors";
import "dotenv/config";
import express from "express";
import { supabaseAdmin } from "./supabase";

// ✅ Import agent directly (avoid mastra.getAgent undefined)
import { orderAssistantAgent } from "./mastra/agents/orderAssistantAgent";

console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);
console.log("✅ Backend booted");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/openai-test", async (_req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY ?? "";
    const resp = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "unknown error" });
  }
});

app.get("/supabase-test", async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("products").select("id").limit(1);
    if (error) return res.status(500).json({ ok: false, error: error.message });
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "unknown error" });
  }
});

app.get("/cart-test", async (req, res) => {
  try {
    const userId = String(req.query.userId || "").trim();
    if (!userId) return res.status(400).json({ ok: false, error: "userId is required" });

    const { data: existingCart, error: cartErr } = await supabaseAdmin
      .from("carts")
      .select("id, user_id, status")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cartErr) {
      return res.status(500).json({ ok: false, error: `carts lookup failed: ${cartErr.message}` });
    }

    const cartId = existingCart?.id ?? null;

    if (!cartId) return res.json({ ok: true, userId, cartId: null, items: [] });

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("cart_items")
      .select("id, cart_id, product_id, size, quantity, created_at")
      .eq("cart_id", cartId)
      .order("created_at", { ascending: false });

    if (itemsErr) {
      return res.status(500).json({ ok: false, error: `cart_items lookup failed: ${itemsErr.message}` });
    }

    res.json({ ok: true, userId, cartId, items: items ?? [] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "unknown error" });
  }
});

app.get("/debug-tools", async (_req, res) => {
  try {
    // If you don’t have mastra instance listing, keep endpoint simple
    res.json({ ok: true, note: "debug-tools not wired to mastra instance in this build" });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message ?? "unknown error" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const { messages, userId } = req.body as {
      userId?: string;
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const uid = userId ?? process.env.GUEST_USER_ID ?? "guest_user_1";

    const result: any = await orderAssistantAgent.generate(messages, {
      system: `Current userId: ${uid}. Always use this userId for cart tools.`,
      maxSteps: 6,
    });

    res.json({
      text: result.text ?? "",
      debug: {
        toolCalls: result?.steps?.flatMap?.((s: any) => s?.toolCalls ?? []) ?? result?.toolCalls ?? null,
        steps: result?.steps ?? null,
        errors: result?.errors ?? null,
      },
    });
  } catch (err: any) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: err?.message ?? "Unknown error" });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`✅ backend running: http://localhost:${port}`));
