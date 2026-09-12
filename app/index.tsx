import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../src/theme';

export default function Index() {
  const { isAuthenticated, profile, isLoading } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (profile?.role === 'admin') {
      router.replace('/(admin)');
    } else {
      router.replace('/(visitor)');
    }
  }, [isAuthenticated, profile, isLoading]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
