// supabase/functions/_utils/supabase.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

type StripeLike = any;

function getBearerToken(req: Request): string | null {
  const auth =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!auth) return null;

  const parts = auth.split(" ");
  if (parts.length !== 2) return null;

  const [scheme, token] = parts;
  if (scheme.toLowerCase() !== "bearer") return null;

  return token?.trim() || null;
}

export function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE") ??
    "";

  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL env var");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY env var");

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function getUserFromRequest(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("Missing Authorization Bearer token");
  }

  // Important: Use admin client but pass the user token explicitly
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error) throw new Error(`auth.getUser failed: ${error.message}`);
  if (!data?.user) throw new Error("User not found from token");

  return data.user;
}

/**
 * Create or retrieve a Stripe customer for the logged-in Supabase user.
 * Stores stripe_customer_id on profiles table (or wherever you store it).
 */
export async function createOrRetrieveCustomer(req: Request, stripe: StripeLike) {
  const supabase = createSupabaseAdminClient();
  const user = await getUserFromRequest(req);

  // ✅ Adjust table/column names if yours are different
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("id, email, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr) throw new Error(`profiles select failed: ${profileErr.message}`);

  // If profile row doesn’t exist, create it (optional, depends on your schema)
  if (!profile) {
    const { error: insertErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      stripe_customer_id: null,
    });
    if (insertErr) throw new Error(`profiles insert failed: ${insertErr.message}`);
  }

  // Re-fetch to ensure we have stripe_customer_id
  const { data: profile2, error: profileErr2 } = await supabase
    .from("profiles")
    .select("id, email, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profileErr2) throw new Error(`profiles re-select failed: ${profileErr2.message}`);

  if (profile2.stripe_customer_id) {
    return profile2.stripe_customer_id;
  }

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id },
  });

  // Save Stripe customer id
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  if (updateErr) throw new Error(`profiles update failed: ${updateErr.message}`);

  return customer.id;
}
