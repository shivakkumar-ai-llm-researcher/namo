import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useExpenseStore, useFunctionStore } from '../../../src/store';
import { expenseService } from '../../../src/services';
import { Card, Badge, SearchBar, EmptyState, YearTypeFilterBar } from '../../../src/components/ui';
import { formatCurrency, formatDate, formatExpenseCategory, getCategoryIcon } from '../../../src/utils/formatters';
import { ExpenseCategory } from '../../../src/types/expense';
import { FunctionType } from '../../../src/types';

const CATEGORIES: ('all' | ExpenseCategory)[] = [
  'all',
  'food',
  'hall',
  'decoration',
  'transportation',
  'cultural_religious',
  'printing',
  'sound_system',
  'gifts',
  'utilities',
  'miscellaneous',
];

export default function AdminExpensesScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { functions } = useFunctionStore();
  const { expenses, setExpenses } = useExpenseStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ExpenseCategory>('all');
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [selectedType, setSelectedType] = useState<'all' | FunctionType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadExpenses = async () => {
    try {
      const res = await expenseService.getAll({
        limit: 500,
      });
      setExpenses(res.data, res.count);
    } catch (e) {
      console.warn('Error loading expenses:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  // Available years from expenses and functions
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    expenses.forEach((e) => {
      const yr = new Date(e.expense_date).getFullYear();
      if (!isNaN(yr)) yearsSet.add(yr);
      if (e.function?.start_year) yearsSet.add(e.function.start_year);
      if (e.function?.end_year) yearsSet.add(e.function.end_year);
    });
    functions.forEach((f) => {
      yearsSet.add(f.start_year);
      if (f.end_year) yearsSet.add(f.end_year);
    });
    yearsSet.add(2025);
    yearsSet.add(2026);
    yearsSet.add(2029);
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [expenses, functions]);

  // Combined filter: Search + Category + Year + Function Type
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchCat = e.category?.toLowerCase().includes(q);
        const matchRef = e.reference_number?.toLowerCase().includes(q);
        const matchNotes = e.notes?.toLowerCase().includes(q);
        const matchFn = e.function?.name?.toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchRef && !matchNotes && !matchFn) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      // 3. Function Type (ANNUAL vs FOUR_YEAR)
      if (selectedType !== 'all') {
        const fnType = e.function?.type;
        if (fnType && fnType !== selectedType) {
          return false;
        }
      }

      // 4. Year Filter
      if (selectedYear !== 'all') {
        const targetYr = Number(selectedYear);
        const eYear = new Date(e.expense_date).getFullYear();
        const fnStartYr = e.function?.start_year;
        const fnEndYr = e.function?.end_year ?? fnStartYr;
        const matchesDate = eYear === targetYr;
        const matchesFn = (fnStartYr != null && fnEndYr != null)
          ? (targetYr >= fnStartYr && targetYr <= fnEndYr)
          : false;
        if (!matchesDate && !matchesFn) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, search, selectedCategory, selectedType, selectedYear]);

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const isYearOrTypeFiltered = selectedYear !== 'all' || selectedType !== 'all';

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}>
              {t('navigation.expenses', 'Expenses')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              {isYearOrTypeFiltered
                ? `Filtered: ${selectedYear !== 'all' ? selectedYear : 'All Years'} • ${selectedType === 'ANNUAL' ? 'Purattasi Sani' : selectedType === 'FOUR_YEAR' ? 'Gokulaashdami' : 'All Types'}`
                : 'Community Expenses Ledger'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>Total Expenses</Text>
            <Text style={{ color: colors.expense, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              −{formatCurrency(totalFilteredAmount)}
            </Text>
          </View>
        </View>

        {/* Search Bar + Filter Toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search expenses, ref, function..."
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              paddingHorizontal: spacing.sm + 2,
              paddingVertical: 10,
              borderRadius: borderRadius.md,
              backgroundColor: isYearOrTypeFiltered ? colors.primary : colors.surfaceVariant,
              borderWidth: 1,
              borderColor: isYearOrTypeFiltered ? colors.primary : colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons
              name="filter"
              size={18}
              color={isYearOrTypeFiltered ? '#FFFFFF' : colors.textSecondary}
            />
            {isYearOrTypeFiltered && (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FDE68A' }} />
            )}
          </TouchableOpacity>
        </View>

        {/* Collapsible Year + Type Filter Bar */}
        {showFilters && (
          <View style={{ marginTop: spacing.sm }}>
            <YearTypeFilterBar
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              availableYears={availableYears}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              title="Expense Filter"
            />
          </View>
        )}

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs, marginTop: spacing.sm, paddingBottom: 4 }}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                }}
              >
                {category !== 'all' && (
                  <Ionicons
                    name={getCategoryIcon(category) as any}
                    size={12}
                    color={isSelected ? colors.textInverse : colors.textSecondary}
                  />
                )}
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textSecondary,
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  {category === 'all' ? 'All Categories' : formatExpenseCategory(category)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadExpenses(); }} />}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No Expenses Found"
              description="No expense records match your selected year, category, or function filters."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(admin)/expenses/${item.id}`)}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="md">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.surfaceVariant,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={getCategoryIcon(item.category) as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                        {item.description}
                      </Text>

                      {item.function?.name && (
                        <View style={{ marginTop: 3, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Badge
                            label={item.function.name}
                            variant={item.function.type === 'ANNUAL' ? 'info' : 'primary'}
                            size="sm"
                          />
                          {item.function.type && (
                            <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                              {item.function.type === 'ANNUAL' ? 'Purattasi Sani' : 'Gokulaashdami 4-Yr'}
                            </Text>
                          )}
                        </View>
                      )}

                      <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 4 }}>
                        {formatExpenseCategory(item.category)} • {formatDate(item.expense_date)}
                        {item.reference_number ? ` • Ref: ${item.reference_number}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.expense, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginLeft: spacing.sm }}>
                    −{formatCurrency(item.amount)}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/expenses/add')}
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
