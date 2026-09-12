import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/theme';
import { useAuthStore, useFunctionStore } from '../../src/store';
import { functionService, contributionService, expenseService, memberService } from '../../src/services';
import {
  Card,
  StatCard,
  Badge,
  Button,
  EmptyState,
  BalajiNamam,
  BalajiHundi,
  YearTypeFilterBar,
} from '../../src/components/ui';
import { TwoFunctionsHeroCards, FunctionCardSummary } from '../../src/components/functions/TwoFunctionsHeroCards';
import { AiAssistantModal, AiAssistantFab } from '../../src/components/ai';
import { formatCurrency, formatDate, getCategoryIcon } from '../../src/utils/formatters';
import { Contribution, Expense, CommunityFunction, FunctionType, Member } from '../../src/types';
import { ProfileDropdownMenu } from '../../src/components/profile/ProfileDropdownMenu';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { profile } = useAuthStore();
  const { functions, activeFunction, setFunctions, setActiveFunction } = useFunctionStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [annualFn, setAnnualFn] = useState<CommunityFunction | null>(null);
  const [fourYearFn, setFourYearFn] = useState<CommunityFunction | null>(null);

  const [allContributions, setAllContributions] = useState<Contribution[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Filter state for Overview
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [selectedType, setSelectedType] = useState<'all' | FunctionType>('all');

  const [annualSummary, setAnnualSummary] = useState<FunctionCardSummary>({
    contributions: 0,
    expenses: 0,
    balance: 0,
    contributors: 0,
  });
  const [fourYearSummary, setFourYearSummary] = useState<FunctionCardSummary>({
    contributions: 0,
    expenses: 0,
    balance: 0,
    contributors: 0,
  });

  const loadData = async () => {
    try {
      const allFunctions = await functionService.getAll();
      setFunctions(allFunctions);

      const aFn = allFunctions.find((f) => f.type === 'ANNUAL') || allFunctions[0] || null;
      const fyFn = allFunctions.find((f) => f.type === 'FOUR_YEAR') || allFunctions[1] || null;
      setAnnualFn(aFn);
      setFourYearFn(fyFn);

      const targetActive = activeFunction || aFn || allFunctions[0] || null;
      if (!activeFunction && targetActive) {
        setActiveFunction(targetActive);
      }

      // Concurrently fetch all contributions, expenses, and members
      const [allContribsRes, allExpensesRes, membersRes] = await Promise.all([
        contributionService.getAll({ limit: 1000 }),
        expenseService.getAll({ limit: 1000 }),
        memberService.getAll('', 1, 200).catch(() => ({ data: [] })),
      ]);

      const contribs = allContribsRes.data;
      const expenses = allExpensesRes.data;
      setAllContributions(contribs);
      setAllExpenses(expenses);
      if (membersRes?.data) {
        setMembers(membersRes.data);
      }

      // 1. Calculate Annual Summary
      const aContribs = contribs.filter(
        (c) => c.function?.type === 'ANNUAL' || (aFn && c.function_id === aFn.id)
      );
      const aExpenses = expenses.filter(
        (e) => e.function?.type === 'ANNUAL' || (aFn && e.function_id === aFn.id)
      );
      const aTotalC = aContribs.reduce((sum, c) => sum + Number(c.amount), 0);
      const aTotalE = aExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const aContributors = new Set(aContribs.map((c) => c.member_id)).size;
      setAnnualSummary({
        contributions: aTotalC,
        expenses: aTotalE,
        balance: aTotalC - aTotalE,
        contributors: aContributors,
      });

      // 2. Calculate 4-Year Summary
      const fyContribs = contribs.filter(
        (c) => c.function?.type === 'FOUR_YEAR' || (fyFn && c.function_id === fyFn.id)
      );
      const fyExpenses = expenses.filter(
        (e) => e.function?.type === 'FOUR_YEAR' || (fyFn && e.function_id === fyFn.id)
      );
      const fyTotalC = fyContribs.reduce((sum, c) => sum + Number(c.amount), 0);
      const fyTotalE = fyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const fyContributors = new Set(fyContribs.map((c) => c.member_id)).size;
      setFourYearSummary({
        contributions: fyTotalC,
        expenses: fyTotalE,
        balance: fyTotalC - fyTotalE,
        contributors: fyContributors,
      });
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    allContributions.forEach((c) => {
      const yr = new Date(c.payment_date).getFullYear();
      if (!isNaN(yr)) set.add(yr);
      if (c.function?.start_year) set.add(c.function.start_year);
      if (c.function?.end_year) set.add(c.function.end_year);
    });
    allExpenses.forEach((e) => {
      const yr = new Date(e.expense_date).getFullYear();
      if (!isNaN(yr)) set.add(yr);
      if (e.function?.start_year) set.add(e.function.start_year);
      if (e.function?.end_year) set.add(e.function.end_year);
    });
    functions.forEach((f) => {
      set.add(f.start_year);
      if (f.end_year) set.add(f.end_year);
    });
    set.add(2025);
    set.add(2026);
    set.add(2029);
    return Array.from(set).sort((a, b) => a - b);
  }, [allContributions, allExpenses, functions]);

  // Filtered contributions for Overview
  const filteredContributions = useMemo(() => {
    return allContributions.filter((c) => {
      if (selectedType !== 'all') {
        if (c.function?.type && c.function.type !== selectedType) {
          return false;
        }
      }
      if (selectedYear !== 'all') {
        const targetYr = Number(selectedYear);
        const cYear = new Date(c.payment_date).getFullYear();
        const fnStartYr = c.function?.start_year;
        const fnEndYr = c.function?.end_year ?? fnStartYr;
        const matchesDate = cYear === targetYr;
        const matchesFn =
          fnStartYr != null && fnEndYr != null
            ? targetYr >= fnStartYr && targetYr <= fnEndYr
            : false;
        if (!matchesDate && !matchesFn) return false;
      }
      return true;
    });
  }, [allContributions, selectedType, selectedYear]);

  // Filtered expenses for Overview
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e) => {
      if (selectedType !== 'all') {
        if (e.function?.type && e.function.type !== selectedType) {
          return false;
        }
      }
      if (selectedYear !== 'all') {
        const targetYr = Number(selectedYear);
        const eYear = new Date(e.expense_date).getFullYear();
        const fnStartYr = e.function?.start_year;
        const fnEndYr = e.function?.end_year ?? fnStartYr;
        const matchesDate = eYear === targetYr;
        const matchesFn =
          fnStartYr != null && fnEndYr != null
            ? targetYr >= fnStartYr && targetYr <= fnEndYr
            : false;
        if (!matchesDate && !matchesFn) return false;
      }
      return true;
    });
  }, [allExpenses, selectedType, selectedYear]);

  // Dynamic summary for Overview StatCards
  const summary = useMemo(() => {
    const tc = filteredContributions.reduce((sum, c) => sum + Number(c.amount), 0);
    const te = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const bal = tc - te;
    const contributors = new Set(filteredContributions.map((c) => c.member_id)).size;
    return {
      totalContributions: tc,
      totalExpenses: te,
      balance: bal,
      savings: bal,
      contributorCount: contributors,
    };
  }, [filteredContributions, filteredExpenses]);

  const recentContributions = useMemo(() => filteredContributions.slice(0, 5), [filteredContributions]);
  const recentExpenses = useMemo(() => filteredExpenses.slice(0, 5), [filteredExpenses]);

  const handleSelectFunction = (fn: CommunityFunction) => {
    setActiveFunction(fn);
    setSelectedType(fn.type);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isFiltered = selectedYear !== 'all' || selectedType !== 'all';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 54,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 2,
          borderBottomColor: '#D97706',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              padding: 6,
              backgroundColor: colors.primary,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#F59E0B',
            }}
          >
            <BalajiNamam size={28} variant="colored" />
          </View>
          <View>
            <Text style={{ color: '#B45309', fontSize: 10, fontWeight: fontWeight.bold, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              ॥ Govinda Govinda ॥
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              {profile?.full_name || 'Administrator'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => setIsAiModalOpen(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#FEF3C7',
              borderColor: '#F59E0B',
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: borderRadius.full,
              ...shadow.sm,
            }}
          >
            <Ionicons name="sparkles" size={14} color="#D97706" />
            <Text style={{ color: '#B45309', fontSize: 11, fontWeight: fontWeight.bold }}>
              AI Assistant
            </Text>
          </TouchableOpacity>
          <ProfileDropdownMenu variant="admin" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Two Attractive Hero Cards for Purattasi Sani & Gokulaashdami */}
        <TwoFunctionsHeroCards
          annualFunction={annualFn}
          fourYearFunction={fourYearFn}
          activeFunctionId={
            selectedType === 'ANNUAL'
              ? annualFn?.id
              : selectedType === 'FOUR_YEAR'
              ? fourYearFn?.id
              : activeFunction?.id
          }
          onSelectFunction={handleSelectFunction}
          annualSummary={annualSummary}
          fourYearSummary={fourYearSummary}
        />

        {/* Overview Section Header + Year & Function Filters */}
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
                {t('dashboard.overview', 'Overview')}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 1 }}>
                {isFiltered
                  ? `Filtered: ${selectedYear !== 'all' ? selectedYear : 'All Years'} • ${selectedType === 'ANNUAL' ? 'Purattasi Sani' : selectedType === 'FOUR_YEAR' ? 'Gokulaashdami' : 'All Functions'}`
                  : 'Community Financial Summary • நிதி மேலோட்டம்'}
              </Text>
            </View>
            {isFiltered && (
              <Badge
                label={selectedType === 'ANNUAL' ? 'Purattasi Sani' : selectedType === 'FOUR_YEAR' ? 'Gokulaashdami' : `${selectedYear}`}
                variant={selectedType === 'ANNUAL' ? 'info' : selectedType === 'FOUR_YEAR' ? 'primary' : 'default'}
                size="sm"
              />
            )}
          </View>

          {/* Year & Function Filter Bar */}
          <YearTypeFilterBar
            selectedYear={selectedYear}
            onSelectYear={setSelectedYear}
            availableYears={availableYears}
            selectedType={selectedType}
            onSelectType={(type) => {
              setSelectedType(type);
              if (type === 'ANNUAL' && annualFn) setActiveFunction(annualFn);
              else if (type === 'FOUR_YEAR' && fourYearFn) setActiveFunction(fourYearFn);
            }}
            title="Filter Overview (ஆண்டு & திருவிழா வடிகட்டி)"
          />
        </View>

        {/* Financial Overview Cards Grid */}
        <View style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard
              title={t('dashboard.totalContributions', 'Total Contribution')}
              amount={summary.totalContributions}
              color={colors.income}
              bgColor={colors.incomeLight}
              icon={<Ionicons name="trending-up" size={20} color={colors.income} />}
              style={{ flex: 1 }}
              compact
            />
            <StatCard
              title={t('dashboard.totalExpenses', 'Total Expense')}
              amount={summary.totalExpenses}
              color={colors.expense}
              bgColor={colors.expenseLight}
              icon={<Ionicons name="trending-down" size={20} color={colors.expense} />}
              style={{ flex: 1 }}
              compact
            />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard
              title="Srivari Savings"
              amount={summary.savings}
              color={colors.savings}
              bgColor={colors.savingsLight}
              icon={<BalajiHundi size={22} color="#B45309" />}
              style={{ flex: 1 }}
              compact
            />
            <StatCard
              title={t('dashboard.currentBalance', 'Balance')}
              amount={summary.balance}
              color={colors.balance}
              bgColor={colors.balanceLight}
              icon={<Ionicons name="scale" size={20} color={colors.balance} />}
              style={{ flex: 1 }}
              compact
            />
          </View>
        </View>

        {/* Contributors Count Card */}
        <Card variant="default" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: borderRadius.md }}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                {t('dashboard.contributors', 'Contributors')}
              </Text>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>
                {summary.contributorCount} Members
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(admin)/more/members')}>
            <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
              View Members →
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Financial Ratio Bar */}
        {summary.totalContributions > 0 && (
          <Card variant="default">
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: spacing.xs }}>
              Financial Utilization
            </Text>
            <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 5, overflow: 'hidden', flexDirection: 'row' }}>
              <View
                style={{
                  width: `${Math.min(100, Math.round((summary.totalExpenses / summary.totalContributions) * 100))}%`,
                  backgroundColor: colors.expense,
                }}
              />
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.income,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
              <Text style={{ color: colors.expense, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                Expenses: {Math.round((summary.totalExpenses / summary.totalContributions) * 100)}%
              </Text>
              <Text style={{ color: colors.income, fontSize: fontSize.xs, fontWeight: fontWeight.medium }}>
                Savings: {Math.max(0, 100 - Math.round((summary.totalExpenses / summary.totalContributions) * 100))}%
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Actions Grid (Member, Income, Expenses, Savings) */}
        <View style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Quick Actions & Services • விரைவு சேவைகள்
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {/* 1. Add Member */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/members/add')}
              activeOpacity={0.75}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                ...shadow.sm,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="person-add-outline" size={20} color="#2563EB" />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                + Member
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center' }}>
                உறுப்பினர்
              </Text>
            </TouchableOpacity>

            {/* 2. Add Income */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/contributions/add')}
              activeOpacity={0.75}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                ...shadow.sm,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up" size={20} color="#16A34A" />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                + Income
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center' }}>
                வருமானம்
              </Text>
            </TouchableOpacity>

            {/* 3. Add Expense */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/expenses/add')}
              activeOpacity={0.75}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                ...shadow.sm,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-down" size={20} color="#DC2626" />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                + Expense
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center' }}>
                செலவு
              </Text>
            </TouchableOpacity>

            {/* 4. Srivari Savings */}
            <TouchableOpacity
              onPress={() => router.push('/(admin)/savings')}
              activeOpacity={0.75}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                ...shadow.sm,
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="wallet-outline" size={20} color="#7C3AED" />
              </View>
              <Text style={{ color: colors.textPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textAlign: 'center' }}>
                Savings
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 10, textAlign: 'center' }}>
                சேமிப்பு
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Contributions */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              {t('dashboard.recentContributions', 'Recent Contributions')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/contributions')}>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {recentContributions.length === 0 ? (
            <Card variant="outlined" style={{ alignItems: 'center', padding: spacing.lg }}>
              <Text style={{ color: colors.textSecondary }}>No contributions match the selected filter</Text>
            </Card>
          ) : (
            <Card padding="none">
              {recentContributions.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push((`/(admin)/contributions/` + item.id) as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing.md,
                    borderBottomWidth: idx < recentContributions.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0, marginRight: spacing.sm }}>
                    <View style={{ backgroundColor: colors.incomeLight, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ionicons name="arrow-down" size={18} color={colors.income} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }} numberOfLines={1}>
                        {item.member?.full_name || 'Member'}
                      </Text>
                      <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }} numberOfLines={1} ellipsizeMode="tail">
                        {formatDate(item.payment_date)} • {item.payment_method.toUpperCase()}
                        {item.function?.name ? ` • ${item.function.name}` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={{ color: colors.income, fontSize: fontSize.md, fontWeight: fontWeight.bold }} numberOfLines={1}>
                      +{formatCurrency(item.amount)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        {/* Recent Expenses */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              {t('dashboard.recentExpenses', 'Recent Expenses')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/expenses')}>
              <Text style={{ color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold }}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {recentExpenses.length === 0 ? (
            <Card variant="outlined" style={{ alignItems: 'center', padding: spacing.lg }}>
              <Text style={{ color: colors.textSecondary }}>No expenses match the selected filter</Text>
            </Card>
          ) : (
            <Card padding="none">
              {recentExpenses.map((item, idx) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => router.push((`/(admin)/expenses/` + item.id) as any)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: spacing.md,
                    borderBottomWidth: idx < recentExpenses.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0, marginRight: spacing.sm }}>
                    <View style={{ backgroundColor: colors.expenseLight, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ionicons name={getCategoryIcon(item.category) as any} size={18} color={colors.expense} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.semibold }} numberOfLines={1}>
                        {item.description}
                      </Text>
                      <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }} numberOfLines={1} ellipsizeMode="tail">
                        {formatDate(item.expense_date)} • {item.category.replace('_', ' ').toUpperCase()}
                        {item.function?.name ? ` • ${item.function.name}` : ''}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                    <Text style={{ color: colors.expense, fontSize: fontSize.md, fontWeight: fontWeight.bold }} numberOfLines={1}>
                      −{formatCurrency(item.amount)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Floating AI Assistant Action Button */}
      <AiAssistantFab onPress={() => setIsAiModalOpen(true)} />

      {/* Namo AI Assistant Modal */}
      <AiAssistantModal
        visible={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        context={{
          activeFunction,
          functions,
          members,
          summary,
        }}
      />
    </View>
  );
}
