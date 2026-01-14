import { Stack } from 'expo-router';

export default function MenuLayout() {
  return (
    <Stack>
      {/* Menu list → NO header (Tabs already shows it) */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* Product details → HAS header */}
      <Stack.Screen
        name="[id]"
        options={{ title: 'Product' }}
      />
    </Stack>
  );
}
