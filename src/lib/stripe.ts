import { supabase } from '@/lib/supabase';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

export async function payWithStripe(totalInCents: number) {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount: totalInCents, currency: 'usd' },
  });

  if (error) {
    const anyErr: any = error;
    const details =
      anyErr?.context?.response?.data ||
      anyErr?.context?.response ||
      anyErr?.message ||
      'Edge Function returned a non-2xx status code';

    throw new Error(typeof details === 'string' ? details : JSON.stringify(details));
  }

  // ✅ If function returned an error object, show it clearly
  if ((data as any)?.error) {
    throw new Error((data as any).error);
  }

  if (!data?.paymentIntent || !data?.customer || !data?.ephemeralKey) {
    throw new Error(`Invalid response from create-payment-intent: ${JSON.stringify(data)}`);
  }

  const init = await initPaymentSheet({
    merchantDisplayName: 'Food Ordering App',
    paymentIntentClientSecret: data.paymentIntent,
    customerId: data.customer,
    customerEphemeralKeySecret: data.ephemeralKey,
    allowsDelayedPaymentMethods: true,
  });

  if (init.error) throw new Error(init.error.message);

  const present = await presentPaymentSheet();
  if (present.error) throw new Error(present.error.message);

  return true;
}
