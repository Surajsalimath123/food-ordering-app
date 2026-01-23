// src/supabase.ts
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// ✅ Always load .env from backend root (not from random cwd)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("SUPABASE_URL =", url);
console.log("SUPABASE_SERVICE_ROLE_KEY exists =", !!serviceKey);

if (!url) throw new Error("SUPABASE_URL is required.");
if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
