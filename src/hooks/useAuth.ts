'use client';
import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services';
import type { Profile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo user in local storage
    if (typeof window !== 'undefined') {
      const demoStr = localStorage.getItem('namo_demo_user');
      if (demoStr) {
        try {
          const parsed = JSON.parse(demoStr);
          setUser({ id: parsed.id, email: parsed.email } as User);
          setProfile(parsed.profile);
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('namo_demo_user');
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        authService.getProfile(data.session.user.id, data.session.user.email).then(setProfile);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (typeof window !== 'undefined' && localStorage.getItem('namo_demo_user')) {
        return;
      }
      setUser(session?.user ?? null);
      if (session?.user) {
        const p = await authService.getProfile(session.user.id, session.user.email);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('namo_demo_user');
    }
    await authService.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return { user, profile, isLoading, isAdmin: profile?.role === 'admin', signOut };
}
