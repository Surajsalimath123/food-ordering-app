// src/app/(user)/cart.tsx
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { fetchCartFromBackend, type CartItemDto } from "@/api/cart";

// ✅ IMPORTANT: use the SAME userId you use in your curl /chat payload
// If you have Supabase auth in the app, we can replace this with session.user.id later.
const DEMO_USER_ID = "1cbf83ae-8d7e-4503-a1c7-f7f3a7d1ecaa";

export default function CartScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<CartItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => {
    return items.reduce((sum, i) => sum + i.products.price * i.quantity, 0);
  }, [items]);

  const load = useCallback(async () => {
    setError(null);
    const cart = await fetchCartFromBackend(DEMO_USER_ID);
    setItems(cart.items ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      (async () => {
        try {
          if (!mounted) return;
          setLoading(true);
          await load();
        } catch (e: any) {
          setError(e?.message ?? "Failed to load cart");
        } finally {
          if (mounted) setLoading(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Failed to refresh cart");
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
        Cart
      </Text>

      <Text style={{ opacity: 0.7, marginBottom: 12 }}>
        {items.length} items
      </Text>

      {error ? (
        <View
          style={{
            padding: 12,
            backgroundColor: "#fee2e2",
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#991b1b" }}>{error}</Text>
        </View>
      ) : null}

      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            Your cart is empty
          </Text>
          <Text style={{ opacity: 0.7, marginTop: 6, textAlign: "center" }}>
            Add items from the Menu or AI Assistant and they will appear here.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700" }}>
                  {item.products.name}
                </Text>

                <Text style={{ opacity: 0.75, marginTop: 4 }}>
                  Size: {item.size ?? "-"} • Qty: {item.quantity}
                </Text>

                <Text style={{ marginTop: 6, fontWeight: "700" }}>
                  ${(item.products.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            )}
          />

          <View
            style={{
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
              marginTop: 8,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                ${total.toFixed(2)}
              </Text>
            </View>
            <Text style={{ opacity: 0.6, marginTop: 4 }}>
              Taxes calculated at checkout
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
