import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import ProductListItem from '@/components/ProductListItem';
import { useProducts } from '@/providers/ProductsProvider';

export default function UserMenuScreen() {
  const { products, loading, errorMsg, reload } = useProducts();
  const tabBarHeight = useBottomTabBarHeight();

  const contentPaddingBottom = useMemo(() => tabBarHeight + 24, [tabBarHeight]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Could not load products</Text>
        <Text style={styles.sub}>{errorMsg}</Text>
        <Text style={styles.retry} onPress={reload}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom }]}
      renderItem={({ item }) => (
        <ProductListItem
          product={item}
          onPress={() => router.push(`/(user)/menu/${item.id}` as any)}
        />
      )}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.title}>No products yet</Text>
          <Text style={styles.sub}>Ask admin to create products.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#111' },
  sub: { marginTop: 6, color: '#666', textAlign: 'center' },
  retry: { marginTop: 12, color: '#1976d2', fontWeight: '800' },
});
