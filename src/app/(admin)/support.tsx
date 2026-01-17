import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

type Ticket = {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminSupportScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const openCount = useMemo(
    () => tickets.filter((t) => (t.status ?? '').toLowerCase() === 'open').length,
    [tickets]
  );

  const load = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('support_tickets')
        .select('id,user_id,subject,message,status,created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('admin support load error', error);
        Alert.alert('Failed', 'Could not load support tickets.');
        return;
      }

      setTickets((data ?? []) as Ticket[]);
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (ticketId: string) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: 'Closed' })
      .eq('id', ticketId);

    if (error) {
      console.log('markDone error', error);
      Alert.alert('Failed', 'Could not update ticket status.');
      return;
    }

    await load();
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }: { item: Ticket }) => {
    const isOpen = (item.status ?? '').toLowerCase() === 'open';

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={[styles.badge, isOpen ? styles.badgeOpen : styles.badgeClosed]}>
            {isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>

        <Text style={styles.meta}>Ticket: {item.id}</Text>
        <Text style={styles.meta}>User: {item.user_id}</Text>
        <Text style={styles.meta}>
          {new Date(item.created_at).toLocaleString()}
        </Text>

        <Text style={styles.message}>{item.message}</Text>

        {isOpen ? (
          <Pressable style={styles.doneBtn} onPress={() => markDone(item.id)}>
            <Text style={styles.doneText}>Mark as Closed</Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Support Tickets</Text>
            <Text style={styles.subtitle}>
              {loading ? 'Loading...' : `${tickets.length} total • ${openCount} open`}
            </Text>
          </View>

          <Pressable style={styles.refreshBtn} onPress={load}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>

        <FlatList
          data={tickets}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No tickets yet</Text>
                <Text style={styles.emptySub}>
                  When users submit support requests, they will appear here.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f2f2' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  title: { fontSize: 26, fontWeight: '900', color: '#111' },
  subtitle: { marginTop: 4, fontSize: 13, color: '#666', fontWeight: '700' },

  refreshBtn: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshText: { color: 'white', fontWeight: '900' },

  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
    gap: 6,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  subject: { flex: 1, fontSize: 16, fontWeight: '900', color: '#111' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '900',
    overflow: 'hidden',
  },
  badgeOpen: { backgroundColor: '#e7f7ee', color: '#0a7a35' },
  badgeClosed: { backgroundColor: '#f1f1f1', color: '#666' },

  meta: { fontSize: 12, color: '#666', fontWeight: '700' },
  message: { marginTop: 6, fontSize: 14, color: '#111', fontWeight: '700' },

  doneBtn: {
    marginTop: 10,
    backgroundColor: '#0a7a35',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneText: { color: 'white', fontWeight: '900' },

  empty: { paddingTop: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: '#111' },
  emptySub: { marginTop: 6, fontSize: 13, color: '#666', fontWeight: '700', textAlign: 'center' },
});
