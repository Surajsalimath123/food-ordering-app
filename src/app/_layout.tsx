import { Stack } from 'expo-router';
import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import { ProductsProvider } from '@/providers/ProductsProvider';

export default function RootLayout() {
  // create once (not on every render)
  const [queryClient] = useState(() => new QueryClient());

  return (
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
  );
}
