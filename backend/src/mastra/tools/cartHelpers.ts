import { supabaseAdmin } from "../../supabase";

export type CartSize = "S" | "M" | "L" | "XL";

/**
 * Normalize any incoming size value into DB-allowed enum values.
 * DB constraint expects one of: S, M, L, XL.
 */
export function normalizeCartSize(input: unknown): CartSize {
  const raw = String(input ?? "").trim().toLowerCase();
  if (!raw) return "M";

  // Already in allowed format
  if (raw === "s") return "S";
  if (raw === "m") return "M";
  if (raw === "l") return "L";
  if (raw === "xl") return "XL";

  // Common variants
  if (["small", "sm"].includes(raw)) return "S";
  if (["medium", "med", "regular", "reg", "normal", "standard"].includes(raw)) return "M";
  if (["large", "lg", "big"].includes(raw)) return "L";
  if (["extra large", "extra-large", "xlarge", "xlrg"].includes(raw)) return "XL";

  return "M";
}

export async function getOrCreateActiveCartId(userId: string): Promise<string> {
  // 1) Try get existing ACTIVE cart
  const { data: existing, error: findErr } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) throw new Error(`carts lookup failed: ${findErr.message}`);
  if (existing?.id) return existing.id;

  // 2) Create ACTIVE cart
  const { data: created, error: createErr } = await supabaseAdmin
    .from("carts")
    .insert([{ user_id: userId, status: "ACTIVE" }])
    .select("id")
    .single();

  if (!createErr && created?.id) return created.id;

  // 3) If unique constraint hit (race), re-fetch
  const msg = String(createErr?.message ?? "");
  if (msg.includes("carts_one_active_per_user") || msg.includes("duplicate key")) {
    const { data: retry, error: retryErr } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (retryErr) throw new Error(`carts retry lookup failed: ${retryErr.message}`);
    return retry.id;
  }

  throw new Error(`carts insert failed: ${createErr?.message ?? "unknown error"}`);
}
