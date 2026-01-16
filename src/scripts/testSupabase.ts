import { supabase } from '@/lib/supabase';

export async function testSupabase() {
  const { data, error } = await supabase.auth.getSession();
  console.log('session:', data?.session);
  console.log('error:', error);
}
