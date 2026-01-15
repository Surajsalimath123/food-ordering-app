import { Stack } from 'expo-router';

export default function MenuLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit Product' }} />
      <Stack.Screen name="create" options={{ title: 'Create Product' }} />
    </Stack>
  );
}
