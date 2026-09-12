import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useFunctionStore } from '../../../src/store';
import { analyticsService } from '../../../src/services';
import { Card, StatCard, Badge } from '../../../src/components/ui';
import { formatCurrency, formatExpenseCategory, getCategoryIcon } from '../../../src/utils/formatters';
import { AnnualAnalytics, FourYearAnalytics } from '../../../src/types';

export default function VisitorAnalyticsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { functions, activeFunction } = useFunctionStore();

  const [activeTab, setActiveTab] = useState<'annual' | 'four_year'>('annual');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedFunctionId, setSelectedFunctionId] = useState<string>(activeFunction?.id || '');
  const [annualData, setAnnualData] = useState<AnnualAnalytics | null>(null);
  const [fourYearData, setFourYearData] = useState<FourYearAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    const fnId = selectedFunctionId || activeFunction?.id || functions[0]?.id;
    if (!fnId) {
      setLoading(false);
      return;
    }

    try {
      if (activeTab === 'annual') {
        const data = await analyticsService.getAnnualAnalytics(fnId, selectedYear);
        setAnnualData(data);
      } else {
        const data = await analyticsService.getFourYearAnalytics(fnId);
        setFourYearData(data);
      }
    } catch (e) {
      console.warn('Visitor analytics load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [selectedFunctionId, activeTab, selectedYear])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const years = [2024, 2025, 2026, 2027, 2028, 2029];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
          {t('navigation.analytics', 'Community Analytics')}
        </Text>

        {/* Function selector pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
          {functions.map((fn) => {
            const isSelected = selectedFunctionId === fn.id;
            return (
              <TouchableOpacity
                key={fn.id}
                onPress={() => setSelectedFunctionId(fn.id)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 2,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                  marginRight: spacing.sm,
                }}
              >
                <Text style={{ color: isSelected ? colors.textInverse : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                  {fn.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Segmented Tab */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.surfaceVariant,
            borderRadius: borderRadius.md,
            padding: 3,
            marginTop: spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('annual')}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              alignItems: 'center',
              borderRadius: borderRadius.sm,
              backgroundColor: activeTab === 'annual' ? colors.surface : 'transparent',
              ...shadow.sm,
            }}
          >
            <Text style={{ color: activeTab === 'annual' ? colors.primary : colors.textSecondary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
              Annual Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('four_year')}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              alignItems: 'center',
              borderRadius: borderRadius.sm,
              backgroundColor: activeTab === 'four_year' ? colors.surface : 'transparent',
              ...shadow.sm,
            }}
          >
            <Text style={{ color: activeTab === 'four_year' ? colors.primary : colors.textSecondary, fontWeight: fontWeight.bold, fontSize: fontSize.sm }}>
              4-Year Progression
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'annual' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
            {years.map((y) => {
              const isSelected = selectedYear === y;
              return (
                <TouchableOpacity
                  key={y}
                  onPress={() => setSelectedYear(y)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.sm,
                    backgroundColor: isSelected ? colors.primaryLight : 'transparent',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: colors.primary,
                    marginRight: spacing.xs,
                  }}
                >
                  <Text style={{ color: isSelected ? colors.primary : colors.textTertiary, fontWeight: fontWeight.bold, fontSize: fontSize.xs }}>
                    {y}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {activeTab === 'annual' && annualData && (
            <>
              {/* Financial Balance Summary */}
              <View style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <StatCard
                    title="Total Donations"
                    amount={annualData.total_contributions}
                    color={colors.income}
                    bgColor={colors.incomeLight}
                    icon={<Ionicons name="arrow-down" size={18} color={colors.income} />}
                    style={{ flex: 1 }}
                    compact
                  />
                  <StatCard
                    title="Total Expenses"
                    amount={annualData.total_expenses}
                    color={colors.expense}
                    bgColor={colors.expenseLight}
                    icon={<Ionicons name="arrow-up" size={18} color={colors.expense} />}
                    style={{ flex: 1 }}
                    compact
                  />
                </View>

                <StatCard
                  title="Net Community Savings"
                  amount={annualData.savings}
                  color={colors.savings}
                  bgColor={colors.savingsLight}
                  subtitle={`Average donation: ${formatCurrency(annualData.average_contribution)} (${annualData.contributor_count} donors)`}
                  icon={<Ionicons name="wallet-outline" size={24} color={colors.savings} />}
                />
              </View>

              {/* Category Breakdown */}
              <Card variant="default">
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.md }}>
                  Expense Distribution by Category
                </Text>
                {annualData.category_breakdown.length === 0 ? (
                  <Text style={{ color: colors.textTertiary, textAlign: 'center', padding: spacing.md }}>
                    No expenses recorded for {selectedYear}
                  </Text>
                ) : (
                  <View style={{ gap: spacing.sm }}>
                    {annualData.category_breakdown.map((item) => (
                      <View key={item.category} style={{ gap: 4 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Ionicons name={getCategoryIcon(item.category) as any} size={16} color={colors.primary} />
                            <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}>
                              {formatExpenseCategory(item.category)}
                            </Text>
                          </View>
                          <Text style={{ color: colors.expense, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                            {formatCurrency(item.amount)} ({item.percentage.toFixed(0)}%)
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: colors.surfaceVariant, borderRadius: 3, overflow: 'hidden' }}>
                          <View style={{ width: `${Math.min(100, item.percentage)}%`, height: '100%', backgroundColor: colors.expense, borderRadius: 3 }} />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </>
          )}

          {activeTab === 'four_year' && fourYearData && (
            <>
              {/* Four-Year Totals */}
              <View style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <StatCard
                    title="4-Year Total Income"
                    amount={fourYearData.total_income}
                    color={colors.income}
                    bgColor={colors.incomeLight}
                    style={{ flex: 1 }}
                    compact
                  />
                  <StatCard
                    title="4-Year Total Expenses"
                    amount={fourYearData.total_expenses}
                    color={colors.expense}
                    bgColor={colors.expenseLight}
                    style={{ flex: 1 }}
                    compact
                  />
                </View>

                <StatCard
                  title="Accumulated Savings"
                  amount={fourYearData.total_savings}
                  color={colors.savings}
                  bgColor={colors.savingsLight}
                  subtitle="Net remaining balance for community development"
                  icon={<Ionicons name="wallet" size={24} color={colors.savings} />}
                />
              </View>

              {/* Table */}
              <Card variant="default" padding="none">
                <View style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                    Multi-Year Progression
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surfaceVariant }}>
                  <Text style={{ flex: 1, color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>Year</Text>
                  <Text style={{ flex: 2, color: colors.income, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'right' }}>Income</Text>
                  <Text style={{ flex: 2, color: colors.expense, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'right' }}>Expense</Text>
                  <Text style={{ flex: 2, color: colors.savings, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'right' }}>Savings</Text>
                </View>
                {fourYearData.years.map((y, idx) => (
                  <View
                    key={y.year}
                    style={{
                      flexDirection: 'row',
                      padding: spacing.md,
                      alignItems: 'center',
                      borderBottomWidth: idx < fourYearData.years.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ flex: 1, color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                      {y.year}
                    </Text>
                    <Text style={{ flex: 2, color: colors.income, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, textAlign: 'right' }}>
                      {formatCurrency(y.income)}
                    </Text>
                    <Text style={{ flex: 2, color: colors.expense, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, textAlign: 'right' }}>
                      {formatCurrency(y.expenses)}
                    </Text>
                    <Text style={{ flex: 2, color: colors.savings, fontSize: fontSize.sm, fontWeight: fontWeight.bold, textAlign: 'right' }}>
                      {formatCurrency(y.savings)}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
