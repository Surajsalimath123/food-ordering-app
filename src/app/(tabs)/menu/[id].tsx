import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import products from '@/assets/data/products';
import Button from '@/components/Button';
import Colors from '@/constants/Colors';

type PizzaSize = 'S' | 'M' | 'L' | 'XL';
const sizes: PizzaSize[] = ['S', 'M', 'L', 'XL'];

const defaultPizzaImage =
  'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('M');

  const product = useMemo(
    () => products.find((p) => p.id === Number(id)),
    [id]
  );

  const addToCart = () => {
    if (!product) return;
    console.log('Add to cart:', { productId: product.id, size: selectedSize });
  };

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Set header title to product name */}
      <Stack.Screen options={{ title: product.name }} />

      <Image
        source={{ uri: product.image || defaultPizzaImage }}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.subtitle}>Select size</Text>

      <View style={styles.sizes}>
        {sizes.map((size) => {
          const isSelected = size === selectedSize;
          return (
            <Pressable
              key={size}
              onPress={() => setSelectedSize(size)}
              style={[
                styles.size,
                { backgroundColor: isSelected ? 'gainsboro' : 'white' },
              ]}
            >
              <Text
                style={[
                  styles.sizeText,
                  { color: isSelected ? 'black' : 'gray' },
                ]}
              >
                {size}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.price}>Price: ${product.price.toFixed(2)}</Text>

      <Button text="Add to cart" onPress={addToCart} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    backgroundColor: 'white',
    padding: 10,
    flex: 1,
  },

  image: {
    width: '100%',
    aspectRatio: 1,
    alignSelf: 'center',
  },

  subtitle: {
    marginVertical: 10,
    fontWeight: '600',
  },

  sizes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  size: {
    width: 50,
    aspectRatio: 1,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sizeText: {
    fontSize: 20,
    fontWeight: '500',
  },

  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 'auto',
    color: Colors.light.tint,
  },
});
