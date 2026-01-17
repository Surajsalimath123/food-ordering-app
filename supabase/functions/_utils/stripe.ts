// supabase/functions/_utils/stripe.ts
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno&no-check';

import { getProfileOrThrow, getUserOrThrow } from './supabase.ts';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(stripeSecretKey, {
  httpClient: Stripe.createFetchHttpClient(),
});

export async function createOrRetrieveCustomer(req: Request) {
  const { supabase, user } = await getUserOrThrow(req);

  const profile = await getProfileOrThrow(supabase, user.id);

  // Already linked
  if (profile.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { uid: user.id },
  });

  // Save to profile (as the user)
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', profile.id);

  if (updateErr) throw new Error(updateErr.message);

  console.log(`✅ Created Stripe customer ${customer.id} for user ${user.id}`);

  return customer.id;
}
