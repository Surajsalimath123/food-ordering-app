import type { Product } from '@/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import RemoteImage from './RemoteImage';

type Props = {
  product: Product;
  onPress?: () => void; // ✅ optional (fixes TS error too)
};

export default function ProductListItem({ product, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <RemoteImage path={product.image} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, // ✅ KEY: allows 2 columns
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  image: {
    width: '100%',
    aspectRatio: 1, // ✅ square so it won’t become huge
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
  },
  info: {
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '800',
    color: '#1976d2',
  },
});
