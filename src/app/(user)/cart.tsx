// src/app/(user)/cart.tsx
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { fetchCartFromBackend, type CartItemDto } from "@/api/cart";
import { payWithStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

type PricingResult = {
  discount_percent: number;
  discount_amount: number;
  total_after_discount: number;
  used_loyalty_reward: boolean;
};

export default function CartScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<CartItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const total = useMemo(() => {
    return items.reduce((sum, i) => sum + i.products.price * i.quantity, 0);
  }, [items]);

  const load = useCallback(async () => {
    setError(null);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) throw new Error("Please sign in again.");

    const userId = userData.user.id;

    const cart = await fetchCartFromBackend(userId);
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

  const onCheckout = useCallback(async () => {
    if (!items.length) return;

    try {
      setPaying(true);

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        Alert.alert("Not signed in", "Please sign in again.");
        return;
      }
      const userId = userData.user.id;

      const subtotal = total;

      // ✅ loyalty pricing computed server-side
      const { data: pricingData, error: pricingErr } = await supabase.rpc(
        "compute_order_pricing",
        { subtotal }
      );

      if (pricingErr) {
        console.log("compute_order_pricing error", pricingErr);
        Alert.alert("Checkout failed", "Could not calculate loyalty discount.");
        return;
      }

      const p0 = Array.isArray(pricingData) ? pricingData[0] : pricingData;

      const pricing: PricingResult = {
        discount_percent: Number(p0?.discount_percent ?? 0),
        discount_amount: Number(p0?.discount_amount ?? 0),
        total_after_discount: Number(p0?.total_after_discount ?? subtotal),
        used_loyalty_reward: Boolean(p0?.used_loyalty_reward ?? false),
      };

      const totalInCents = Math.max(0, Math.round(pricing.total_after_discount * 100));

      // ✅ take payment
      const payResult = await payWithStripe(totalInCents);
      if (!payResult.ok) return; // cancelled or failed (stripe.ts shows alert)

      // ✅ create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          status: "Paid",
          subtotal,
          discount_percent: pricing.discount_percent,
          discount_amount: pricing.discount_amount,
          total_after_discount: pricing.total_after_discount,
          used_loyalty_reward: pricing.used_loyalty_reward,
        })
        .select()
        .single();

      if (orderErr || !order) {
        console.log("order insert error", orderErr);
        Alert.alert(
          "Payment succeeded",
          "Payment went through but order creation failed. Please contact support."
        );
        return;
      }

      // ✅ create order items from backend cart items
      const orderItems = items.map((ci) => ({
        order_id: order.id,
        product_id: ci.products.id, // ✅ correct
        quantity: ci.quantity,
        size: ci.size,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);

      if (itemsErr) {
        console.log("order_items insert error", itemsErr);
        Alert.alert(
          "Payment succeeded",
          "Order was created but adding items failed. Please contact support."
        );
        return;
      }

      Alert.alert(
        "Success",
        pricing.used_loyalty_reward
          ? "Order placed! 🎉 50% loyalty discount applied."
          : "Payment completed and order placed!"
      );

      await load();
      router.push("/(user)/orders");
    } catch (e: any) {
      Alert.alert("Checkout failed", e?.message ?? "Something went wrong");
    } finally {
      setPaying(false);
    }
  }, [items, load, total]);

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
              Loyalty discount applied at checkout
            </Text>

            <Pressable
              onPress={onCheckout}
              disabled={paying}
              style={{
                marginTop: 12,
                backgroundColor: paying ? "#9ca3af" : "#111827",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>
                {paying ? "Processing..." : "Checkout"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
