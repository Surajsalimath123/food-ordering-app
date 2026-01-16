import { useAuth } from '@/providers/AuthProvider';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // ❌ Not logged in
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  // ✅ Logged in: route by role
  if (profile?.role === 'ADMIN') {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(user)" />;
}
