import type { CartItem } from '@/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import RemoteImage from './RemoteImage';

type Props = {
  cartItem: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
};

export default function CartListItem({ cartItem, onIncrease, onDecrease }: Props) {
  const { product, quantity, size } = cartItem;

  return (
    <View style={styles.container}>
      <RemoteImage path={product.image} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>Size: {size}</Text>
        </View>
      </View>

      <View style={styles.qtyWrap}>
        <Pressable
          onPress={onDecrease}
          style={({ pressed }) => [styles.qtyButton, pressed && styles.pressed]}
          hitSlop={10}
        >
          <Text style={styles.qtySymbol}>−</Text>
        </Pressable>

        <Text style={styles.qtyText}>{quantity}</Text>

        <Pressable
          onPress={onIncrease}
          style={({ pressed }) => [styles.qtyButton, pressed && styles.pressed]}
          hitSlop={10}
        >
          <Text style={styles.qtySymbol}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  info: { flex: 1, paddingRight: 10 },
  title: { fontSize: 16, fontWeight: '800' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  price: { color: '#1976d2', fontWeight: '900' },
  dot: { marginHorizontal: 8, color: '#999' },
  meta: { color: '#777', fontWeight: '700' },

  qtyWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
  pressed: { opacity: 0.7 },
  qtySymbol: { fontSize: 20, fontWeight: '900', color: '#222' },
  qtyText: { width: 22, textAlign: 'center', fontWeight: '900', fontSize: 16 },
});
