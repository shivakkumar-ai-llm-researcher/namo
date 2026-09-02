import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.');
}

// SecureStore adapter for Supabase session persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: import('../types').Profile;
        Insert: Omit<import('../types').Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<import('../types').Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      members: {
        Row: import('../types').Member;
        Insert: Omit<import('../types').Member, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<import('../types').Member, 'id' | 'created_at' | 'updated_at'>>;
      };
      functions: {
        Row: import('../types').CommunityFunction;
        Insert: Omit<import('../types').CommunityFunction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<import('../types').CommunityFunction, 'id' | 'created_at' | 'updated_at'>>;
      };
      contributions: {
        Row: import('../types').Contribution;
        Insert: Omit<import('../types').Contribution, 'id' | 'created_at' | 'updated_at' | 'member' | 'function'>;
        Update: Partial<Omit<import('../types').Contribution, 'id' | 'created_at' | 'updated_at' | 'member' | 'function'>>;
      };
      expenses: {
        Row: import('../types').Expense;
        Insert: Omit<import('../types').Expense, 'id' | 'created_at' | 'updated_at' | 'function'>;
        Update: Partial<Omit<import('../types').Expense, 'id' | 'created_at' | 'updated_at' | 'function'>>;
      };
      audit_logs: {
        Row: import('../types').AuditLog;
        Insert: Omit<import('../types').AuditLog, 'id' | 'created_at' | 'profile'>;
        Update: never;
      };
    };
  };
};
