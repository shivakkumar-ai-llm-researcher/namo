import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../src/store';

export default function VisitorLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated]);

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

      {/* 2. Income Tab */}
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

      {/* Hide non-tab screens */}
      <Tabs.Screen name="analytics/index" options={{ href: null }} />
      <Tabs.Screen name="profile/index" options={{ href: null }} />
    </Tabs>
  );
}
