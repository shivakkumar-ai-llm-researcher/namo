import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useFunctionStore } from '../../../src/store';
import { functionService } from '../../../src/services';
import { Card, Badge, EmptyState } from '../../../src/components/ui';
import { formatFunctionType, formatFunctionStatus } from '../../../src/utils/formatters';
import { CommunityFunction } from '../../../src/types';
import { TamilCalendarView } from '../../../src/components/calendar/TamilCalendarView';

export default function CalendarScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow, isDark } = useTheme();
  const { functions, setFunctions } = useFunctionStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'TAMIL_CALENDAR' | 'FUNCTIONS'>('TAMIL_CALENDAR');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterType, setFilterType] = useState<'ALL' | 'ANNUAL' | 'FOUR_YEAR'>('ALL');

  const loadCalendarData = async () => {
    try {
      const data = await functionService.getAll();
      setFunctions(data);
    } catch (e) {
      console.warn('Calendar load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCalendarData();
  };

  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const filteredFunctions = functions.filter((fn: CommunityFunction) => {
    if (filterType !== 'ALL' && fn.type !== filterType) return false;
    if (fn.type === 'ANNUAL') {
      return fn.start_year === selectedYear;
    } else {
      const end = fn.end_year ?? fn.start_year + 3;
      return selectedYear >= fn.start_year && selectedYear <= end;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.income;
      case 'completed': return colors.primary;
      case 'planning': return colors.warning;
      case 'archived': return colors.textTertiary;
      default: return colors.primary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.sm,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ marginBottom: spacing.xs }}>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
            {viewMode === 'TAMIL_CALENDAR' ? 'Tamil Calendar & Perumal Days' : 'Functions Schedule'}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
            {viewMode === 'TAMIL_CALENDAR'
              ? 'தமிழ் நாட்காட்டி • புரட்டாசி சனி & கோகுலாஷ்டமி'
              : 'Annual & 4-Year Community Events Schedule'}
          </Text>
        </View>

        {/* View Mode Segmented Control */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: isDark ? '#2E2218' : colors.surfaceVariant,
            borderRadius: borderRadius.md,
            padding: 3,
            marginTop: spacing.xs,
          }}
        >
          <TouchableOpacity
            onPress={() => setViewMode('TAMIL_CALENDAR')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: borderRadius.sm,
              backgroundColor: viewMode === 'TAMIL_CALENDAR' ? colors.surface : 'transparent',
              alignItems: 'center',
              shadowColor: viewMode === 'TAMIL_CALENDAR' ? '#000' : 'transparent',
              shadowOpacity: viewMode === 'TAMIL_CALENDAR' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: viewMode === 'TAMIL_CALENDAR' ? 2 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons
                name="calendar"
                size={16}
                color={viewMode === 'TAMIL_CALENDAR' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={{
                  color: viewMode === 'TAMIL_CALENDAR' ? colors.primary : colors.textSecondary,
                  fontSize: fontSize.xs,
                  fontWeight: viewMode === 'TAMIL_CALENDAR' ? fontWeight.bold : fontWeight.medium,
                }}
              >
                Tamil Calendar
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('FUNCTIONS')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: borderRadius.sm,
              backgroundColor: viewMode === 'FUNCTIONS' ? colors.surface : 'transparent',
              alignItems: 'center',
              shadowColor: viewMode === 'FUNCTIONS' ? '#000' : 'transparent',
              shadowOpacity: viewMode === 'FUNCTIONS' ? 0.08 : 0,
              shadowRadius: 3,
              elevation: viewMode === 'FUNCTIONS' ? 2 : 0,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons
                name="list"
                size={16}
                color={viewMode === 'FUNCTIONS' ? colors.primary : colors.textSecondary}
              />
              <Text
                style={{
                  color: viewMode === 'FUNCTIONS' ? colors.primary : colors.textSecondary,
                  fontSize: fontSize.xs,
                  fontWeight: viewMode === 'FUNCTIONS' ? fontWeight.bold : fontWeight.medium,
                }}
              >
                Functions Schedule
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Year Pills and Filter Pills when in Functions Schedule Mode */}
        {viewMode === 'FUNCTIONS' && (
          <View style={{ marginTop: spacing.sm }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {years.map((y) => {
                const isSelected = selectedYear === y;
                return (
                  <TouchableOpacity
                    key={y}
                    onPress={() => setSelectedYear(y)}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs + 2,
                      borderRadius: borderRadius.full,
                      backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                      marginRight: spacing.sm,
                    }}
                  >
                    <Text style={{ color: isSelected ? 'white' : colors.textSecondary, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
              {(['ALL', 'ANNUAL', 'FOUR_YEAR'] as const).map((type) => {
                const isSelected = filterType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFilterType(type)}
                    style={{
                      paddingHorizontal: spacing.sm + 2,
                      paddingVertical: spacing.xs,
                      borderRadius: borderRadius.sm,
                      backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                      borderWidth: isSelected ? 1 : 0,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text style={{ color: isSelected ? colors.primary : colors.textTertiary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                      {type === 'ALL' ? 'All Functions' : type === 'ANNUAL' ? 'Purattasi Sani Kiyamai' : 'Gokulaashdami'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : viewMode === 'TAMIL_CALENDAR' ? (
        /* Tamil Calendar with react-native-calendars & Perumal Auspicious Days */
        <TamilCalendarView
          functions={functions}
          onSelectFunction={(fn) => router.push(`/(admin)/more/functions/${fn.id}`)}
        />
      ) : (
        /* Functions Timeline Schedule */
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {/* Active Function Hero */}
          <Card variant="default" style={{ borderLeftWidth: 4, borderLeftColor: colors.primary }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  Selected Year Overview
                </Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                  {selectedYear} Community Timeline
                </Text>
              </View>
              <Badge label={`${filteredFunctions.length} Active`} variant="primary" size="sm" />
            </View>
          </Card>

          {/* Functions Timeline List */}
          {filteredFunctions.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title={`No Functions in ${selectedYear}`}
              description="No community functions scheduled for this period. Tap 'Schedule' to create an annual or 4-year function."
              actionLabel="+ Schedule Function"
              onAction={() => router.push('/(admin)/more/functions/add')}
            />
          ) : (
            filteredFunctions.map((fn: CommunityFunction) => {
              const statusColor = getStatusColor(fn.status);
              return (
                <TouchableOpacity
                  key={fn.id}
                  onPress={() => router.push(`/(admin)/more/functions/${fn.id}`)}
                  activeOpacity={0.75}
                >
                  <Card variant="default" padding="md">
                    <View style={{ gap: spacing.xs }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Badge
                          label={formatFunctionType(fn.type)}
                          variant={fn.type === 'ANNUAL' ? 'info' : 'primary'}
                          size="sm"
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }} />
                          <Text style={{ color: statusColor, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' }}>
                            {formatFunctionStatus(fn.status)}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginTop: 4 }}>
                        {fn.name}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 }}>
                        <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                          Duration: {fn.start_year}{fn.end_year ? ` – ${fn.end_year} (${fn.end_year - fn.start_year + 1} Years)` : ' (Annual)'}
                        </Text>
                      </View>

                      {fn.description && (
                        <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 4 }} numberOfLines={2}>
                          {fn.description}
                        </Text>
                      )}

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                          View Financial Details →
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Floating Action Button (FAB) for Scheduling */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/more/functions/add')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 85,
          backgroundColor: colors.primary,
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
        }}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
