import { Stack } from 'expo-router';

export default function OrdersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This is the TopTabs group */}
      <Stack.Screen name="list" />

      {/* This is the details screen */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
