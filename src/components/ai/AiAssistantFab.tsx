import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface AiAssistantFabProps {
  onPress: () => void;
}

export function AiAssistantFab({ onPress }: AiAssistantFabProps) {
  const { colors, shadow, borderRadius } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.fabContainer,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            borderColor: '#F59E0B',
          },
          shadow.lg,
        ]}
      >
        <Ionicons name="sparkles" size={24} color="#FFFFFF" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#851D1D',
  },
});
