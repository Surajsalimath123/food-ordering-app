import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/providers/CartProvider';
import type { PizzaSize, Product } from '@/types';

const sizes: PizzaSize[] = ['S', 'M', 'L', 'XL'];

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<PizzaSize>('M');

  const productId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) setProduct(null);
      else setProduct(data as Product);

      setLoading(false);
    };

    if (!Number.isNaN(productId)) load();
    else setLoading(false);
  }, [productId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: '800' }}>Product not found</Text>
        <Text style={{ marginTop: 10, color: '#1976d2' }} onPress={() => router.back()}>
          Go back
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            product.image ||
            'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png',
        }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>

      <View style={styles.sizes}>
        {sizes.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSelectedSize(s)}
            style={[
              styles.sizePill,
              selectedSize === s && { backgroundColor: Colors.light.tint },
            ]}
          >
            <Text style={[styles.sizeText, selectedSize === s && { color: 'white' }]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.addBtn}
        onPress={() => {
          addItem(product, selectedSize);
          router.push('/(user)/cart');
        }}
      >
        <Text style={styles.addBtnText}>Add to cart</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#f3f3f3', borderRadius: 16 },
  name: { marginTop: 14, fontSize: 24, fontWeight: '900', color: '#111' },
  price: { marginTop: 6, fontSize: 18, fontWeight: '900', color: Colors.light.tint },

  sizes: { flexDirection: 'row', gap: 10, marginTop: 18, flexWrap: 'wrap' },
  sizePill: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  sizeText: { fontWeight: '800', color: Colors.light.tint },

  addBtn: {
    marginTop: 'auto',
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  addBtnText: { color: 'white', fontWeight: '900', fontSize: 16 },
});
