import CartListItem from '@/components/CartListItem';
import { useCart } from '@/providers/CartProvider';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FOOTER_HEIGHT = 64;

export default function CartScreen() {
  const { items, total } = useCart();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Keep footer ABOVE the tab bar (and above the home indicator)
  const footerBottom = tabBarHeight + insets.bottom;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={[
          styles.listContent,
          {
            // Make sure list can scroll behind footer + tab bar safely
            paddingBottom: FOOTER_HEIGHT + footerBottom + 12,
          },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        }
      />

      {/* Sticky footer */}
      <View style={[styles.footer, { bottom: footerBottom }]}>
        <Text style={styles.totalText}>Total</Text>
        <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },

  listContent: { padding: 10, gap: 10 },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FOOTER_HEIGHT,
    backgroundColor: '#FAFAFA',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },

  totalText: { fontSize: 16, color: '#444', fontWeight: '600' },
  totalAmount: { fontSize: 22, fontWeight: '900', color: '#000' },
});
