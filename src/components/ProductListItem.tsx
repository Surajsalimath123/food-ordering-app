import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProducts } from '@/providers/ProductsProvider';
import type { Product } from '@/types';

type Props = {
  product: Product;
  onPress?: () => void;
};

export default function ProductListItem({ product, onPress }: Props) {
  const { bestSellerIds } = useProducts();
  const isBestSeller = bestSellerIds.includes(String(product.id));

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.imageWrap}>
        {!!isBestSeller && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Best Seller ⭐</Text>
          </View>
        )} 

        <Image source={{ uri: product.image }} style={styles.image} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  imageWrap: {
    position: 'relative',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    zIndex: 10,
    top: 8,
    left: 8,
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#1d4ed8',
  },
});
