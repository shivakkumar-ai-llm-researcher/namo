import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useFunctionStore } from '../../../src/store';
import { analyticsService } from '../../../src/services';
import { Card, StatCard, Badge, EmptyState } from '../../../src/components/ui';
import { formatCurrency, formatExpenseCategory, getCategoryIcon } from '../../../src/utils/formatters';
import { AnnualAnalytics, FourYearAnalytics } from '../../../src/types';

const screenWidth = Dimensions.get('window').width;

export default function AdminAnalyticsScreen() {
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
    if (!selectedFunctionId) {
      if (functions.length > 0) {
        setSelectedFunctionId(functions[0].id);
      } else {
        setLoading(false);
        return;
      }
    }

    const fnId = selectedFunctionId || functions[0]?.id;
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
      console.warn('Analytics load error:', e);
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
          {t('navigation.analytics', 'Financial Analytics')}
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

        {/* Segmented Tab: Annual vs Four-Year */}
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
              Annual Analytics
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
              4-Year Analytics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Year Selector for Annual */}
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
              {/* Summary stat cards */}
              <View style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <StatCard
                    title="Annual Contributions"
                    amount={annualData.total_contributions}
                    color={colors.income}
                    bgColor={colors.incomeLight}
                    icon={<Ionicons name="arrow-down" size={18} color={colors.income} />}
                    style={{ flex: 1 }}
                    compact
                  />
                  <StatCard
                    title="Annual Expenses"
                    amount={annualData.total_expenses}
                    color={colors.expense}
                    bgColor={colors.expenseLight}
                    icon={<Ionicons name="arrow-up" size={18} color={colors.expense} />}
                    style={{ flex: 1 }}
                    compact
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <StatCard
                    title="Net Savings"
                    amount={annualData.savings}
                    color={colors.savings}
                    bgColor={colors.savingsLight}
                    icon={<Ionicons name="wallet-outline" size={18} color={colors.savings} />}
                    style={{ flex: 1 }}
                    compact
                  />
                  <Card variant="default" style={{ flex: 1, padding: spacing.md, justifyContent: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Avg Contribution</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginTop: 2 }}>
                      {formatCurrency(annualData.average_contribution)}
                    </Text>
                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                      {annualData.contributor_count} contributors
                    </Text>
                  </Card>
                </View>
              </View>

              {/* Monthly Trend Visual Bar Chart */}
              <Card variant="default">
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.md }}>
                  Monthly Flow ({selectedYear})
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {annualData.monthly_contributions.map((mc, idx) => {
                    const me = annualData.monthly_expenses[idx];
                    const maxVal = Math.max(
                      ...annualData.monthly_contributions.map((c) => c.amount),
                      ...annualData.monthly_expenses.map((e) => e.amount),
                      1
                    );
                    const contribPct = Math.round((mc.amount / maxVal) * 100);
                    const expPct = Math.round((me.amount / maxVal) * 100);

                    if (mc.amount === 0 && me.amount === 0) return null;

                    return (
                      <View key={mc.month} style={{ gap: 2 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, width: 32 }}>
                            {mc.label}
                          </Text>
                          <Text style={{ color: colors.income, fontSize: fontSize.xs }}>
                            +{formatCurrency(mc.amount)}
                          </Text>
                          <Text style={{ color: colors.expense, fontSize: fontSize.xs }}>
                            -{formatCurrency(me.amount)}
                          </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: colors.surfaceVariant, borderRadius: 3, overflow: 'hidden', flexDirection: 'row', gap: 2 }}>
                          <View style={{ width: `${contribPct}%`, backgroundColor: colors.income, borderRadius: 3 }} />
                          <View style={{ width: `${expPct}%`, backgroundColor: colors.expense, borderRadius: 3 }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.income, borderRadius: 5 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Income</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                    <View style={{ width: 10, height: 10, backgroundColor: colors.expense, borderRadius: 5 }} />
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Expense</Text>
                  </View>
                </View>
              </Card>

              {/* Expense Category Breakdown */}
              <Card variant="default">
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.md }}>
                  Expense Distribution by Category
                </Text>
                {annualData.category_breakdown.length === 0 ? (
                  <Text style={{ color: colors.textTertiary, textAlign: 'center', padding: spacing.md }}>
                    No expenses recorded in {selectedYear}
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                            <Text style={{ color: colors.expense, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                              {formatCurrency(item.amount)}
                            </Text>
                            <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, width: 36, textAlign: 'right' }}>
                              {item.percentage.toFixed(0)}%
                            </Text>
                          </View>
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
              {/* Four-Year Totals Header */}
              <View style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  <StatCard
                    title="4-Year Total Income"
                    amount={fourYearData.total_income}
                    color={colors.income}
                    bgColor={colors.incomeLight}
                    icon={<Ionicons name="trending-up" size={20} color={colors.income} />}
                    style={{ flex: 1 }}
                    compact
                  />
                  <StatCard
                    title="4-Year Total Expenses"
                    amount={fourYearData.total_expenses}
                    color={colors.expense}
                    bgColor={colors.expenseLight}
                    icon={<Ionicons name="trending-down" size={20} color={colors.expense} />}
                    style={{ flex: 1 }}
                    compact
                  />
                </View>

                <StatCard
                  title="Accumulated 4-Year Savings"
                  amount={fourYearData.total_savings}
                  color={colors.savings}
                  bgColor={colors.savingsLight}
                  subtitle="Total Income - Total Expenses across all years"
                  icon={<Ionicons name="wallet" size={24} color={colors.savings} />}
                />
              </View>

              {/* Four-Year Breakdown Table */}
              <Card variant="default" padding="none">
                <View style={{ padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                    Year-by-Year Financial Progression
                  </Text>
                </View>

                {/* Table Header */}
                <View style={{ flexDirection: 'row', padding: spacing.sm, backgroundColor: colors.surfaceVariant }}>
                  <Text style={{ flex: 1, color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>Year</Text>
                  <Text style={{ flex: 2, color: colors.income, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'right' }}>Income</Text>
                  <Text style={{ flex: 2, color: colors.expense, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'right' }}>Expense</Text>
                  <Text style={{ flex: 2, color: colors.savings, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'right' }}>Savings</Text>
                </View>

                {/* Table Rows */}
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

              {/* Four-Year Category Breakdown */}
              <Card variant="default">
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold, marginBottom: spacing.md }}>
                  Overall 4-Year Expense Distribution
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {fourYearData.category_breakdown.map((item) => (
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
              </Card>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
