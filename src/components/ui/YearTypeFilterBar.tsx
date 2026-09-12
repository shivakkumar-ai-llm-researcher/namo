import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { FunctionType } from '../../types';

export interface YearTypeFilterBarProps {
  selectedYear: 'all' | number;
  onSelectYear: (year: 'all' | number) => void;
  availableYears?: number[];
  selectedType: 'all' | FunctionType;
  onSelectType: (type: 'all' | FunctionType) => void;
  title?: string;
  style?: any;
}

export const YearTypeFilterBar: React.FC<YearTypeFilterBarProps> = ({
  selectedYear,
  onSelectYear,
  availableYears = [2025, 2026, 2027, 2028, 2029],
  selectedType,
  onSelectType,
  title = 'Filter Records',
  style,
}) => {
  const { colors, spacing, borderRadius, fontSize, fontWeight, isDark } = useTheme();

  const isFiltered = selectedYear !== 'all' || selectedType !== 'all';

  const handleReset = () => {
    onSelectYear('all');
    onSelectType('all');
  };

  const TYPE_OPTIONS: { id: 'all' | FunctionType; label: string; icon?: string; badgeColor?: string }[] = [
    { id: 'all', label: 'All Functions' },
    { id: 'ANNUAL', label: 'Purattasi Sani (Annual)', badgeColor: '#D97706' },
    { id: 'FOUR_YEAR', label: 'Gokulaashdami (4-Year)', badgeColor: '#10B981' },
  ];

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: isFiltered ? colors.primary : colors.border,
          gap: spacing.sm,
        },
        style,
      ]}
    >
      {/* Header with Title & Reset Button */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="funnel-outline" size={16} color={isFiltered ? colors.primary : colors.textSecondary} />
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Text>
          {isFiltered && (
            <View style={{ backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.full }}>
              <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>Active</Text>
            </View>
          )}
        </View>

        {isFiltered && (
          <TouchableOpacity
            onPress={handleReset}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 2, paddingHorizontal: 6 }}
          >
            <Ionicons name="close-circle-outline" size={14} color={colors.error} />
            <Text style={{ color: colors.error, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
              Reset
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1. Year Filter Pills Row */}
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: fontWeight.medium }}>
          Year
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          <TouchableOpacity
            onPress={() => onSelectYear('all')}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: borderRadius.full,
              backgroundColor: selectedYear === 'all' ? colors.primary : (isDark ? '#334155' : '#F1F5F9'),
              borderWidth: 1,
              borderColor: selectedYear === 'all' ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                color: selectedYear === 'all' ? '#FFFFFF' : colors.textSecondary,
                fontSize: 12,
                fontWeight: selectedYear === 'all' ? '700' : '500',
              }}
            >
              All Years
            </Text>
          </TouchableOpacity>

          {availableYears.map((yr) => {
            const isSel = selectedYear === yr;
            return (
              <TouchableOpacity
                key={yr}
                onPress={() => onSelectYear(yr)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSel ? colors.primary : (isDark ? '#334155' : '#F1F5F9'),
                  borderWidth: 1,
                  borderColor: isSel ? colors.primary : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isSel ? '#FFFFFF' : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: isSel ? '700' : '500',
                  }}
                >
                  {yr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Function Type Filter Pills Row */}
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.textTertiary, fontSize: 11, fontWeight: fontWeight.medium }}>
          Function Type
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {TYPE_OPTIONS.map((opt) => {
            const isSel = selectedType === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => onSelectType(opt.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSel
                    ? (opt.id === 'ANNUAL' ? '#92400E' : opt.id === 'FOUR_YEAR' ? '#065F46' : colors.primary)
                    : (isDark ? '#334155' : '#F1F5F9'),
                  borderWidth: 1,
                  borderColor: isSel ? 'transparent' : 'transparent',
                }}
              >
                {opt.badgeColor && !isSel && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: opt.badgeColor }} />
                )}
                <Text
                  style={{
                    color: isSel ? '#FFFFFF' : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: isSel ? '700' : '500',
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};
