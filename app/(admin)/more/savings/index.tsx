import React, { useState, useEffect, useCallback } from 'react';
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
import { useTheme } from '../../../../src/theme';
import { useFunctionStore } from '../../../../src/store';
import { functionService, contributionService, expenseService } from '../../../../src/services';
import { Card, StatCard, Badge } from '../../../../src/components/ui';
import { formatCurrency, formatFunctionType } from '../../../../src/utils/formatters';
import { CommunityFunction } from '../../../../src/types';

interface FunctionSavingsDetail {
  function: CommunityFunction;
  contributions: number;
  expenses: number;
  savings: number;
}

export default function SavingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { functions, activeFunction, setFunctions } = useFunctionStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [functionDetails, setFunctionDetails] = useState<FunctionSavingsDetail[]>([]);
  const [grandTotalContributions, setGrandTotalContributions] = useState(0);
  const [grandTotalExpenses, setGrandTotalExpenses] = useState(0);

  const loadSavingsData = async () => {
    try {
      const allFunctions = await functionService.getAll();
      setFunctions(allFunctions);

      let totalC = 0;
      let totalE = 0;

      const details: FunctionSavingsDetail[] = await Promise.all(
        allFunctions.map(async (fn) => {
          const [cRes, eRes] = await Promise.all([
            contributionService.getAll({ function_id: fn.id, limit: 1000 }),
            expenseService.getAll({ function_id: fn.id, limit: 1000 }),
          ]);

          const fnC = cRes.data.reduce((s, item) => s + Number(item.amount), 0);
          const fnE = eRes.data.reduce((s, item) => s + Number(item.amount), 0);

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

  const grandTotalSavings = grandTotalContributions - grandTotalExpenses;

  // Annual vs Four-Year accumulated
  const annualSavings = functionDetails
    .filter((d) => d.function.type === 'ANNUAL')
    .reduce((s, d) => s + d.savings, 0);

  const fourYearSavings = functionDetails
    .filter((d) => d.function.type === 'FOUR_YEAR')
    .reduce((s, d) => s + d.savings, 0);

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
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
            {t('navigation.savings', 'Savings Accounting')}
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
            Calculated: Balance = Total Income - Total Expenses
          </Text>
        </View>
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
              backgroundColor: colors.savings,
              borderRadius: borderRadius.lg,
              padding: spacing.xl,
              alignItems: 'center',
              ...shadow.md,
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: fontSize.sm, fontWeight: fontWeight.medium, textTransform: 'uppercase' }}>
              Total Community Savings
            </Text>
            <Text style={{ color: 'white', fontSize: 38, fontWeight: fontWeight.bold, marginVertical: spacing.xs }}>
              {formatCurrency(grandTotalSavings)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: fontSize.xs }}>
              Across {functionDetails.length} recorded functions
            </Text>
          </View>

          {/* Opening vs Closing Balance Accounting Ledger Card */}
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.md }}>
              Financial Reconciliation Ledger
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
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm }}>Total Contributions Received</Text>
                </View>
                <Text style={{ color: colors.income, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  +{formatCurrency(grandTotalContributions)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text style={{ color: colors.expense, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>−</Text>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.sm }}>Total Expenses Disbursed</Text>
                </View>
                <Text style={{ color: colors.expense, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  −{formatCurrency(grandTotalExpenses)}
                </Text>
              </View>

              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.xs }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                  Closing Savings Balance
                </Text>
                <Text style={{ color: colors.savings, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
                  {formatCurrency(grandTotalSavings)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Accumulated by Type Cards */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card variant="default" style={{ flex: 1, padding: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Purattasi Sani Savings</Text>
              <Text style={{ color: colors.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: 4 }}>
                {formatCurrency(annualSavings)}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                Yearly functions
              </Text>
            </Card>

            <Card variant="default" style={{ flex: 1, padding: spacing.md }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Gokulaashdami Savings</Text>
              <Text style={{ color: colors.balance, fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: 4 }}>
                {formatCurrency(fourYearSavings)}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 2 }}>
                4-Year cycle
              </Text>
            </Card>
          </View>

          {/* Function Savings Breakdown List */}
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginBottom: spacing.md }}>
              Savings by Function
            </Text>

            <View style={{ gap: spacing.sm }}>
              {functionDetails.map((detail) => (
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
          </View>
        </ScrollView>
      )}
    </View>
  );
}
