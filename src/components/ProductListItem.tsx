import Colors from '@/constants/Colors';
import type { Product } from '@/types';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  product: Product;
  onPress?: () => void;
};

export default function ProductListItem({ product, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && onPress ? { opacity: 0.85 } : null,
      ]}
    >
      <Image
        source={{
          uri:
            product.image ||
            'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png',
        }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#f3f3f3',
  },
  info: {
    marginTop: 10,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.tint,
  },
});
