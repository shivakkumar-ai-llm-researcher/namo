import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/theme';
import { useContributionStore, useFunctionStore } from '../../../src/store';
import { contributionService } from '../../../src/services';
import { Card, Badge, SearchBar, EmptyState, YearTypeFilterBar } from '../../../src/components/ui';
import { formatCurrency, formatDate, formatPaymentMethod, formatFunctionType } from '../../../src/utils/formatters';
import { Contribution, FunctionType } from '../../../src/types';
import { CommunityPaymentDetailsCard } from '../../../src/components/payment/CommunityPaymentDetailsCard';

export default function AdminContributionsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow, isDark } = useTheme();
  const { functions } = useFunctionStore();
  const { contributions, setContributions } = useContributionStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');
  const [selectedType, setSelectedType] = useState<'all' | FunctionType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const loadContributions = async () => {
    try {
      const res = await contributionService.getAll({
        limit: 500,
      });
      setContributions(res.data, res.count);
    } catch (e) {
      console.warn('Error loading contributions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadContributions();
    }, [])
  );

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    contributions.forEach((c) => {
      const yr = new Date(c.payment_date).getFullYear();
      if (!isNaN(yr)) yearsSet.add(yr);
      if (c.function?.start_year) yearsSet.add(c.function.start_year);
      if (c.function?.end_year) yearsSet.add(c.function.end_year);
    });
    functions.forEach((f) => {
      yearsSet.add(f.start_year);
      if (f.end_year) yearsSet.add(f.end_year);
    });
    yearsSet.add(2025);
    yearsSet.add(2026);
    yearsSet.add(2029);
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [contributions, functions]);

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchMember = c.member?.full_name.toLowerCase().includes(q);
        const matchId = c.member?.member_id.toLowerCase().includes(q);
        const matchRef = c.reference_number?.toLowerCase().includes(q);
        const matchFn = c.function?.name.toLowerCase().includes(q);
        if (!matchMember && !matchId && !matchRef && !matchFn) return false;
      }

      // 2. Payment Method
      if (selectedMethod !== 'all' && c.payment_method !== selectedMethod) {
        return false;
      }

      // 3. Function Type Filter
      if (selectedType !== 'all') {
        const fnType = c.function?.type;
        if (fnType && fnType !== selectedType) {
          return false;
        }
      }

      // 4. Year Filter
      if (selectedYear !== 'all') {
        const targetYr = Number(selectedYear);
        const cYear = new Date(c.payment_date).getFullYear();
        const fnStartYr = c.function?.start_year;
        const fnEndYr = c.function?.end_year ?? fnStartYr;
        const matchesDate = cYear === targetYr;
        const matchesFn = (fnStartYr != null && fnEndYr != null)
          ? (targetYr >= fnStartYr && targetYr <= fnEndYr)
          : false;
        if (!matchesDate && !matchesFn) {
          return false;
        }
      }

      return true;
    });
  }, [contributions, search, selectedMethod, selectedType, selectedYear]);

  const totalFilteredAmount = filtered.reduce((sum, c) => sum + Number(c.amount), 0);
  const isYearOrTypeFiltered = selectedYear !== 'all' || selectedType !== 'all';

  const methods = ['all', 'upi', 'bank_transfer', 'cash', 'other'];

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
              {t('navigation.contributions', 'Contributions')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>
              {isYearOrTypeFiltered
                ? `Filtered: ${selectedYear !== 'all' ? selectedYear : 'All Years'} • ${selectedType === 'ANNUAL' ? 'Purattasi Sani' : selectedType === 'FOUR_YEAR' ? 'Gokulaashdami' : 'All Types'}`
                : 'Srivari Income Seva Ledger'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>Total Income</Text>
            <Text style={{ color: colors.income, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              +{formatCurrency(totalFilteredAmount)}
            </Text>
          </View>
        </View>

        {/* Community Bank & UPI Bar */}
        <TouchableOpacity
          onPress={() => setShowBankModal(true)}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isDark ? '#1E293B' : '#FFFBEB',
            paddingVertical: spacing.xs + 2,
            paddingHorizontal: spacing.sm + 2,
            borderRadius: borderRadius.md,
            borderWidth: 1,
            borderColor: '#FDE68A',
            marginBottom: spacing.xs,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#FEF3C7',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="qr-code" size={16} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#B45309' }}>
                Bank & UPI QR Scanner Details
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                கணக்கு எண், IFSC & UPI ஸ்கேனர் பார்க்க தட்டவும்
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ fontSize: 11, fontWeight: fontWeight.bold, color: '#D97706' }}>View</Text>
            <Ionicons name="chevron-forward" size={16} color="#D97706" />
          </View>
        </TouchableOpacity>

        {/* Search Bar + Filter Toggle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search member, ref, function..."
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

        {/* Collapsible / Expandable Year + Type Filter Bar */}
        {showFilters && (
          <View style={{ marginTop: spacing.sm }}>
            <YearTypeFilterBar
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              availableYears={availableYears}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              title="Income Filter"
            />
          </View>
        )}

        {/* Payment Method chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, marginTop: spacing.sm, paddingBottom: 4 }}>
          {methods.map((method) => {
            const isSelected = selectedMethod === method;
            return (
              <TouchableOpacity
                key={method}
                onPress={() => setSelectedMethod(method)}
                style={{
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                  backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? colors.textInverse : colors.textSecondary,
                    fontSize: fontSize.xs,
                    fontWeight: isSelected ? fontWeight.bold : fontWeight.medium,
                    textTransform: 'capitalize',
                  }}
                >
                  {method === 'all' ? 'All Methods' : formatPaymentMethod(method as any)}
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
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadContributions(); }} />}
          ListEmptyComponent={
            <EmptyState
              icon="cash-outline"
              title="No Contributions Found"
              description="No contribution records match your search criteria or selected filters."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(('/(admin)/contributions/' + item.id) as any)}
            >
              <Card variant="default" padding="md">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
                      <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                        {item.member?.full_name || 'Unknown Member'}
                      </Text>
                      {item.member?.member_id && (
                        <Badge label={item.member.member_id} variant="default" size="sm" />
                      )}
                    </View>

                    {item.function?.name && (
                      <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Badge
                          label={item.function.name}
                          variant={item.function.type === 'ANNUAL' ? 'info' : 'primary'}
                          size="sm"
                        />
                        {item.function.type && (
                          <Text style={{ color: colors.textTertiary, fontSize: 10 }}>
                            {formatFunctionType(item.function.type)}
                          </Text>
                        )}
                      </View>
                    )}

                    <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs, marginTop: 4 }}>
                      {formatDate(item.payment_date)} • {formatPaymentMethod(item.payment_method)}
                      {item.reference_number ? ` • Ref: ${item.reference_number}` : ''}
                    </Text>
                    {item.notes ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2, fontStyle: 'italic' }} numberOfLines={1}>
                        {item.notes}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flexShrink: 0, alignItems: 'flex-end', marginLeft: spacing.sm }}>
                    <Text style={{ color: colors.income, fontSize: fontSize.lg, fontWeight: fontWeight.bold }} numberOfLines={1}>
                      +{formatCurrency(item.amount)}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/contributions/add')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          backgroundColor: colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          ...shadow.lg,
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal for Community Bank & UPI QR */}
      <Modal visible={showBankModal} transparent animationType="slide" onRequestClose={() => setShowBankModal(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              paddingTop: spacing.md,
              paddingBottom: spacing.xxl,
              paddingHorizontal: spacing.lg,
              maxHeight: '90%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <View>
                <Text style={{ fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary }}>
                  Community Bank & UPI Account
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.textSecondary }}>
                  வங்கி & UPI கணக்கு விவரங்கள்
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowBankModal(false)}>
                <Ionicons name="close-circle" size={26} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
              <CommunityPaymentDetailsCard
                showAdminEdit={true}
                onEditPress={() => {
                  setShowBankModal(false);
                  router.push('/(admin)/more/payment-settings');
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
