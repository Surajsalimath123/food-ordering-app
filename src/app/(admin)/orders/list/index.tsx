import { useOrderList } from '@/api/orders';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminOrdersActiveScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useOrderList();

  // ✅ Only show pull-to-refresh spinner when user pulls
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const onPullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [refetch]);

  const orders = useMemo(() => {
    const all = data ?? [];
    return all.filter((o) => o.status !== 'Delivered');
  }, [data]);

  // ✅ Full screen loader only on first load
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

        <Pressable onPress={() => refetch()} style={[styles.pill, styles.pillActive]}>
          <Text style={[styles.pillText, styles.pillTextActive]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        {/* Segmented Control */}
        <View style={styles.segmentWrap}>
          <Pressable
            onPress={() => router.replace('/(admin)/orders/list' as any)}
            style={[styles.pill, styles.pillActive]}
          >
            <Text style={[styles.pillText, styles.pillTextActive]}>Active</Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace('/(admin)/orders/list/archive' as any)}
            style={[styles.pill, styles.pillInactive]}
          >
            <Text style={[styles.pillText, styles.pillTextInactive]}>Archive</Text>
          </Pressable>
        </View>

        {/* ✅ Non-blocking updating hint (no giant spinner) */}
        {isRefetching ? <Text style={styles.updating}>Updating…</Text> : null}

        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isPullRefreshing} onRefresh={onPullRefresh} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No active orders</Text>
              <Text style={styles.emptySub}>
                New/Cooking/Delivering orders show here.
              </Text>
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

              <View style={[styles.badge, badgeStyle(item.status).badge]}>
                <Text style={[styles.badgeText, badgeStyle(item.status).text]}>
                  {item.status}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

function badgeStyle(status: string) {
  switch (status) {
    case 'New':
      return {
        badge: { backgroundColor: '#e3f2fd', borderColor: '#bbdefb' },
        text: { color: '#1976d2' },
      };
    case 'Cooking':
      return {
        badge: { backgroundColor: '#fff8e1', borderColor: '#ffecb3' },
        text: { color: '#f57c00' },
      };
    case 'Delivering':
      return {
        badge: { backgroundColor: '#ede7f6', borderColor: '#d1c4e9' },
        text: { color: '#5e35b1' },
      };
    default:
      return {
        badge: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' },
        text: { color: '#333' },
      };
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'white' },
  screen: { flex: 1, padding: 14, backgroundColor: 'white' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },

  segmentWrap: { flexDirection: 'row', gap: 12, marginBottom: 8 },

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

  updating: {
    marginBottom: 10,
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },

  listContent: { paddingBottom: 16 },
  separator: { height: 12 },

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

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontWeight: '800' },

  empty: { paddingTop: 40, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySub: { marginTop: 6, color: '#666', textAlign: 'center' },
});
