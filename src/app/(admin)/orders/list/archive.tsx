import { useOrderList } from '@/api/orders';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminOrdersArchiveScreen() {
  const { top } = useSafeAreaInsets(); // ✅ KEY FIX (dynamic island safe)
  const { data, isLoading, error, refetch } = useOrderList();

  const orders = useMemo(() => {
    const all = data ?? [];
    return all.filter((o) => o.status === 'Delivered');
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Could not load orders</Text>
        <Text style={styles.emptySub}>Check your policies / network.</Text>

        <Pressable
          onPress={() => refetch()} // ✅ wrap to avoid TS error
          style={[styles.pill, styles.pillActive]}
        >
          <Text style={[styles.pillText, styles.pillTextActive]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: top + 12 }]}>
      {/* Segmented Control */}
      <View style={styles.segmentWrap}>
        <Pressable
          onPress={() => router.replace('/(admin)/orders/list' as any)}
          style={[styles.pill, styles.pillInactive]}
        >
          <Text style={[styles.pillText, styles.pillTextInactive]}>Active</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/(admin)/orders/list/archive' as any)}
          style={[styles.pill, styles.pillActive]}
        >
          <Text style={[styles.pillText, styles.pillTextActive]}>Archive</Text>
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={false}
        onRefresh={() => refetch()} // ✅ wrap
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No archived orders</Text>
            <Text style={styles.emptySub}>Delivered orders will show here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(admin)/orders/${item.id}` as any)}
            style={styles.row}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle}>Order #{item.id}</Text>
              <Text style={styles.rowSub}>{formatDate(item.created_at)}</Text>
            </View>

            <View style={[styles.badge, styles.badgeDelivered]}>
              <Text style={[styles.badgeText, styles.badgeTextDelivered]}>
                {item.status}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 14, backgroundColor: 'white' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },

  segmentWrap: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  pillActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  pillInactive: { backgroundColor: 'white', borderColor: '#1976d2' },

  pillText: { fontWeight: '800', fontSize: 16 },
  pillTextActive: { color: 'white' },
  pillTextInactive: { color: '#1976d2' },

  list: { paddingBottom: 16, gap: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },

  rowLeft: { flex: 1, paddingRight: 10 },
  rowTitle: { fontSize: 16, fontWeight: '800' },
  rowSub: { color: '#666', marginTop: 4, fontSize: 13 },

  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  badgeDelivered: { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },

  badgeText: { fontWeight: '800' },
  badgeTextDelivered: { color: '#2e7d32' },

  empty: { paddingTop: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySub: { marginTop: 6, color: '#666', textAlign: 'center' },
});
