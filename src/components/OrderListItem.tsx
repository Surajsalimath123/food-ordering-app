import type { Order } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { router, useSegments } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

dayjs.extend(relativeTime);

type Props = {
  order: Order;
};

export default function OrderListItem({ order }: Props) {
  const segments = useSegments();
  const root = segments[0] === '(admin)' ? '(admin)' : '(user)';

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/${root}/orders/${order.id}` as any)}
    >
      <View>
        <Text style={styles.title}>Order #{order.id}</Text>
        <Text style={styles.time}>{dayjs(order.created_at).fromNow()}</Text>
      </View>

      <Text style={styles.status}>{order.status}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  time: {
    color: 'gray',
  },
  status: {
    fontWeight: '600',
  },
});
