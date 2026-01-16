import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) return null;

  // If already logged in, don't show auth screens
  if (session) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
