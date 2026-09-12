import '../src/i18n';
import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../src/theme';
import { useAuthStore } from '../src/store';
import { authService } from '../src/services';
import { LoadingScreen, DivineSplashScreen } from '../src/components/ui';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

// Prevent native splash screen from auto hiding until JS runs
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { setUser, setProfile, setLoading, isLoading } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide native OS splash screen immediately once React tree mounts
    SplashScreen.hideAsync().catch(() => {});

    // Initialize auth state
    authService.getSession().then(async (session) => {
      if (session?.user) {
        setUser(session.user);
        try {
          const profile = await authService.getProfile(session.user.id, session.user.email);
          setProfile(profile);
        } catch (e) {
          console.error('Failed to load profile:', e);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        try {
          const profile = await authService.getProfile(session.user.id, session.user.email);
          setProfile(profile);
        } catch (e) {
          console.error('Failed to load profile:', e);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style={showSplash ? 'light' : (isDark ? 'light' : 'dark')} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(visitor)" />
      </Stack>

      {/* Divine Balaji Animated Splash Screen */}
      {showSplash && (
        <DivineSplashScreen
          minDuration={2800}
          onFinish={() => setShowSplash(false)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

