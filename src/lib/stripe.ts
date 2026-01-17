// src/lib/stripe.ts
import { supabase } from '@/lib/supabase';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

type PaymentSheetResponse = {
  paymentIntent: string;
  customer: string;
  ephemeralKey: string;
};

async function fetchPaymentSheetParams(amount: number): Promise<PaymentSheetResponse> {
  // ✅ get user session token
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  if (sessionErr) throw new Error(sessionErr.message);
  if (!session?.access_token) throw new Error('Not authenticated. Please sign in again.');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/payment-sheet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      // ✅ IMPORTANT: must be the user's JWT, not anon key
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error ?? 'payment-sheet Edge Function failed');
  }

  const paymentIntent = data?.paymentIntent;
  const customer = data?.customer;
  const ephemeralKey = data?.ephemeralKey;

  if (!paymentIntent || !customer || !ephemeralKey) {
    throw new Error(`Invalid response from payment-sheet: ${JSON.stringify(data)}`);
  }

  return { paymentIntent, customer, ephemeralKey };
}

// A) Alerts inside provider (simple)
export async function payWithStripe(totalInCents: number) {
  const { paymentIntent, customer, ephemeralKey } = await fetchPaymentSheetParams(totalInCents);

  const init = await initPaymentSheet({
    merchantDisplayName: 'Food Ordering App',
    paymentIntentClientSecret: paymentIntent,
    customerId: customer,
    customerEphemeralKeySecret: ephemeralKey,
    allowsDelayedPaymentMethods: true,
    returnURL: 'foodorderingapp://stripe-redirect', // safe to keep (optional)
  });

  if (init.error) throw new Error(init.error.message);

  const present = await presentPaymentSheet();
  if (present.error) {
    // if user cancels, Stripe returns an error; you can treat as non-fatal
    throw new Error(present.error.message);
  }

  Alert.alert('Success', 'Payment completed!');
  return true;
}
