import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  color?: string;
  bgColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  color,
  bgColor,
  icon,
  style,
  compact = false,
}) => {
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();

  const cardColor = color ?? colors.primary;
  const cardBg = bgColor ?? colors.primaryLight;

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: compact ? spacing.md : spacing.lg,
          ...shadow.md,
          borderLeftWidth: 4,
          borderLeftColor: cardColor,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.textSecondary, fontSize: compact ? fontSize.xs : fontSize.sm, fontWeight: fontWeight.medium, marginBottom: spacing.xs }}>
            {title}
          </Text>
          <Text style={{ color: cardColor, fontSize: compact ? fontSize.xl : fontSize.xxl, fontWeight: fontWeight.bold }}>
            {formatCurrency(amount)}
          </Text>
          {subtitle && (
            <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: spacing.xs }}>
              {subtitle}
            </Text>
          )}
        </View>
        {icon && (
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: borderRadius.md,
              padding: spacing.sm,
              marginLeft: spacing.sm,
            }}
          >
            {icon}
          </View>
        )}
      </View>
    </View>
  );
};
