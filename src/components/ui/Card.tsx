import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}) => {
  const { colors, spacing, borderRadius, shadow } = useTheme();

  const paddingMap = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: paddingMap[padding],
        },
        variant === 'elevated' && shadow.md,
        variant === 'outlined' && {
          borderWidth: 1,
          borderColor: colors.border,
        },
        variant === 'default' && shadow.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
};
