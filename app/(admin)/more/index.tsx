import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store';
import { Card } from '../../../src/components/ui';

export default function AdminMoreMenuScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const { profile } = useAuthStore();

  const menuItems = [
    {
      title: t('navigation.functions', 'Functions'),
      subtitle: 'Manage Purattasi Sani Kiyamai & Gokulaashdami',
      icon: 'calendar-outline' as const,
      color: '#3B82F6',
      route: '/(admin)/more/functions',
    },
    {
      title: 'Bank & UPI QR Settings',
      subtitle: 'UPI scanner upload, account holder, IFSC & account #',
      icon: 'qr-code-outline' as const,
      color: '#D97706',
      route: '/(admin)/more/payment-settings',
    },
    {
      title: t('navigation.members', 'Community Members'),
      subtitle: 'Add, edit, and view member profiles',
      icon: 'people-outline' as const,
      color: '#10B981',
      route: '/(admin)/more/members',
    },
    {
      title: t('navigation.savings', 'Savings Accounting'),
      subtitle: 'Calculated savings & balance breakdown',
      icon: 'wallet-outline' as const,
      color: '#6366F1',
      route: '/(admin)/more/savings',
    },
    {
      title: t('navigation.reports', 'Financial Reports'),
      subtitle: 'Export statements in CSV format',
      icon: 'document-text-outline' as const,
      color: '#F59E0B',
      route: '/(admin)/more/reports',
    },
    {
      title: t('navigation.auditLogs', 'Audit Logs'),
      subtitle: 'Track financial changes & modifications',
      icon: 'shield-checkmark-outline' as const,
      color: '#EC4899',
      route: '/(admin)/more/audit-logs',
    },
    {
      title: t('navigation.settings', 'Settings'),
      subtitle: 'Language, theme, and profile options',
      icon: 'settings-outline' as const,
      color: '#64748B',
      route: '/(admin)/more/settings',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
          {t('navigation.more', 'Management & Settings')}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
          Administrator Controls
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 }}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Card variant="default" padding="md">
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: `${item.color}15`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                      {item.title}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
