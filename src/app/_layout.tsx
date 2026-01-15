import { CartProvider } from '@/providers/CartProvider';
import { ProductsProvider } from '@/providers/ProductsProvider';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <ProductsProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" options={{ headerShown: true }} />
          <Stack.Screen name="(user)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </CartProvider>
    </ProductsProvider>
  );
}
