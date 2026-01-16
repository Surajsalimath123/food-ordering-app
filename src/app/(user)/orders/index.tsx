import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useMyOrders } from '@/api/orders/user';
import OrderListItem from '@/components/OrderListItem';

export default function UserOrdersScreen() {
  const { data: orders, isLoading, error, refetch } = useMyOrders();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    console.log('❌ Failed to fetch my orders:', error);
    return (
      <View style={styles.center}>
        <Text>Failed to load orders</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No orders yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={`/(user)/orders/${item.id}` as any} asChild>
            <Pressable>
              <OrderListItem order={item} />
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  list: { padding: 10, gap: 10 },

  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1677ff',
  },
  retryText: { color: 'white', fontWeight: '700' },
});
