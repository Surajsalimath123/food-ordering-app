import RemoteImage from '@/components/RemoteImage';
import Colors from '@/constants/Colors';
import type { OrderItem } from '@/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  item: OrderItem;
};

export default function OrderItemListItem({ item }: Props) {
  const product = item.products;

  return (
    <View style={styles.container}>
      <RemoteImage
        path={product.image}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.subtitleContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.subtitle}>Size: {item.size}</Text>
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
    width: 50,
    height: 50,          // ✅ RemoteImage needs explicit height
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    overflow: 'hidden',
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
  subtitle: {
    color: 'gray',
  },
  price: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  quantity: {
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
});
