import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CartListItem from '@/components/CartListItem';
import LoyaltyProgress from '@/components/LoyaltyProgress';
import Colors from '@/constants/Colors';
import { useCart } from '@/providers/CartProvider';
import { useLoyalty } from '@/providers/LoyaltyProvider';

export default function CartScreen() {
  const { items, total, updateQuantity, checkout } = useCart();
  const { rewardAvailable, refresh } = useLoyalty();

  const [placing, setPlacing] = useState(false);

  const canPlace = items.length > 0 && !placing;

  const estimatedAfterDiscount = useMemo(() => {
    if (!rewardAvailable) return total;
    // UI estimate only. Backend will compute final amount.
    return total * 0.5;
  }, [rewardAvailable, total]);

  const placeOrder = async () => {
    if (!items.length) return;

    try {
      setPlacing(true);

      const ok = await checkout(); // ✅ checkout inserts order as Paid
      if (ok) {
        // ✅ instantly refresh loyalty so progress bar fills right away
        await refresh();
      }
    } catch (e: any) {
      Alert.alert('Checkout failed', e?.message ?? 'Something went wrong');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
          <Text style={styles.headerSubtitle}>
            {items.length} item{items.length === 1 ? '' : 's'}
          </Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartListItem
              cartItem={item}
              onDecrease={() => updateQuantity(item.id, -1)}
              onIncrease={() => updateQuantity(item.id, +1)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            items.length === 0 && styles.listEmptyContent,
          ]}
          ListHeaderComponent={
            <View style={styles.loyaltyWrap}>
              <LoyaltyProgress />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySub}>
                Add items from the Menu and they will appear here.
              </Text>
            </View>
          }
        />

        <SafeAreaView style={styles.bottomSafe} edges={['bottom']}>
          <View style={styles.bottomBar}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>{rewardAvailable ? 'Estimated Total' : 'Total'}</Text>
              <Text style={styles.totalHint}>
                {rewardAvailable
                  ? '50% loyalty discount will apply on checkout'
                  : 'Taxes calculated at checkout'}
              </Text>
            </View>

            <View style={styles.rightArea}>
              <Text style={styles.totalValue}>${estimatedAfterDiscount.toFixed(2)}</Text>

              <Pressable
                onPress={placeOrder}
                disabled={!canPlace}
                style={({ pressed }) => [
                  styles.placeButton,
                  !canPlace && styles.placeButtonDisabled,
                  pressed && canPlace && styles.placeButtonPressed,
                ]}
              >
                <Text style={styles.placeButtonText}>
                  {placing ? 'Processing...' : 'Pay & Place order'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f2f2f2' },
  container: { flex: 1, backgroundColor: '#f2f2f2' },

  header: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111' },
  headerSubtitle: { marginTop: 4, fontSize: 13, color: '#666', fontWeight: '600' },

  loyaltyWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 },

  listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 160 },
  listEmptyContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 180 },

  empty: { alignItems: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6, color: '#111' },
  emptySub: { fontSize: 14, color: '#666', textAlign: 'center', fontWeight: '500' },

  bottomSafe: { backgroundColor: 'white' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e6e6e6',
  },

  totalLabel: { fontSize: 14, fontWeight: '700', color: '#333' },
  totalHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#888',
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },

  rightArea: { alignItems: 'flex-end', gap: 8 },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#111' },

  placeButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  placeButtonPressed: { opacity: 0.75 },
  placeButtonDisabled: { backgroundColor: '#cfcfcf' },
  placeButtonText: { color: 'white', fontWeight: '800' },
});
