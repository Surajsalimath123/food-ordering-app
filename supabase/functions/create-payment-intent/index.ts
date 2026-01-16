import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const body = await req.json().catch(() => null);
    const amount = body?.amount;
    const currency = body?.currency ?? "usd";

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: "amount (number) is required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const stripeFetch = async (
      path: string,
      body: URLSearchParams,
      extraHeaders: Record<string, string> = {}
    ) => {
      const res = await fetch(`https://api.stripe.com/v1/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          ...extraHeaders,
        },
        body: body.toString(),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || `Stripe error (${res.status})`);
      }
      return json;
    };

    // 1) Create customer
    const customer = await stripeFetch("customers", new URLSearchParams());

    // 2) Create ephemeral key
    const ephemeralKey = await stripeFetch(
      "ephemeral_keys",
      new URLSearchParams({ customer: customer.id }),
      { "Stripe-Version": "2024-06-20" }
    );

    // 3) Create payment intent
    const paymentIntent = await stripeFetch(
      "payment_intents",
      new URLSearchParams({
        amount: String(Math.round(amount)),
        currency,
        customer: customer.id,
        "automatic_payment_methods[enabled]": "true",
      })
    );

    return new Response(
      JSON.stringify({
        paymentIntent: paymentIntent.client_secret,
        customer: customer.id,
        ephemeralKey: ephemeralKey.secret,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
