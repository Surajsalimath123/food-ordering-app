// supabase/functions/payment-sheet/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import Stripe from "https://esm.sh/stripe@13.10.0?target=deno&deno-std=0.132.0&no-check";
import { createOrRetrieveCustomer } from "../_utils/supabase.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
if (!stripeSecretKey) console.error("Missing STRIPE_SECRET_KEY");

const stripe = new Stripe(stripeSecretKey, {
  httpClient: Stripe.createFetchHttpClient(),
});

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const { amount, currency = "usd" } = body;

    if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "amount (number > 0) is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Must be logged-in user (because we link to profiles)
    const customerId = await createOrRetrieveCustomer(req, stripe);

    // Ephemeral key for Payment Sheet
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2024-06-20" } // keep consistent with your Stripe-Version
    );

    // Payment Intent (amount must be in the smallest currency unit)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        customer: customerId,
        ephemeralKey: ephemeralKey.secret,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
