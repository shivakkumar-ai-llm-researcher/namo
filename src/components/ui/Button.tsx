import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  leftIcon,
  rightIcon,
}) => {
  const { colors, spacing, borderRadius, fontSize, fontWeight } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, fontSize: fontSize.sm },
    md: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.lg, fontSize: fontSize.md },
    lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: fontSize.lg },
  }[size];

  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    primary: { bg: colors.primary, text: colors.textInverse },
    secondary: { bg: colors.surfaceVariant, text: colors.textPrimary },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', text: colors.primary },
    danger: { bg: colors.error, text: colors.textInverse },
  };

  const vs = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        {
          backgroundColor: vs.bg,
          borderRadius: borderRadius.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          gap: spacing.xs,
          opacity: isDisabled ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        vs.border && { borderWidth: 1.5, borderColor: vs.border },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <>
          {leftIcon}
          <Text style={[{ color: vs.text, fontSize: sizeStyles.fontSize, fontWeight: fontWeight.semibold }, textStyle]}>
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};
