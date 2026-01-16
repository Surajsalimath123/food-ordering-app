// src/lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import type { Database } from '@/database.types';

const supabaseUrl = 'https://lsxqzpaanzyuqngzqgke.supabase.co';
const supabaseAnonKey = 'sb_publishable_-PBD2hMgbqE_scRWL7yvGw_89yucMad';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
