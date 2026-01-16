import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { Session } from '@supabase/supabase-js';
import React, { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  isLoading: true,
});

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (error) {
    console.log('fetchProfile error:', error.message);
    return null;
  }
  return data as Profile;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session ?? null;

      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user?.id) {
        const p = await fetchProfile(currentSession.user.id);
        if (mounted) setProfile(p);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);

      if (newSession?.user?.id) {
        const p = await fetchProfile(newSession.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
