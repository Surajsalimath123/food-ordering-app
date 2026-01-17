import { createClient } from "jsr:@supabase/supabase-js@2";

type SupabaseClient = ReturnType<typeof createClient>;

function getEnv(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function getSupabaseClient(req: Request): SupabaseClient {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseAnonKey = getEnv("SUPABASE_ANON_KEY");

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") ?? "",
      },
    },
  });
}

export async function getUser(req: Request) {
  const supabase = getSupabaseClient(req);

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`auth.getUser failed: ${error.message}`);
  if (!data?.user) throw new Error("Not authenticated");

  return data.user;
}

export async function getOrCreateProfile(req: Request) {
  const supabase = getSupabaseClient(req);
  const user = await getUser(req);

  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) throw new Error(`profiles select failed: ${selectError.message}`);
  if (existing) return existing;

  // Minimal insert that matches your table (id + role)
  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: user.id, role: "USER" })
    .select("*")
    .single();

  if (insertError) throw new Error(`profiles insert failed: ${insertError.message}`);

  return created;
}

export async function createOrRetrieveCustomer(req: Request, stripe: any) {
  const supabase = getSupabaseClient(req);
  const user = await getUser(req);

  const profile = await getOrCreateProfile(req);

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id as string;
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { supabase_uid: user.id },
  });

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  if (updateError) {
    throw new Error(`profiles update stripe_customer_id failed: ${updateError.message}`);
  }

  return customer.id as string;
}
