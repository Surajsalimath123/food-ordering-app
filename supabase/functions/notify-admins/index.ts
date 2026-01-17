import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendExpoPush } from "../_utils/expo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  orderId: number | string;
  title?: string;
  body?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Use service role for server-side reads of profiles/admins
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { orderId, title, body }: Body = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch admin push tokens
    const { data: admins, error } = await supabase
      .from("profiles")
      .select("id, expo_push_token")
      .eq("role", "ADMIN")
      .not("expo_push_token", "is", null);

    if (error) throw error;

    const tokens = (admins ?? [])
      .map((a) => a.expo_push_token as string)
      .filter(Boolean);

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "No admin tokens" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageTitle = title ?? "New order created";
    const messageBody = body ?? `Order #${orderId} was placed`;

    const result = await sendExpoPush(
      tokens.map((t) => ({
        to: t,
        sound: "default",
        title: messageTitle,
        body: messageBody,
        data: { type: "NEW_ORDER", orderId },
      }))
    );

    return new Response(JSON.stringify({ ok: true, sent: tokens.length, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
