import { Stack } from 'expo-router';

export default function MenuLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        contentStyle: { backgroundColor: 'white' },
        headerShadowVisible: false,

        // If you want a "clean" back button text on iOS:
        headerBackTitle: '',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Products' }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit Product' }} />
      <Stack.Screen name="create" options={{ title: 'Create Product' }} />
    </Stack>
  );
}
