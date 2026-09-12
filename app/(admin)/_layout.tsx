import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/store';

export default function AdminLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, profile } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
    if (profile !== null && profile?.role !== 'admin') {
      // Authenticated but not admin — redirect to visitor area
      router.replace('/(visitor)');
    }
  }, [isLoading, isAuthenticated, profile]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarItemStyle: { paddingHorizontal: 0 },
      }}
    >
      {/* 1. Dashboard Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={20} color={color} />,
        }}
      />

      {/* 2. Income (Contributions) Tab */}
      <Tabs.Screen
        name="contributions/index"
        options={{
          title: 'Income',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-up" size={20} color={color} />,
        }}
      />

      {/* 3. Expense Tab */}
      <Tabs.Screen
        name="expenses/index"
        options={{
          title: 'Expense',
          tabBarIcon: ({ color, size }) => <Ionicons name="trending-down" size={20} color={color} />,
        }}
      />

      {/* 4. Saving Tab */}
      <Tabs.Screen
        name="savings/index"
        options={{
          title: 'Saving',
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={20} color={color} />,
        }}
      />

      {/* 5. Calendar Tab */}
      <Tabs.Screen
        name="calendar/index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={20} color={color} />,
        }}
      />

      {/* 6. Members Tab */}
      <Tabs.Screen
        name="members/index"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={20} color={color} />,
        }}
      />

      {/* Hide all sub-routes from bottom navigation */}
      <Tabs.Screen name="members/add" options={{ href: null }} />
      <Tabs.Screen name="members/[id]" options={{ href: null }} />
      <Tabs.Screen name="contributions/add" options={{ href: null }} />
      <Tabs.Screen name="contributions/[id]" options={{ href: null }} />
      <Tabs.Screen name="expenses/add" options={{ href: null }} />
      <Tabs.Screen name="expenses/[id]" options={{ href: null }} />
      <Tabs.Screen name="analytics/index" options={{ href: null }} />
      <Tabs.Screen name="more/index" options={{ href: null }} />
      <Tabs.Screen name="more/functions/index" options={{ href: null }} />
      <Tabs.Screen name="more/functions/add" options={{ href: null }} />
      <Tabs.Screen name="more/functions/[id]" options={{ href: null }} />
      <Tabs.Screen name="more/members/index" options={{ href: null }} />
      <Tabs.Screen name="more/members/add" options={{ href: null }} />
      <Tabs.Screen name="more/members/[id]" options={{ href: null }} />
      <Tabs.Screen name="more/savings/index" options={{ href: null }} />
      <Tabs.Screen name="more/reports/index" options={{ href: null }} />
      <Tabs.Screen name="more/audit-logs/index" options={{ href: null }} />
      <Tabs.Screen name="more/settings/index" options={{ href: null }} />
      <Tabs.Screen name="more/payment-settings/index" options={{ href: null }} />
    </Tabs>
  );
}
