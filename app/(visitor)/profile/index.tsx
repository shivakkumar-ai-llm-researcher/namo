import React, { useState, useEffect } from 'react';
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
import { useTheme, ThemeMode } from '../../../src/theme';
import { useAuthStore, useContributionStore } from '../../../src/store';
import { authService, contributionService } from '../../../src/services';
import { changeLanguage, SUPPORTED_LANGUAGES } from '../../../src/i18n';
import { Card, Button, Badge, ConfirmDialog } from '../../../src/components/ui';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../../src/utils/formatters';
import { Contribution } from '../../../src/types';

export default function VisitorProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, mode, setThemeMode } = useTheme();
  const { profile, user, reset } = useAuthStore();

  const [myContributions, setMyContributions] = useState<Contribution[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    contributionService.getAll({ limit: 100 }).then((res) => {
      const myName = profile?.full_name?.toLowerCase() || '';
      const matched = res.data.filter((c) =>
        c.member?.full_name.toLowerCase().includes(myName)
      );
      setMyContributions(matched);
    }).catch((e) => console.warn('Load my contributions error:', e));
  }, [profile?.full_name]);

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

  const totalMyDonations = myContributions.reduce((sum, c) => sum + Number(c.amount), 0);

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
          {t('navigation.profile', 'My Profile')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Profile Card */}
        <Card variant="default">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 24, fontWeight: fontWeight.bold }}>
                {profile?.full_name?.charAt(0).toUpperCase() || 'V'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                {profile?.full_name || 'Community Member'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
                {user?.email || 'visitor@community.org'}
              </Text>
              <Badge label="COMMUNITY VISITOR" variant="info" size="sm" style={{ marginTop: 4 }} />
            </View>
          </View>
        </Card>

        {/* My Total Contribution Stat */}
        <Card variant="default" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
              My Total Contributions
            </Text>
            <Text style={{ color: colors.income, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: 2 }}>
              {formatCurrency(totalMyDonations)}
            </Text>
          </View>
          <Badge label={`${myContributions.length} Records`} variant="success" />
        </Card>

        {/* My Contribution History List */}
        {myContributions.length > 0 && (
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.xs }}>
              My Donation History
            </Text>
            <Card padding="none">
              {myContributions.map((c, idx) => (
                <View
                  key={c.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderBottomWidth: idx < myContributions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                      {c.function?.name || 'Function'}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                      {formatDate(c.payment_date)} • {formatPaymentMethod(c.payment_method)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.income, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                    +{formatCurrency(c.amount)}
                  </Text>
                </View>
              ))}
            </Card>
          </View>
        )}

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
        message="Are you sure you want to log out?"
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
