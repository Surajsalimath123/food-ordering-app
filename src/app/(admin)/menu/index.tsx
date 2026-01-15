import ProductListItem from '@/components/ProductListItem';
import { useProducts } from '@/providers/ProductsProvider';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

export default function AdminMenuScreen() {
  const { products } = useProducts();

  return (
    <View style={styles.screen} pointerEvents="box-none">
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Link href={`/(admin)/menu/${item.id}`} asChild>
            <Pressable>
              <ProductListItem product={item as any} />
            </Pressable>
          </Link>
        )}
      />

      {/* FAB */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Link href="/(admin)/menu/create" asChild>
          <Pressable style={styles.fab} hitSlop={12}>
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  listContent: { gap: 10, padding: 10, paddingBottom: 30 },
  row: { gap: 10 },

  fabWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 18,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1677ff',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: 'white', fontSize: 30, fontWeight: '800', marginTop: -2 },
});
