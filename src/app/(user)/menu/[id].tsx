import { Ionicons } from '@expo/vector-icons';
import {
  Link,
  Stack,
  router,
  useLocalSearchParams,
  useSegments,
} from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import products from '@/assets/data/products';
import Colors from '@/constants/Colors';
import { useCart } from '@/providers/CartProvider';
import type { PizzaSize } from '@/types';

const sizes: PizzaSize[] = ['S', 'M', 'L', 'XL'];

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, totalItems } = useCart();
  const insets = useSafeAreaInsets();

  // Detect which group we are in: "(user)" or "(admin)"
  const segments = useSegments();
  const group = (segments?.[0] ?? '(user)') as string;

  const product = useMemo(
    () => products.find((p) => p.id === Number(id)),
    [id]
  );

  const [selectedSize, setSelectedSize] = useState<PizzaSize>('M');

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const cartPath = `/${group}/cart`;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => (
            <Link href={cartPath as any} asChild>
              <Pressable style={{ paddingRight: 10 }}>
                <View>
                  <Ionicons
                    name="cart-outline"
                    size={24}
                    color={Colors.light.tint}
                  />
                  {totalItems > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{totalItems}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </Link>
          ),
        }}
      />

      <Image
        source={{
          uri:
            product.image ??
            'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png',
        }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.title}>{product.name}</Text>

      <Text style={styles.subtitle}>Select size</Text>
      <View style={styles.sizes}>
        {sizes.map((size) => {
          const isSelected = size === selectedSize;
          return (
            <Pressable
              key={size}
              onPress={() => setSelectedSize(size)}
              style={[styles.size, isSelected && styles.sizeSelected]}
            >
              <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                {size}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.price}>Price: ${product.price.toFixed(2)}</Text>

      <Pressable
        style={[styles.button, { marginBottom: insets.bottom + 10 }]}
        onPress={() => {
          addItem(product, selectedSize);
          router.push(cartPath as any);
        }}
      >
        <Text style={styles.buttonText}>Add to cart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  container: { flex: 1, backgroundColor: 'white', padding: 10 },

  image: { width: '100%', aspectRatio: 1, alignSelf: 'center' },

  title: { fontWeight: '700', fontSize: 20, marginTop: 8 },

  subtitle: { marginVertical: 10, fontWeight: '600' },

  sizes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  size: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },

  sizeSelected: { backgroundColor: 'gainsboro' },

  sizeText: { fontSize: 18, fontWeight: '600', color: 'gray' },

  sizeTextSelected: { color: 'black' },

  price: { fontSize: 18, fontWeight: '800', marginTop: 'auto' },

  button: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    alignItems: 'center',
    borderRadius: 999,
    marginTop: 10,
  },

  buttonText: { fontSize: 16, fontWeight: '700', color: 'white' },

  badge: {
    position: 'absolute',
    right: -8,
    top: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  badgeText: { color: 'white', fontSize: 11, fontWeight: '800' },
});
