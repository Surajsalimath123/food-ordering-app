// src/app/(admin)/menu/index.tsx
import { useProductList } from '@/api/products';
import ProductListItem from '@/components/ProductListItem';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminMenuScreen() {
  const { data: products, isLoading, error, refetch } = useProductList();
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        data={products ?? []}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottom + 120 }]}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <ProductListItem
            product={item}
            onPress={() => router.push(`/(admin)/menu/${item.id}` as any)}
          />
        )}
        ListEmptyComponent={<View style={{ height: 30 }} />}
      />

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/(admin)/menu/create' as any)}
        style={({ pressed }) => [
          styles.fab,
          { bottom: bottom + 18 },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },

  listContent: {
    padding: 12,
    gap: 12, // ✅ space between rows (iOS ok)
  },

  row: {
    gap: 12, // ✅ space between columns
  },

  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
