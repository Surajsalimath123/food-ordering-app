import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "./supabase";

export type AuthedRequest = Request & { userId?: string };

export async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Missing Authorization Bearer token" });

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) return res.status(401).json({ error: "Invalid token" });

    req.userId = data.user.id;
    next();
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Auth error" });
  }
}
