import { supabaseAdmin } from "../../supabase";

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
