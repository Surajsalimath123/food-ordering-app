import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error) setEmail(data?.user?.email ?? '');
    })();
  }, []);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Logout failed', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {/* Customer Support */}
      <Pressable
        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        onPress={() => router.push('/(user)/support')}
      >
        <Text style={styles.itemText}>Customer Support</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      {/* Hello + email */}
      <View style={styles.userCard}>
        <Text style={styles.hello}>Hello,</Text>
        <Text style={styles.email}>{email || 'Signed in'}</Text>
      </View>

      {/* Sign out */}
      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
        onPress={onLogout}
      >
        <Text style={styles.logoutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 18,
    color: '#111',
  },

  item: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  itemPressed: { opacity: 0.75 },
  itemText: { fontSize: 16, fontWeight: '700', color: '#111' },
  chevron: { fontSize: 20, color: '#999', fontWeight: '700' },

  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  hello: { fontSize: 14, fontWeight: '800', color: '#111' },
  email: { marginTop: 4, fontSize: 14, fontWeight: '700', color: '#666' },

  logoutButton: {
    marginTop: 18,
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutPressed: { opacity: 0.75 },
  logoutText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
