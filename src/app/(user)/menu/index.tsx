import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import ProductListItem from '@/components/ProductListItem';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function UserMenuScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tabBarHeight = useBottomTabBarHeight();

  const load = async () => {
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setProducts([]);
    } else {
      setProducts((data ?? []) as Product[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();

    // ✅ Live updates (optional but nice)
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        <Text style={styles.retry} onPress={load}>
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
  list: { padding: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: '#111' },
  sub: { marginTop: 6, color: '#666', textAlign: 'center' },
  retry: { marginTop: 12, color: '#1976d2', fontWeight: '800' },
});
