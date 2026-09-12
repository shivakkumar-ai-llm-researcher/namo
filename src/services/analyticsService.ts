import { supabase } from './supabase';
import { AnnualAnalytics, FourYearAnalytics, MonthlyData, CategoryBreakdown, YearlyData } from '../types';
import { ExpenseCategory } from '../types/expense';
import { format } from 'date-fns';

export const analyticsService = {
  async getAnnualAnalytics(functionId: string, year: number): Promise<AnnualAnalytics> {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const [contribResult, expenseResult] = await Promise.all([
      supabase
        .from('contributions')
        .select('amount, payment_date, member_id')
        .eq('function_id', functionId)
        .gte('payment_date', startDate)
        .lte('payment_date', endDate),
      supabase
        .from('expenses')
        .select('amount, expense_date, category')
        .eq('function_id', functionId)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate),
    ]);

    if (contribResult.error) throw contribResult.error;
    if (expenseResult.error) throw expenseResult.error;

    const contributions = contribResult.data ?? [];
    const expenses = expenseResult.data ?? [];

    const totalContributions = contributions.reduce((s, c) => s + Number(c.amount), 0);
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const savings = totalContributions - totalExpenses;
    const contributorCount = new Set(contributions.map(c => c.member_id)).size;
    const averageContribution = contributorCount > 0 ? totalContributions / contributorCount : 0;

    // Monthly breakdown
    const monthlyContributions: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthContribs = contributions.filter(c => new Date(c.payment_date).getMonth() + 1 === month);
      const amount = monthContribs.reduce((s, c) => s + Number(c.amount), 0);
      return { month, year, amount, label: format(new Date(year, i, 1), 'MMM') };
    });

    const monthlyExpenses: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthExpenses = expenses.filter(e => new Date(e.expense_date).getMonth() + 1 === month);
      const amount = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
      return { month, year, amount, label: format(new Date(year, i, 1), 'MMM') };
    });

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    for (const e of expenses) {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + Number(e.amount);
    }
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat as ExpenseCategory,
      amount: amt,
      percentage: totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const largestExpenseCategory = categoryBreakdown[0]?.category ?? null;

    // Get function name
    const { data: fnData } = await supabase.from('functions').select('name').eq('id', functionId).single();

    return {
      year,
      function_id: functionId,
      function_name: fnData?.name ?? '',
      total_contributions: totalContributions,
      total_expenses: totalExpenses,
      savings,
      contributor_count: contributorCount,
      average_contribution: averageContribution,
      largest_expense_category: largestExpenseCategory,
      monthly_contributions: monthlyContributions,
      monthly_expenses: monthlyExpenses,
      category_breakdown: categoryBreakdown,
    };
  },

  async getFourYearAnalytics(functionId: string): Promise<FourYearAnalytics> {
    const { data: fn, error: fnError } = await supabase
      .from('functions')
      .select('*')
      .eq('id', functionId)
      .single();
    if (fnError) throw fnError;

    const startYear = fn.start_year;
    const endYear = fn.end_year ?? fn.start_year + 3;
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) years.push(y);

    const yearlyData: YearlyData[] = await Promise.all(years.map(async (year) => {
      const analytics = await this.getAnnualAnalytics(functionId, year);
      return {
        year,
        income: analytics.total_contributions,
        expenses: analytics.total_expenses,
        savings: analytics.savings,
        contributor_count: analytics.contributor_count,
      };
    }));

    const totalIncome = yearlyData.reduce((s, y) => s + y.income, 0);
    const totalExpenses = yearlyData.reduce((s, y) => s + y.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;

    // Full category breakdown for all years
    const { data: allExpenses } = await supabase
      .from('expenses')
      .select('amount, category')
      .eq('function_id', functionId);

    const categoryTotals: Record<string, number> = {};
    for (const e of (allExpenses ?? [])) {
      categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + Number(e.amount);
    }
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals).map(([cat, amt]) => ({
      category: cat as ExpenseCategory,
      amount: amt,
      percentage: totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      function_id: functionId,
      function_name: fn.name,
      years: yearlyData,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      total_savings: totalSavings,
      category_breakdown: categoryBreakdown,
    };
  },
};
