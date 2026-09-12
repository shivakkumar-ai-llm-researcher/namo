import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, ThemeMode } from '../../../../src/theme';
import { useAuthStore } from '../../../../src/store';
import { authService } from '../../../../src/services';
import { changeLanguage, SUPPORTED_LANGUAGES } from '../../../../src/i18n';
import { Card, Button, ConfirmDialog } from '../../../../src/components/ui';

export default function AdminSettingsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, mode, setThemeMode } = useTheme();
  const { profile, user, reset } = useAuthStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.signOut();
      reset();
      router.replace('/(auth)/login');
    } catch (e) {
      console.warn('Logout error:', e);
      reset();
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleLanguageChange = async (code: string) => {
    try {
      await changeLanguage(code);
    } catch (e) {
      console.warn('Language switch error:', e);
    }
  };

  const themeOptions: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { mode: 'light', label: 'Light', icon: 'sunny-outline' },
    { mode: 'dark', label: 'Dark', icon: 'moon-outline' },
    { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
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
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
          {t('navigation.settings', 'Settings')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Profile Card */}
        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                {profile?.full_name || 'Admin'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                {user?.email || 'admin@community.org'}
              </Text>
              <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginTop: 2 }}>
                ROLE: {profile?.role.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Language Selection */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
            Language / மொழி
          </Text>
          <View style={{ gap: spacing.sm }}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primaryLight : colors.surfaceVariant,
                    borderWidth: isSelected ? 1.5 : 0,
                    borderColor: colors.primary,
                  }}
                >
                  <View>
                    <Text style={{ color: isSelected ? colors.primary : colors.textPrimary, fontWeight: fontWeight.bold, fontSize: fontSize.md }}>
                      {lang.nativeLabel}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
                      {lang.label}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Theme Selection */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
            Theme Appearance
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {themeOptions.map((opt) => {
              const isSelected = mode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  onPress={() => setThemeMode(opt.mode)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primaryLight : colors.surfaceVariant,
                    borderWidth: isSelected ? 1.5 : 0,
                    borderColor: colors.primary,
                    alignItems: 'center',
                    gap: spacing.xs,
                  }}
                >
                  <Ionicons name={opt.icon} size={22} color={isSelected ? colors.primary : colors.textSecondary} />
                  <Text style={{ color: isSelected ? colors.primary : colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* App Info */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.sm }}>
            About
          </Text>
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>App Version</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>1.0.0 (Production)</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Built With</Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>React Native • Expo SDK 57 • Supabase</Text>
            </View>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title={t('auth.logout', 'Sign Out')}
          onPress={() => setShowLogoutConfirm(true)}
          variant="danger"
          size="lg"
          leftIcon={<Ionicons name="log-out-outline" size={20} color="white" />}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to log out of your administrator session?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </View>
  );
}
