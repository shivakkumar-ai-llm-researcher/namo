import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  required,
  isPassword,
  style,
  ...props
}) => {
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error ? colors.error : focused ? colors.borderFocus : colors.border;

  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      {label && (
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
          {label}{required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          borderWidth: 1.5,
          borderColor,
          paddingHorizontal: spacing.md,
          minHeight: 48,
        }}
      >
        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          style={[
            {
              flex: 1,
              color: colors.textPrimary,
              fontSize: fontSize.md,
              paddingVertical: spacing.sm,
            },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
        {!isPassword && rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={{ color: colors.error, fontSize: fontSize.xs, marginTop: spacing.xs }}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: spacing.xs }}>{hint}</Text>
      )}
    </View>
  );
};
