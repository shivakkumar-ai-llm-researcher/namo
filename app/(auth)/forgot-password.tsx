import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/theme';
import { authService } from '../../src/services';
import { changeLanguage } from '../../src/i18n';
import { getErrorMessage } from '../../src/utils';
import { Button, Input } from '../../src/components/ui';

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, fontSize, fontWeight, borderRadius, shadow, mode, isDark, setThemeMode } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSent(true);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Right Corner Controls (Screen Viewport) */}
      <View
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 52 : 32,
          right: 20,
          zIndex: 100,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
        }}
      >
        {/* Language Switcher */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.full,
            padding: 3,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadow.sm,
          }}
        >
          <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={{
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: borderRadius.full,
              backgroundColor: !i18n.language?.startsWith('ta') ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: !i18n.language?.startsWith('ta') ? '#FFFFFF' : colors.textSecondary,
              }}
            >
              EN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => changeLanguage('ta')}
            style={{
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: borderRadius.full,
              backgroundColor: i18n.language?.startsWith('ta') ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: i18n.language?.startsWith('ta') ? '#FFFFFF' : colors.textSecondary,
              }}
            >
              தமிழ்
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow.sm,
          }}
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Center-Based Card Box */}
        <View
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.surface,
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: colors.border,
            overflow: 'hidden',
            ...shadow.lg,
          }}
        >
          {/* Header Banner with Sacred Kumkum Maroon Background */}
          <View
            style={{
              backgroundColor: colors.primary,
              paddingTop: spacing.xl,
              paddingBottom: spacing.lg,
              paddingHorizontal: spacing.lg,
              alignItems: 'center',
              borderBottomWidth: 3,
              borderBottomColor: '#D97706',
            }}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: 'absolute',
                top: spacing.md,
                left: spacing.md,
                zIndex: 10,
                padding: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 20,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View
              style={{
                padding: 12,
                backgroundColor: 'rgba(217, 119, 6, 0.25)',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
                borderWidth: 1.5,
                borderColor: '#F59E0B',
              }}
            >
              <Ionicons name="key-outline" size={36} color="#FDE68A" />
            </View>

            <Text
              style={{
                color: '#FFFFFF',
                fontSize: fontSize.xxl,
                fontWeight: fontWeight.bold,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              {t('auth.forgotPassword', 'Forgot Password')}
            </Text>

            <Text
              style={{
                color: 'rgba(254, 243, 199, 0.9)',
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                textAlign: 'center',
              }}
            >
              Enter your email to receive recovery instructions
            </Text>
          </View>

          {/* Form Body Inside Center Box */}
          <View style={{ padding: spacing.xl }}>
            {sent ? (
              <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }}>
                <Ionicons name="checkmark-circle" size={56} color={colors.success} />
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: fontSize.lg,
                    fontWeight: fontWeight.bold,
                    textAlign: 'center',
                  }}
                >
                  Password Reset Email Sent!
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: fontSize.sm,
                    textAlign: 'center',
                    lineHeight: 20,
                  }}
                >
                  Check your inbox and follow the instructions to reset your password.
                </Text>
                <Button
                  title={t('auth.backToLogin', 'Back to Sign In')}
                  onPress={() => router.replace('/(auth)/login')}
                  fullWidth
                  size="lg"
                  style={{ marginTop: spacing.sm }}
                />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: fontSize.sm,
                    lineHeight: 20,
                    marginBottom: spacing.md,
                    textAlign: 'center',
                  }}
                >
                  Enter your registered community email address and we will send you a password reset link.
                </Text>

                <Input
                  label={t('auth.email', 'Email Address')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  required
                  leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textTertiary} />}
                />

                <View style={{ marginTop: spacing.sm }}>
                  <Button
                    title={t('auth.resetPassword', 'Reset Password')}
                    onPress={handleReset}
                    loading={isLoading}
                    fullWidth
                    size="lg"
                  />
                </View>

                {/* Back to Sign In Link Below Button */}
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    alignSelf: 'center',
                    marginTop: spacing.md,
                    paddingVertical: spacing.xs,
                    paddingHorizontal: spacing.sm,
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? colors.gold : colors.primary,
                      fontSize: fontSize.sm,
                      fontWeight: fontWeight.semibold,
                    }}
                  >
                    {t('auth.backToLogin', 'Back to Sign In')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
