// src/app/(admin)/orders/[id].tsx
import { useOrder } from '@/api/orders';
import { useUpdateOrderStatus } from '@/api/orders/mutations';
import type { OrderStatus } from '@/types';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const statuses: OrderStatus[] = ['New', 'Cooking', 'Delivering', 'Delivered'];

export default function AdminOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading, error, refetch } = useOrder(orderId);
  const { mutateAsync: updateStatus, isPending } = useUpdateOrderStatus();

  const onChangeStatus = async (status: OrderStatus) => {
    try {
      await updateStatus({ id: orderId, status });

      Alert.alert('Status updated ✅', `Order marked as "${status}"`, [
        {
          text: 'OK',
          onPress: () => {
            // go back to list after success
            router.back();
          },
        },
      ]);
    } catch (e: any) {
      console.log('❌ Update status failed:', e);
      Alert.alert(
        'Update failed',
        e?.message ?? 'Could not update order status (check RLS policies).'
      );

      // keep UI in sync (if something changed server-side)
      refetch();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.center}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: `Order #${order.id}` }} />

      <View style={styles.headerCard}>
        <Text style={styles.title}>Order #{order.id}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Status</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{order.status}</Text>
          </View>
        </View>

        <Text style={styles.sub}>Created: {order.created_at}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Update Status</Text>

        <View style={styles.statusGrid}>
          {statuses.map((s) => {
            const active = order.status === s;
            return (
              <Pressable
                key={s}
                onPress={() => onChangeStatus(s)}
                disabled={isPending}
                style={[
                  styles.statusBtn,
                  active && styles.statusBtnActive,
                  isPending && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.statusText, active && styles.statusTextActive]}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isPending && (
          <Text style={styles.hint}>Updating…</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: 'white' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#eee',
  },

  title: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  sub: { color: '#555', marginTop: 8 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaLabel: { fontWeight: '700', color: '#333' },

  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  statusPillText: { color: '#1976d2', fontWeight: '800' },

  card: {
    marginTop: 18,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
  },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },

  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statusBtn: {
    minWidth: '47%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976d2',
    alignItems: 'center',
  },

  statusBtnActive: {
    backgroundColor: '#1976d2',
  },

  statusText: { color: '#1976d2', fontWeight: '800' },
  statusTextActive: { color: 'white' },

  hint: { marginTop: 10, color: '#666', fontWeight: '600' },
});
