import { Platform } from 'react-native';
import { supabase } from './supabase';
import { Profile, UserRole } from '../types';

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
          role: 'visitor',
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signOut warning:', error);
    } catch (e) {
      console.warn('Supabase signOut exception:', e);
    }

    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('sb-') || k.includes('supabase') || k.includes('auth'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('LocalStorage cleanup warning:', e);
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'namo://reset-password',
    });
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getProfile(userId: string, email?: string): Promise<Profile> {
    // Primary: Fetch from database
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error.code);
      }
      if (data) return data as Profile;
    } catch (e) {
      console.error('Profile query exception:', e);
    }

    // Profile not found — create with VISITOR role only. Never admin.
    const fallbackName = email ? email.split('@')[0] : 'User';

    try {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fallbackName,
          role: 'visitor', // ALWAYS visitor. Admin is granted only via Supabase dashboard.
        })
        .select()
        .single();

      if (!insertError && newProfile) return newProfile as Profile;
      // If insert fails due to conflict (race condition), try fetching again
      if (insertError?.code === '23505') {
        const { data: existing } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (existing) return existing as Profile;
      }
    } catch (e) {
      console.error('Profile auto-insert exception:', e);
    }

    // Last resort fallback — VISITOR ONLY
    return {
      id: userId,
      role: 'visitor',
      full_name: fallbackName,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async updateProfile(userId: string, updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  onAuthStateChange(callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
