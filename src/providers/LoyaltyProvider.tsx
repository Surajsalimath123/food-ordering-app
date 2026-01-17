import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

type LoyaltyState = {
  cycleCompletedCount: number; // 0..5
  rewardAvailable: boolean; // true => next order gets 50% off
  loading: boolean;
  refresh: () => Promise<void>;
};

const LoyaltyContext = createContext<LoyaltyState>({
  cycleCompletedCount: 0,
  rewardAvailable: false,
  loading: true,
  refresh: async () => {},
});

export default function LoyaltyProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [cycleCompletedCount, setCycleCompletedCount] = useState(0);
  const [rewardAvailable, setRewardAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!userId) {
      setCycleCompletedCount(0);
      setRewardAvailable(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Ensure a row exists (safe even if already exists)
    await supabase.from('loyalty_status').upsert({ user_id: userId });

    const { data, error } = await supabase
      .from('loyalty_status')
      .select('cycle_completed_count, reward_available')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('loyalty refresh error', error);
      setLoading(false);
      return;
    }

    setCycleCompletedCount(data?.cycle_completed_count ?? 0);
    setRewardAvailable(!!data?.reward_available);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value = useMemo(
    () => ({ cycleCompletedCount, rewardAvailable, loading, refresh }),
    [cycleCompletedCount, rewardAvailable, loading]
  );

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}

export const useLoyalty = () => useContext(LoyaltyContext);
