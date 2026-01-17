import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data?.user?.email ?? '');
    })();
  }, []);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Logout failed', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello{email ? ',' : ''}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}

      <Pressable style={styles.rowButton} onPress={() => router.push('/(user)/support')}>
        <Text style={styles.rowText}>Customer Support</Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  email: { fontSize: 14, color: '#666', marginBottom: 20, fontWeight: '600' },

  rowButton: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  rowText: { fontSize: 16, fontWeight: '700' },
  chevron: { fontSize: 22, fontWeight: '900', color: '#999' },

  logoutButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
