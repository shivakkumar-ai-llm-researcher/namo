import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useFunctionStore } from '../../../src/store';
import { functionService, contributionService, expenseService } from '../../../src/services';
import { Card, StatCard, Badge, BalajiHundi, BalajiNamam, YearTypeFilterBar } from '../../../src/components/ui';
import { formatCurrency, formatFunctionType } from '../../../src/utils/formatters';
import { CommunityFunction, Contribution, Expense, FunctionType } from '../../../src/types';

interface FunctionSavingsDetail {
  function: CommunityFunction;
  contributions: number;
  expenses: number;
  savings: number;
}

export default function SavingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow, isDark } = useTheme();
  const { functions, setFunctions } = useFunctionStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [functionDetails, setFunctionDetails] = useState<FunctionSavingsDetail[]>([]);
  const [grandTotalContributions, setGrandTotalContributions] = useState(0);
  const [grandTotalExpenses, setGrandTotalExpenses] = useState(0);

  // Year + Function Type Filters
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [selectedType, setSelectedType] = useState<'all' | FunctionType>('all');

  const loadSavingsData = async () => {
    try {
      const allFunctions = await functionService.getAll();
      setFunctions(allFunctions);

      let totalC = 0;
      let totalE = 0;

      const details: FunctionSavingsDetail[] = await Promise.all(
        allFunctions.map(async (fn: CommunityFunction) => {
          const [cRes, eRes] = await Promise.all([
            contributionService.getAll({ function_id: fn.id, limit: 1000 }),
            expenseService.getAll({ function_id: fn.id, limit: 1000 }),
          ]);

          const fnC = cRes.data.reduce((s: number, item: Contribution) => s + Number(item.amount), 0);
          const fnE = eRes.data.reduce((s: number, item: Expense) => s + Number(item.amount), 0);

          totalC += fnC;
          totalE += fnE;

          return {
            function: fn,
            contributions: fnC,
            expenses: fnE,
            savings: fnC - fnE,
          };
        })
      );

      setFunctionDetails(details);
      setGrandTotalContributions(totalC);
      setGrandTotalExpenses(totalE);
    } catch (e) {
      console.warn('Savings load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSavingsData();
    }, [])
  );

  // Available years dynamically computed from functions
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    functionDetails.forEach((d) => {
      yearsSet.add(d.function.start_year);
      if (d.function.end_year) yearsSet.add(d.function.end_year);
    });
    yearsSet.add(2025);
    yearsSet.add(2026);
    yearsSet.add(2029);
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [functionDetails]);

  // Filtered function details based on Year + Function Type
  const filteredFunctionDetails = useMemo(() => {
    return functionDetails.filter((d) => {
      if (selectedType !== 'all' && d.function.type !== selectedType) {
        return false;
      }
      if (selectedYear !== 'all') {
        const yr = Number(selectedYear);
        const startYr = d.function.start_year;
        const endYr = d.function.end_year || startYr;
        if (yr < startYr || yr > endYr) {
          return false;
        }
      }
      return true;
    });
  }, [functionDetails, selectedYear, selectedType]);

  const filteredTotalContributions = filteredFunctionDetails.reduce((s, d) => s + d.contributions, 0);
  const filteredTotalExpenses = filteredFunctionDetails.reduce((s, d) => s + d.expenses, 0);
  const filteredTotalSavings = filteredTotalContributions - filteredTotalExpenses;

  const filteredAnnualSavings = filteredFunctionDetails
    .filter((d) => d.function.type === 'ANNUAL')
    .reduce((s, d) => s + d.savings, 0);

  const filteredFourYearSavings = filteredFunctionDetails
    .filter((d) => d.function.type === 'FOUR_YEAR')
    .reduce((s, d) => s + d.savings, 0);

  const isFiltered = selectedYear !== 'all' || selectedType !== 'all';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header with Balaji blessings */}
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 2,
          borderBottomColor: '#D97706',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ color: '#B45309', fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            ॥ Srivari Hundi Seva ॥
          </Text>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
            Community Savings
          </Text>
        </View>
        <BalajiHundi size={38} color="#B45309" />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSavingsData(); }} />}
        >
          {/* Main Total Savings Banner */}
          <View
            style={{
              backgroundColor: colors.primary,
              borderRadius: borderRadius.lg,
              padding: spacing.xl,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#D97706',
              ...shadow.md,
            }}
          >
            <View style={{ marginBottom: spacing.xs }}>
              <BalajiHundi size={44} color="#FDE68A" />
            </View>
            <Text style={{ color: '#FEF3C7', fontSize: fontSize.sm, fontWeight: fontWeight.bold, letterSpacing: 1, textTransform: 'uppercase' }}>
              {isFiltered ? 'Filtered Community Savings' : 'Total Srivari Community Savings'}
            </Text>
            <Text style={{ color: 'white', fontSize: 38, fontWeight: fontWeight.bold, marginVertical: spacing.xs }}>
              {formatCurrency(filteredTotalSavings)}
            </Text>
            <Text style={{ color: 'rgba(254, 243, 199, 0.85)', fontSize: fontSize.xs }}>
              {isFiltered
                ? `Showing ${filteredFunctionDetails.length} of ${functionDetails.length} community functions`
                : `Across ${functionDetails.length} recorded community functions`}
            </Text>
          </View>

          {/* Year + Function Type Filter Bar */}
          <YearTypeFilterBar
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            availableYears={availableYears}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            title="Filter Savings by Year & Function"
          />

          {/* Opening vs Closing Balance Accounting Ledger Card */}
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
              Financial Reconciliation Ledger {isFiltered ? '(Filtered)' : ''}
            </Text>

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>Opening Balance</Text>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  {formatCurrency(0)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={{ color: colors.income, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>+</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm }}>Total Income (Contributions)</Text>
                </View>
                <Text style={{ color: colors.income, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  +{formatCurrency(filteredTotalContributions)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={{ color: colors.expense, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>−</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm }}>Total Expenses</Text>
                </View>
                <Text style={{ color: colors.expense, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  −{formatCurrency(filteredTotalExpenses)}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                  Closing Savings Balance
                </Text>
                <Text style={{ color: colors.savings, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                  {formatCurrency(filteredTotalSavings)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Accumulated by Type Cards */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card variant="default" style={{ flex: 1, padding: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Purattasi Sani Savings</Text>
              <Text style={{ color: colors.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: 4 }}>
                {formatCurrency(filteredAnnualSavings)}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                Yearly functions
              </Text>
            </Card>

            <Card variant="default" style={{ flex: 1, padding: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Gokulaashdami Savings</Text>
              <Text style={{ color: colors.balance, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: 4 }}>
                {formatCurrency(filteredFourYearSavings)}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                4-Year cycle
              </Text>
            </Card>
          </View>

          {/* Function Savings Breakdown List */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                Savings by Function
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                {filteredFunctionDetails.length} function{filteredFunctionDetails.length === 1 ? '' : 's'}
              </Text>
            </View>

            {filteredFunctionDetails.length === 0 ? (
              <Card variant="default" padding="lg" style={{ alignItems: 'center' }}>
                <Ionicons name="filter-outline" size={36} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.sm, textAlign: 'center' }}>
                  No functions match the selected filters
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 4, textAlign: 'center' }}>
                  Try changing the year or function type above.
                </Text>
              </Card>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {filteredFunctionDetails.map((detail) => (
                  <Card key={detail.function.id} variant="default" padding="md">
                    <View style={{ gap: spacing.xs }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                          {detail.function.name}
                        </Text>
                        <Badge
                          label={formatFunctionType(detail.function.type)}
                          variant={detail.function.type === 'ANNUAL' ? 'info' : 'primary'}
                          size="sm"
                        />
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                          Income: <Text style={{ color: colors.income, fontWeight: fontWeight.semibold }}>{formatCurrency(detail.contributions)}</Text>
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
                          Expense: <Text style={{ color: colors.expense, fontWeight: fontWeight.semibold }}>{formatCurrency(detail.expenses)}</Text>
                        </Text>
                      </View>

                      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                          Net Function Savings
                        </Text>
                        <Text style={{ color: colors.savings, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                          {formatCurrency(detail.savings)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
