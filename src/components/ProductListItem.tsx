import Colors from '@/constants/Colors';
import type { Product } from '@/types/Product';
import { Link, useSegments } from 'expo-router';
import { Image, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  product: Product;
};

export default function ProductListItem({ product }: Props) {
  const segments = useSegments(); // e.g. ['(user)', 'menu'] OR ['(admin)', 'menu']
  const group = segments[0] ?? '(user)'; // fallback just in case

  return (
    <Link
  href={{ pathname: `/${group}/menu/${product.id}` } as any}
  asChild
>
  <Pressable style={styles.container}>
    <Image
      source={{
        uri:
          product.image ||
          'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png',
      }}
      style={styles.image}
      resizeMode="contain"
    />
    <Text style={styles.title}>{product.name}</Text>
    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
  </Pressable>
</Link>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  title: {
    fontWeight: '600',
    marginVertical: 6,
  },
  price: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
});
