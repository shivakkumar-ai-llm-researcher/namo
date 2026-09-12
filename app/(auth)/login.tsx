import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store';
import { authService } from '../../src/services';
import { changeLanguage } from '../../src/i18n';
import { loginSchema } from '../../src/utils/validators';
import { getErrorMessage } from '../../src/utils';
import { Button, Input, BalajiNamam } from '../../src/components/ui';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, fontSize, fontWeight, borderRadius, shadow, mode, isDark, setThemeMode } = useTheme();
  const { setUser, setProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user } = await authService.signIn(data.email, data.password);
      if (user) {
        setUser(user);
        const profile = await authService.getProfile(user.id, data.email);
        setProfile(profile);

        if (profile.role === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(visitor)');
        }
      }
    } catch (error: any) {
      console.warn('Auth Error:', error);
      const msg = getErrorMessage(error);
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Login Failed', msg);
      }
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
          {/* Logo Header Banner with Sacred Kumkum Maroon Background */}
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
            <View
              style={{
                padding: 10,
                backgroundColor: 'rgba(217, 119, 6, 0.25)',
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
                borderWidth: 1.5,
                borderColor: '#F59E0B',
              }}
            >
              <BalajiNamam size={54} variant="colored" />
            </View>

            <Text
              style={{
                color: '#FDE68A',
                fontSize: fontSize.xs,
                fontWeight: fontWeight.bold,
                letterSpacing: 1.5,
                marginBottom: 4,
              }}
            >
              ॥ ॐ நமோ வேங்கடேசாய ॥
            </Text>

            <Text
              style={{
                color: '#FFFFFF',
                fontSize: fontSize.xxl,
                fontWeight: fontWeight.bold,
                textAlign: 'center',
                marginBottom: 4,
              }}
            >
              Srivari Community Fund
            </Text>

            <Text
              style={{
                color: 'rgba(254, 243, 199, 0.9)',
                fontSize: fontSize.xs,
                fontWeight: fontWeight.medium,
                textAlign: 'center',
              }}
            >
              Tirupati Balaji Devotees Financial Seva & Accounting
            </Text>
          </View>

          {/* Form Body Inside Center Box */}
          <View style={{ padding: spacing.xl }}>

          {/* Error Message Banner */}
          {errorMessage && (
            <View
              style={{
                backgroundColor: colors.errorLight,
                borderColor: colors.error,
                borderWidth: 1,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
              }}
            >
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: fontSize.sm, flex: 1 }}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.email', 'Email Address')}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholder="admin@community.org"
                error={errors.email?.message}
                required
                leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textTertiary} />}
              />
            )}
          />

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                label={t('auth.password', 'Password')}
                value={value}
                onChangeText={onChange}
                isPassword
                autoComplete="password"
                placeholder="••••••••"
                error={errors.password?.message}
                required
                leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />}
              />
            )}
          />

          {/* Sign In Button */}
          <View style={{ marginTop: spacing.sm }}>
            <Button
              title={t('auth.signIn', 'Sign In')}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="lg"
            />
          </View>

          {/* Forgot Password Option Below Sign In Button */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
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
              {t('auth.forgotPassword', 'Forgot Password?')}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
