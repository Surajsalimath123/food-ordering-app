import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendExpoPush } from "../_utils/expo.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  orderId: number | string;
  userId: string; // uuid
  newStatus: string;
  title?: string;
  body?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { orderId, userId, newStatus, title, body }: Body = await req.json();
    if (!orderId || !userId || !newStatus) {
      return new Response(JSON.stringify({ error: "orderId, userId, newStatus are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const token = profile?.expo_push_token as string | null;
    if (!token) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "User has no token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageTitle = title ?? "Order update";
    const messageBody = body ?? `Your order #${orderId} is now: ${newStatus}`;

    const result = await sendExpoPush({
      to: token,
      sound: "default",
      title: messageTitle,
      body: messageBody,
      data: { type: "ORDER_STATUS", orderId, newStatus },
    });

    return new Response(JSON.stringify({ ok: true, sent: 1, result }), {
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
