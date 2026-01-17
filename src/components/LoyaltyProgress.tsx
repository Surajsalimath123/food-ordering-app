import { useLoyalty } from '@/providers/LoyaltyProvider';
import React from 'react';
import { Text, View } from 'react-native';

export default function LoyaltyProgress() {
  const { cycleCompletedCount, rewardAvailable, loading } = useLoyalty();

  const steps = 5;
  const filled = rewardAvailable ? 5 : Math.min(Math.max(cycleCompletedCount, 0), 5);

  if (loading) return null;

  return (
    <View style={{ padding: 12, backgroundColor: 'white', borderRadius: 14, gap: 8 }}>
      <Text style={{ fontWeight: '800', fontSize: 14, color: '#111' }}>
        {rewardAvailable
          ? '🎉 Reward ready: your next order gets 50% OFF'
          : `Loyalty progress: ${filled}/${steps} completed orders`}
      </Text>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: steps }).map((_, i) => {
          const active = i < filled;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                backgroundColor: active ? '#111' : '#e5e7eb',
              }}
            />
          );
        })}
      </View>

      <Text style={{ fontSize: 12, color: '#6b7280', fontWeight: '600' }}>
        Complete 5 orders → 6th order gets 50% off total.
      </Text>
    </View>
  );
}
