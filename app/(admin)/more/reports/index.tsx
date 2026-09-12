import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../src/theme';
import { useFunctionStore } from '../../../../src/store';
import { reportService } from '../../../../src/services';
import { Card, Button, Badge } from '../../../../src/components/ui';
import { getErrorMessage } from '../../../../src/utils';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();
  const { functions, activeFunction } = useFunctionStore();

  const [selectedFunctionId, setSelectedFunctionId] = useState<string>(activeFunction?.id || '');
  const [exportingReport, setExportingReport] = useState<string | null>(null);

  const handleExport = async (reportType: string) => {
    setExportingReport(reportType);
    try {
      const fnId = selectedFunctionId || undefined;
      switch (reportType) {
        case 'contributions':
          await reportService.exportContributionsCSV(fnId);
          break;
        case 'expenses':
          await reportService.exportExpensesCSV(fnId);
          break;
        case 'savings':
          await reportService.exportSavingsCSV(fnId);
          break;
        case 'annual':
          await reportService.exportSavingsCSV(fnId);
          break;
        case 'four_year':
          await reportService.exportSavingsCSV(fnId);
          break;
        default:
          break;
      }
    } catch (e) {
      Alert.alert('Export Failed', getErrorMessage(e));
    } finally {
      setExportingReport(null);
    }
  };

  const reports = [
    {
      id: 'contributions',
      title: 'Contribution Report',
      description: 'Detailed statement of all member contributions with dates, payment methods, and reference IDs.',
      icon: 'arrow-down-circle-outline' as const,
      color: colors.income,
    },
    {
      id: 'expenses',
      title: 'Expense Report',
      description: 'Itemized expenditure log categorized by food, venue, decoration, cultural activities, and more.',
      icon: 'arrow-up-circle-outline' as const,
      color: colors.expense,
    },
    {
      id: 'savings',
      title: 'Savings & Balance Report',
      description: 'Comprehensive accounting summary showing opening balance, total income, total expenses, and net savings.',
      icon: 'wallet-outline' as const,
      color: colors.savings,
    },
    {
      id: 'annual',
      title: 'Annual Financial Statement',
      description: 'Year-end financial statement tailored for general body presentations and community meetings.',
      icon: 'calendar-outline' as const,
      color: colors.primary,
    },
    {
      id: 'four_year',
      title: 'Four-Year Cycle Report',
      description: 'Multi-year financial audit report for 4-year community functions with year-over-year reconciliation.',
      icon: 'bar-chart-outline' as const,
      color: colors.balance,
    },
  ];

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
            Financial Reports
          </Text>
          <Text style={{ color: colors.textTertiary, fontSize: fontSize.xs }}>
            Generate and export CSV records
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}>
        {/* Function Scope Selector */}
        <Card variant="default">
          <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', marginBottom: spacing.xs }}>
            Scope: Filter by Function
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.xs }}>
            <TouchableOpacity
              onPress={() => setSelectedFunctionId('')}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 2,
                borderRadius: borderRadius.md,
                backgroundColor: selectedFunctionId === '' ? colors.primary : colors.surfaceVariant,
                marginRight: spacing.sm,
              }}
            >
              <Text style={{ color: selectedFunctionId === '' ? 'white' : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                All Functions
              </Text>
            </TouchableOpacity>

            {functions.map((fn) => {
              const isSelected = selectedFunctionId === fn.id;
              return (
                <TouchableOpacity
                  key={fn.id}
                  onPress={() => setSelectedFunctionId(fn.id)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs + 2,
                    borderRadius: borderRadius.md,
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                    marginRight: spacing.sm,
                  }}
                >
                  <Text style={{ color: isSelected ? 'white' : colors.textSecondary, fontSize: fontSize.xs, fontWeight: fontWeight.semibold }}>
                    {fn.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Report Cards */}
        {reports.map((report) => {
          const isExporting = exportingReport === report.id;
          return (
            <Card key={report.id} variant="default" padding="md">
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: `${report.color}15`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={report.icon} size={24} color={report.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                      {report.title}
                    </Text>
                    <Badge label="CSV Export" variant="default" size="sm" style={{ marginTop: 2 }} />
                  </View>
                </View>

                <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs, lineHeight: 18 }}>
                  {report.description}
                </Text>

                <Button
                  title={isExporting ? 'Exporting...' : 'Export CSV'}
                  onPress={() => handleExport(report.id)}
                  loading={isExporting}
                  variant="outline"
                  size="sm"
                  leftIcon={<Ionicons name="download-outline" size={16} color={colors.primary} />}
                  style={{ alignSelf: 'flex-start', marginTop: spacing.xs }}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}
