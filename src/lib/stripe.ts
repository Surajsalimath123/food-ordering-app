// src/lib/stripe.ts
import { supabase } from '@/lib/supabase';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim();
const ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

type PaymentSheetResponse = {
  paymentIntent: string;
  customer: string;
  ephemeralKey: string;
};

export type PayResult =
  | { ok: true }
  | { ok: false; cancelled?: boolean; message: string };

function assertEnv() {
  if (!SUPABASE_URL) throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
  if (!ANON_KEY) throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

async function fetchPaymentSheetParams(
  amountInCents: number,
  currency: string = 'usd'
): Promise<PaymentSheetResponse> {
  assertEnv();

  const amount = Math.round(amountInCents);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid amountInCents: ${amountInCents}`);
  }

  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr) throw new Error(sessionErr.message);

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error('Not authenticated. Please sign in again.');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/payment-sheet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ amount, currency }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error ??
      data?.message ??
      `payment-sheet failed (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const paymentIntent = data?.paymentIntent;
  const customer = data?.customer;
  const ephemeralKey = data?.ephemeralKey;

  if (!paymentIntent || !customer || !ephemeralKey) {
    throw new Error(`Invalid response from payment-sheet: ${JSON.stringify(data)}`);
  }

  return { paymentIntent, customer, ephemeralKey };
}

export async function payWithStripe(totalInCents: number): Promise<PayResult> {
  try {
    const { paymentIntent, customer, ephemeralKey } = await fetchPaymentSheetParams(
      totalInCents,
      'usd'
    );

    const init = await initPaymentSheet({
      merchantDisplayName: 'Food Ordering App',
      paymentIntentClientSecret: paymentIntent,
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      allowsDelayedPaymentMethods: true,
      returnURL: 'foodorderingapp://stripe-redirect',
    });

    if (init.error) throw new Error(init.error.message);

    const present = await presentPaymentSheet();

    if (present.error) {
      const isCancelled =
        present.error.code === 'Canceled' ||
        present.error.message?.toLowerCase().includes('canceled');

      if (isCancelled) return { ok: false, cancelled: true, message: 'Payment cancelled' };

      throw new Error(present.error.message);
    }

    Alert.alert('Success', 'Payment completed!');
    return { ok: true };
  } catch (e: any) {
    const msg = e?.message ?? 'Unknown payment error';
    Alert.alert('Payment failed', msg);
    return { ok: false, message: msg };
  }
}
