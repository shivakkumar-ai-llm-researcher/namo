import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../../theme';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { colors, fontSize, spacing } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md }}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>{message}</Text>
      )}
    </View>
  );
};
