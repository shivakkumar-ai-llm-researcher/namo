import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style, size = 'md' }) => {
  const { colors, spacing, borderRadius, fontSize } = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    error: { bg: colors.errorLight, text: colors.error },
    info: { bg: colors.infoLight, text: colors.info },
    primary: { bg: colors.primaryLight, text: colors.primary },
    default: { bg: colors.surfaceVariant, text: colors.textSecondary },
  };

  const vc = variantColors[variant];

  return (
    <View
      style={[
        {
          backgroundColor: vc.bg,
          borderRadius: borderRadius.full,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
          paddingVertical: size === 'sm' ? 2 : spacing.xs,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ color: vc.text, fontSize: size === 'sm' ? fontSize.xs : fontSize.sm, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
};
