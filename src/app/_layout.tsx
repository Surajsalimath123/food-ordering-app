import { Stack } from 'expo-router';
import React, { useState } from 'react';

import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { ProductsProvider } from '@/providers/ProductsProvider';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env');
  }

  return (
    <StripeProvider publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProductsProvider>
            <CartProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(user)" />
                <Stack.Screen name="(admin)" />
              </Stack>
            </CartProvider>
          </ProductsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </StripeProvider>
  );
}
