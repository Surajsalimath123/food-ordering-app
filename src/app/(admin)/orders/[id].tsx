import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import orders from '@/assets/data/orders';
import OrderItemListItem from '@/components/OrderItemListItem';
import OrderListItem from '@/components/OrderListItem';
import Colors from '@/constants/Colors';
import { OrderStatusList } from '@/types';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = orders.find((o) => o.id.toString() === id);

  if (!order) {
    return <Text style={{ padding: 10 }}>Order not found!</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Order #${order.id}`, headerShown: true }} />

      <OrderListItem order={order} />

      {/* Status selector */}
      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.statusContainer}>
        {OrderStatusList.map((status) => {
          const isSelected = order.status === status;

          return (
            <Pressable
              key={status}
              onPress={() => console.warn('Update status to:', status)}
              style={[
                styles.statusButton,
                isSelected && styles.statusButtonActive,
              ]}
            >
              <Text style={[styles.statusText, isSelected && styles.statusTextActive]}>
                {status}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={order.order_items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    gap: 10,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusButton: {
    borderColor: Colors.light.tint,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 6,
  },
  statusButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  statusText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  statusTextActive: {
    color: 'white',
  },
});
