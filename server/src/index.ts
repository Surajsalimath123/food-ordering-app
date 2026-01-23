import cors from "cors";
import "dotenv/config";
import express from "express";

import { requireUser, type AuthedRequest } from "./auth";
import { orderAssistant } from "./mastraAgent";
import { supabase } from "./supabase";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

/**
 * TEMP helper endpoint for local testing:
 * Returns an access token so we can call protected endpoints via curl.
 *
 * NOTE: Do NOT expose this in production; keep for take-home testing only.
 */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      access_token: data.session?.access_token,
      user: data.user,
    });
  } catch (err: any) {
    console.error("❌ /login error:", err);
    return res.status(500).json({ error: "login_failed", details: err?.message ?? String(err) });
  }
});

// protected test endpoint
app.get("/me", requireUser, async (req: AuthedRequest, res) => {
  res.json({ ok: true, userId: req.userId });
});

/**
 * Chat endpoint (Mastra)
 * Next: we'll add tools (searchMenu, addToCart, etc.)
 */
app.post("/chat", requireUser, async (req: AuthedRequest, res) => {
  try {
    const { message } = req.body ?? {};
    const text = typeof message === "string" ? message : "";

    if (!text.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const result = await orderAssistant.generate(text);

    res.json({
      reply: result.text ?? "(no reply)",
      toolCalls: (result as any).toolCalls ?? [],
    });
  } catch (err: any) {
    console.error("❌ /chat error:", err);
    res.status(500).json({
      error: "chat_failed",
      details: err?.message ?? String(err),
    });
  }
});

const PORT = Number(process.env.PORT || 8787);
app.listen(PORT, () => console.log(`✅ Backend running: http://localhost:${PORT}`));
