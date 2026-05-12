import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { ENV } from './environment';
import type { Database } from '../types/database';

// Create Supabase client with AsyncStorage for persistence
export const supabase = createClient<Database>(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper function to get current auth header
export const getAuthHeader = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.access_token) {
    return null;
  }
  return `Bearer ${data.session.access_token}`;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user || null;
};
