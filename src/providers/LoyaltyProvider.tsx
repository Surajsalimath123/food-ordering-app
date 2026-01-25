// src/providers/LoyaltyProvider.tsx
import { supabase } from "@/lib/supabase";
import React, { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type LoyaltyContextType = {
  paidCount: number;
  progress: number;        // 0..5 (display as x/5)
  isRewardReady: boolean;  // true when progress === 5 (next order gets 50% off)
  refresh: () => Promise<void>;
};

const LoyaltyContext = createContext<LoyaltyContextType>({
  paidCount: 0,
  progress: 0,
  isRewardReady: false,
  refresh: async () => {},
});

export default function LoyaltyProvider({ children }: PropsWithChildren) {
  const [paidCount, setPaidCount] = useState(0);

  const compute = useCallback(async () => {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      setPaidCount(0);
      return;
    }

    const userId = userData.user.id;

    // Count Paid orders only
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "Paid");

    if (error) {
      console.log("Loyalty count error:", error);
      return;
    }

    setPaidCount(Number(count ?? 0));
  }, []);

  // initial load
  useEffect(() => {
    compute();
  }, [compute]);

  // refresh on auth changes
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      compute();
    });
    return () => {
      sub?.subscription?.unsubscribe();
    };
  }, [compute]);

  const progress = useMemo(() => {
    // cycle of 6 orders:
    // 0..4 => show 0/5..4/5
    // 5 => show 5/5 (reward ready for NEXT order)
    // after 6th paid order => paidCount%6 becomes 0 again
    const cycle = paidCount % 6;      // 0..5
    return Math.min(5, cycle);        // keep 0..5 for UI
  }, [paidCount]);

  const isRewardReady = progress === 5;

  const value = useMemo<LoyaltyContextType>(() => {
    return {
      paidCount,
      progress,
      isRewardReady,
      refresh: compute,
    };
  }, [paidCount, progress, isRewardReady, compute]);

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}

export function useLoyalty() {
  return useContext(LoyaltyContext);
}
