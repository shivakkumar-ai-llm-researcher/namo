import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors, spacing, fontSize, fontWeight } = useTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xxl,
          gap: spacing.md,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={64} color={colors.textTertiary} />
      <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, textAlign: 'center' }}>
        {title}
      </Text>
      {description && (
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing.sm }} />
      )}
    </View>
  );
};
