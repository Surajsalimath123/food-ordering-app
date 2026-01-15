import Colors from '@/constants/Colors';
import type { OrderItem } from '@/types';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// fallback image (same one used in many tutorials)
const defaultPizzaImage =
  'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png';

type Props = {
  item: OrderItem;
};

export default function OrderItemListItem({ item }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: item.products.image ?? defaultPizzaImage }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.products.name}</Text>

        <View style={styles.subtitleContainer}>
          <Text style={styles.price}>${item.products.price.toFixed(2)}</Text>
          <Text>Size: {item.size}</Text>
        </View>
      </View>

      <Text style={styles.quantity}>{item.quantity}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  image: {
    width: 60,
    height: 60,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  price: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  quantity: {
    fontWeight: '700',
    fontSize: 16,
  },
});
