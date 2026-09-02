import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { Profile, UserRole } from '../types';

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  reset: () => void;
  get role(): UserRole | null;
  get isAdmin(): boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  reset: () => set({ user: null, profile: null, isAuthenticated: false, error: null }),
  get role() { return get().profile?.role ?? null; },
  get isAdmin() { return get().profile?.role === 'admin'; },
}));
