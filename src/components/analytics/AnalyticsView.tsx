'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle2,
  CreditCard,
  Building2,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { contributionService, expenseService, functionService } from '@/services';
import { formatCurrency, formatExpenseCategory, getCategoryEmoji } from '@/utils/formatters';
import type { CommunityFunction, Contribution, Expense, ExpenseCategory, FunctionType } from '@/types';

const CATEGORY_COLORS = [
  '#851D1D',
  '#D97706',
  '#15803D',
  '#0369A1',
  '#7C3AED',
  '#DC2626',
  '#B45309',
  '#064E3B',
  '#1D4ED8',
  '#9A3412',
];

interface AnalyticsViewProps {
  portalType?: 'admin' | 'visitor';
}

export function AnalyticsView({ portalType = 'admin' }: AnalyticsViewProps) {
  const [functions, setFunctions] = useState<CommunityFunction[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedFunctionType, setSelectedFunctionType] = useState<'all' | FunctionType>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [chartViewMode, setChartViewMode] = useState<'yearly' | 'monthly'>('yearly');

  useEffect(() => {
    async function loadData() {
      try {
        const [fns, csRes, esRes] = await Promise.all([
          functionService.getAll(),
          contributionService.getAll({ limit: 1000 }),
          expenseService.getAll({ limit: 1000 }),
        ]);
        setFunctions(fns);
        setContributions(csRes.data);
        setExpenses(esRes.data);
      } catch (err) {
        console.error('Failed to load analytics data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Primary functions mapping
  const annualFn = useMemo(() => functions.find((f) => f.type === 'ANNUAL') || null, [functions]);
  const fourYearFn = useMemo(() => functions.find((f) => f.type === 'FOUR_YEAR') || null, [functions]);

  // Extract all distinct years from data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    contributions.forEach((c) => {
      if (c.payment_date) years.add(c.payment_date.slice(0, 4));
    });
    expenses.forEach((e) => {
      if (e.expense_date) years.add(e.expense_date.slice(0, 4));
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [contributions, expenses]);

  // Filtered contributions & expenses based on active filters
  const filteredData = useMemo(() => {
    let cs = contributions;
    let es = expenses;

    // Filter by function type
    if (selectedFunctionType !== 'all') {
      cs = cs.filter((c) => {
        if (c.function?.type) return c.function.type === selectedFunctionType;
        if (selectedFunctionType === 'ANNUAL' && annualFn) return c.function_id === annualFn.id;
        if (selectedFunctionType === 'FOUR_YEAR' && fourYearFn) return c.function_id === fourYearFn.id;
        return true;
      });
      es = es.filter((e) => {
        if (e.function?.type) return e.function.type === selectedFunctionType;
        if (selectedFunctionType === 'ANNUAL' && annualFn) return e.function_id === annualFn.id;
        if (selectedFunctionType === 'FOUR_YEAR' && fourYearFn) return e.function_id === fourYearFn.id;
        return true;
      });
    }

    // Filter by year
    if (selectedYear !== 'all') {
      cs = cs.filter((c) => c.payment_date && c.payment_date.startsWith(selectedYear));
      es = es.filter((e) => e.expense_date && e.expense_date.startsWith(selectedYear));
    }

    const totalIncome = cs.reduce((sum, c) => sum + Number(c.amount), 0);
    const totalExpenses = es.reduce((sum, e) => sum + Number(e.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

    return {
      contributions: cs,
      expenses: es,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate: Number(savingsRate),
    };
  }, [contributions, expenses, selectedFunctionType, selectedYear, annualFn, fourYearFn]);

  // Two Primary Functions Dedicated Breakdown (Unfiltered by function selector for side-by-side comparison)
  const annualMetrics = useMemo(() => {
    const cs = contributions.filter(
      (c) => c.function?.type === 'ANNUAL' || (annualFn && c.function_id === annualFn.id)
    );
    const es = expenses.filter(
      (e) => e.function?.type === 'ANNUAL' || (annualFn && e.function_id === annualFn.id)
    );
    const income = cs.reduce((s, c) => s + Number(c.amount), 0);
    const expense = es.reduce((s, e) => s + Number(e.amount), 0);
    const balance = income - expense;
    const contributors = new Set(cs.map((c) => c.member_id)).size;
    const savingsPercent = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expense, balance, contributors, count: cs.length, savingsPercent };
  }, [contributions, expenses, annualFn]);

  const fourYearMetrics = useMemo(() => {
    const cs = contributions.filter(
      (c) => c.function?.type === 'FOUR_YEAR' || (fourYearFn && c.function_id === fourYearFn.id)
    );
    const es = expenses.filter(
      (e) => e.function?.type === 'FOUR_YEAR' || (fourYearFn && e.function_id === fourYearFn.id)
    );
    const income = cs.reduce((s, c) => s + Number(c.amount), 0);
    const expense = es.reduce((s, e) => s + Number(e.amount), 0);
    const balance = income - expense;
    const contributors = new Set(cs.map((c) => c.member_id)).size;
    const savingsPercent = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expense, balance, contributors, count: cs.length, savingsPercent };
  }, [contributions, expenses, fourYearFn]);

  // Yearly comparison dataset for charts
  const yearlyChartData = useMemo(() => {
    const yearMap: Record<string, { year: string; income: number; expense: number; savings: number }> = {};
    filteredData.contributions.forEach((c) => {
      const yr = c.payment_date?.slice(0, 4) || 'Unknown';
      if (!yearMap[yr]) yearMap[yr] = { year: yr, income: 0, expense: 0, savings: 0 };
      yearMap[yr].income += Number(c.amount);
    });
    filteredData.expenses.forEach((e) => {
      const yr = e.expense_date?.slice(0, 4) || 'Unknown';
      if (!yearMap[yr]) yearMap[yr] = { year: yr, income: 0, expense: 0, savings: 0 };
      yearMap[yr].expense += Number(e.amount);
    });
    return Object.values(yearMap)
      .map((item) => ({ ...item, savings: item.income - item.expense }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [filteredData]);

  // Monthly comparison dataset for charts
  const monthlyChartData = useMemo(() => {
    const monthMap: Record<string, { month: string; income: number; expense: number; savings: number }> = {};
    filteredData.contributions.forEach((c) => {
      const m = c.payment_date?.slice(0, 7) || 'Unknown';
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0, savings: 0 };
      monthMap[m].income += Number(c.amount);
    });
    filteredData.expenses.forEach((e) => {
      const m = e.expense_date?.slice(0, 7) || 'Unknown';
      if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0, savings: 0 };
      monthMap[m].expense += Number(e.amount);
    });
    return Object.values(monthMap)
      .map((item) => ({ ...item, savings: item.income - item.expense }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [filteredData]);

  // Detailed Yearly Breakdown Rows (combining year + function)
  const yearlyBreakdownTable = useMemo(() => {
    interface TableRow {
      year: string;
      functionName: string;
      functionType: FunctionType;
      income: number;
      expense: number;
      savings: number;
      savingsRate: number;
    }
    const rowMap: Record<string, TableRow> = {};

    contributions.forEach((c) => {
      const yr = c.payment_date?.slice(0, 4) || '2026';
      const isAnnual = c.function?.type === 'ANNUAL' || (annualFn && c.function_id === annualFn.id);
      const fnType: FunctionType = isAnnual ? 'ANNUAL' : 'FOUR_YEAR';
      const fnName = isAnnual ? 'Purattasi Sani Kiyamai' : 'Gokulaashdami 4-Year Festival';
      const key = `${yr}_${fnType}`;

      if (!rowMap[key]) {
        rowMap[key] = {
          year: yr,
          functionName: fnName,
          functionType: fnType,
          income: 0,
          expense: 0,
          savings: 0,
          savingsRate: 0,
        };
      }
      rowMap[key].income += Number(c.amount);
    });

    expenses.forEach((e) => {
      const yr = e.expense_date?.slice(0, 4) || '2026';
      const isAnnual = e.function?.type === 'ANNUAL' || (annualFn && e.function_id === annualFn.id);
      const fnType: FunctionType = isAnnual ? 'ANNUAL' : 'FOUR_YEAR';
      const fnName = isAnnual ? 'Purattasi Sani Kiyamai' : 'Gokulaashdami 4-Year Festival';
      const key = `${yr}_${fnType}`;

      if (!rowMap[key]) {
        rowMap[key] = {
          year: yr,
          functionName: fnName,
          functionType: fnType,
          income: 0,
          expense: 0,
          savings: 0,
          savingsRate: 0,
        };
      }
      rowMap[key].expense += Number(e.amount);
    });

    return Object.values(rowMap)
      .map((r) => {
        const savings = r.income - r.expense;
        const rate = r.income > 0 ? Math.round((savings / r.income) * 100) : 0;
        return { ...r, savings, savingsRate: rate };
      })
      .filter((r) => {
        if (selectedFunctionType !== 'all' && r.functionType !== selectedFunctionType) return false;
        if (selectedYear !== 'all' && r.year !== selectedYear) return false;
        return true;
      })
      .sort((a, b) => b.year.localeCompare(a.year) || a.functionName.localeCompare(b.functionName));
  }, [contributions, expenses, annualFn, selectedFunctionType, selectedYear]);

  // Expense Categories distribution
  const categoryData = useMemo(() => {
    const catMap: Partial<Record<ExpenseCategory, number>> = {};
    filteredData.expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name: formatExpenseCategory(name as ExpenseCategory),
        category: name as ExpenseCategory,
        value,
        percentage:
          filteredData.totalExpenses > 0
            ? Math.round((value / filteredData.totalExpenses) * 100)
            : 0,
      }));
  }, [filteredData]);

  // Payment methods breakdown
  const paymentMethodData = useMemo(() => {
    const pMap: Record<string, { count: number; total: number }> = {};
    filteredData.contributions.forEach((c) => {
      const m = c.payment_method || 'other';
      if (!pMap[m]) pMap[m] = { count: 0, total: 0 };
      pMap[m].count += 1;
      pMap[m].total += Number(c.amount);
    });
    return Object.entries(pMap).map(([method, val]) => ({
      method,
      label: method === 'upi' ? 'UPI' : method === 'bank_transfer' ? 'Bank Transfer' : method === 'cash' ? 'Cash' : 'Other',
      ...val,
    }));
  }, [filteredData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div
          className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
        />
        <p className="text-sm font-semibold text-stone-500">
          Loading Community Financial Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2 shadow-sm" style={{ backgroundColor: '#851D1D', color: '#FEF3C7' }}>
            <Sparkles size={13} className="text-amber-300" />
            <span>FINANCIAL ANALYTICS & INSIGHTS • நிதி பகுப்பாய்வு</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            Financial Trends & Community Functions
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive yearly analysis of Purattasi Sani Kiyamai & Gokulaashdami 4-Year Festival funds.
          </p>
        </div>

        {/* Portal badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm" style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            {portalType === 'admin' ? '👑 Admin Mode' : '🙏 Devotee View'}
          </span>
        </div>
      </div>

      {/* ── Interactive Filter Controls ── */}
      <div
        className="p-4 rounded-2xl border shadow-sm space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Function Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider mr-1 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Layers size={14} /> Function:
            </span>
            <button
              onClick={() => setSelectedFunctionType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                selectedFunctionType === 'all'
                  ? 'text-white border-transparent'
                  : 'hover:opacity-80'
              }`}
              style={
                selectedFunctionType === 'all'
                  ? { backgroundColor: '#851D1D', borderColor: '#F59E0B' }
                  : { backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }
              }
            >
              All Functions • அனைத்தும்
            </button>
            <button
              onClick={() => setSelectedFunctionType('ANNUAL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                selectedFunctionType === 'ANNUAL'
                  ? 'text-white border-transparent'
                  : 'hover:opacity-80'
              }`}
              style={
                selectedFunctionType === 'ANNUAL'
                  ? { backgroundColor: '#851D1D', borderColor: '#F59E0B' }
                  : { backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }
              }
            >
              🛕 Annual (Purattasi Sani)
            </button>
            <button
              onClick={() => setSelectedFunctionType('FOUR_YEAR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                selectedFunctionType === 'FOUR_YEAR'
                  ? 'text-white border-transparent'
                  : 'hover:opacity-80'
              }`}
              style={
                selectedFunctionType === 'FOUR_YEAR'
                  ? { backgroundColor: '#064E3B', borderColor: '#10B981' }
                  : { backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' }
              }
            >
              🕉️ 4-Year (Gokulaashdami)
            </button>
          </div>

          {/* Year Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider mr-1 flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={14} /> Year:
            </span>
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                selectedYear === 'all' ? 'text-white' : ''
              }`}
              style={
                selectedYear === 'all'
                  ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }
                  : { backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
              }
            >
              All Years
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                  selectedYear === yr ? 'text-white' : ''
                }`}
                style={
                  selectedYear === yr
                    ? { backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }
                    : { backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Key KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div
          className="p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Total Income • வரவு
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatCurrency(filteredData.totalIncome)}
            </div>
            <p className="text-[11px] mt-1 text-stone-500 font-medium">
              {filteredData.contributions.length} contributions received
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Total Expenses */}
        <div
          className="p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Total Expenses • செலவு
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
              <TrendingDown size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
              {formatCurrency(filteredData.totalExpenses)}
            </div>
            <p className="text-[11px] mt-1 text-stone-500 font-medium">
              {filteredData.expenses.length} expense vouchers recorded
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
        </div>

        {/* Net Savings / Balance */}
        <div
          className="p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Net Savings • நிகர சேமிப்பு
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(filteredData.netSavings)}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300">
                {filteredData.netSavings >= 0 ? 'Surplus • நிதி உபரி' : 'Deficit'}
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* Savings Rate */}
        <div
          className="p-5 rounded-2xl border shadow-sm relative overflow-hidden transition-all hover:shadow-md"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Savings Rate • சேமிப்பு விகிதம்
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
              <Percent size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {filteredData.savingsRate}%
            </div>
            <p className="text-[11px] mt-1 text-stone-500 font-medium">
              Of collected fund preserved for community
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>
      </div>

      {/* ── Two Primary Functions Side-by-Side Comparison ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={18} style={{ color: 'var(--gold)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Our Two Primary Community Functions • இரு பெருவிழா ஒப்பீடு
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Annual Function */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg border"
            style={{ backgroundColor: '#851D1D', borderColor: '#F59E0B' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-400" />
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-900 mb-1">
                  ANNUAL FUNCTION • ஆண்டு பெருவிழா
                </span>
                <h3 className="text-xl font-extrabold text-white">Purattasi Sani Kiyamai</h3>
                <p className="text-xs" style={{ color: '#FDE68A' }}>
                  புரட்டாசி சனிக்கிழமை • {annualFn?.name || '2026 Purattasi Sani Kiyamai'}
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-black/40 border border-yellow-400/40 text-yellow-300">
                Active • 2026
              </span>
            </div>

            <div className="bg-black/30 rounded-xl p-3 my-3 border-l-4 border-yellow-400 text-xs">
              <p className="font-semibold text-yellow-100">
                Lord Venkateswara Thaligai, Thirumanjanam, Deepam Aradhana & Annadhanam Feast.
              </p>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-black/30 rounded-xl p-3 text-center mb-3">
              <div>
                <div className="text-[10px] text-stone-300 font-medium">Income (வரவு)</div>
                <div className="text-sm font-black text-emerald-300 mt-0.5">
                  +{formatCurrency(annualMetrics.income)}
                </div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-[10px] text-stone-300 font-medium">Expenses (செலவு)</div>
                <div className="text-sm font-black text-rose-300 mt-0.5">
                  -{formatCurrency(annualMetrics.expense)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-300 font-medium">Savings (இருப்பு)</div>
                <div className="text-sm font-black text-amber-300 mt-0.5">
                  {formatCurrency(annualMetrics.balance)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-amber-200">
                <span>Fund Utilization</span>
                <span>{annualMetrics.savingsPercent}% Net Balance Preserved</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
                  style={{ width: `${Math.min(Math.max(annualMetrics.savingsPercent, 5), 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-amber-100">
              <span>👥 {annualMetrics.contributors} Active Devotee Contributors</span>
              <span>📋 {annualMetrics.count} Transactions</span>
            </div>
          </div>

          {/* Card 2: 4-Year Function */}
          <div
            className="rounded-2xl p-5 text-white relative overflow-hidden shadow-lg border"
            style={{ backgroundColor: '#064E3B', borderColor: '#10B981' }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-400" />
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-stone-900 mb-1">
                  4-YEAR FUNCTION • நான்கு ஆண்டு பெருவிழா
                </span>
                <h3 className="text-xl font-extrabold text-white">Gokulaashdami Maha Festival</h3>
                <p className="text-xs" style={{ color: '#A7F3D0' }}>
                  கோகுலாஷ்டமி 4 வருட பெருவிழா • {fourYearFn?.name || '2026-2029 Quadrennial Cycle'}
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-black/40 border border-emerald-400/40 text-emerald-300">
                2026–2029 Cycle
              </span>
            </div>

            <div className="bg-black/30 rounded-xl p-3 my-3 border-l-4 border-emerald-400 text-xs">
              <p className="font-semibold text-emerald-100">
                Quadrennial Sri Krishna Janmashtami, Uriyadi, Cultural Initiatives & Grand Community Seva.
              </p>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-black/30 rounded-xl p-3 text-center mb-3">
              <div>
                <div className="text-[10px] text-stone-300 font-medium">Income (வரவு)</div>
                <div className="text-sm font-black text-emerald-300 mt-0.5">
                  +{formatCurrency(fourYearMetrics.income)}
                </div>
              </div>
              <div className="border-x border-white/15">
                <div className="text-[10px] text-stone-300 font-medium">Expenses (செலவு)</div>
                <div className="text-sm font-black text-rose-300 mt-0.5">
                  -{formatCurrency(fourYearMetrics.expense)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-stone-300 font-medium">Savings (இருப்பு)</div>
                <div className="text-sm font-black text-emerald-300 mt-0.5">
                  {formatCurrency(fourYearMetrics.balance)}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-emerald-200">
                <span>Fund Utilization</span>
                <span>{fourYearMetrics.savingsPercent}% Net Balance Preserved</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
                  style={{ width: `${Math.min(Math.max(fourYearMetrics.savingsPercent, 5), 100)}%` }}
                />
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
              <span>👥 {fourYearMetrics.contributors} Active Devotee Contributors</span>
              <span>📋 {fourYearMetrics.count} Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Financial Trends Visual Bar Chart ── */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              {chartViewMode === 'yearly'
                ? 'Yearly Financial Breakdown: Income vs Expenses vs Savings'
                : 'Monthly Income vs Expenses vs Savings Trend'}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {chartViewMode === 'yearly'
                ? 'ஆண்டு வாரியான வரவு, செலவு மற்றும் சேமிப்பு போக்கு'
                : 'மாதாந்திர நிதி விவரங்கள்'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setChartViewMode('yearly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                chartViewMode === 'yearly'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Yearly View • ஆண்டு
            </button>
            <button
              onClick={() => setChartViewMode('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                chartViewMode === 'monthly'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Monthly View • மாதம்
            </button>
          </div>
        </div>

        {/* Chart Content */}
        {chartViewMode === 'yearly' ? (
          yearlyChartData.length === 0 ? (
            <p className="text-center py-12 text-sm text-stone-500">No yearly transactions found</p>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyChartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#78716C' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#78716C' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(Number(v)), '']}
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#15803D" name="Income (வரவு)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#DC2626" name="Expenses (செலவு)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" fill="#D97706" name="Savings (சேமிப்பு)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        ) : monthlyChartData.length === 0 ? (
          <p className="text-center py-12 text-sm text-stone-500">No monthly transactions found</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} />
                <YAxis tick={{ fontSize: 11, fill: '#78716C' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => [formatCurrency(Number(v)), '']}
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="income" fill="#15803D" name="Income (வரவு)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#DC2626" name="Expenses (செலவு)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings" fill="#D97706" name="Savings (சேமிப்பு)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Yearly Breakdown Table ── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
              Yearly Financial Breakdown Table • ஆண்டு நிதி அறிக்கை
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Granular breakdown per year and primary community function
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs font-bold uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <th className="py-3 px-3">Year • ஆண்டு</th>
                <th className="py-3 px-3">Primary Function • பெருவிழா</th>
                <th className="py-3 px-3 text-right">Income • வரவு</th>
                <th className="py-3 px-3 text-right">Expenses • செலவு</th>
                <th className="py-3 px-3 text-right">Net Savings • இருப்பு</th>
                <th className="py-3 px-3 text-center">Savings Rate</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {yearlyBreakdownTable.map((row, idx) => (
                <tr key={`${row.year}_${row.functionName}_${idx}`} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-bold" style={{ color: 'var(--text-primary)' }}>
                    <span className="px-2.5 py-1 rounded-md text-xs bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                      {row.year}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                      <span>{row.functionType === 'ANNUAL' ? '🛕' : '🕉️'}</span>
                      <span>{row.functionName}</span>
                    </div>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {row.functionType === 'ANNUAL' ? 'Annual Festival' : '4-Year Quadrennial Cycle'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-400">
                    +{formatCurrency(row.income)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-rose-700 dark:text-rose-400">
                    -{formatCurrency(row.expense)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-amber-600 dark:text-amber-400">
                    {formatCurrency(row.savings)}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${row.savingsRate >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800'}`}>
                      {row.savingsRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/40">
                      <CheckCircle2 size={12} /> Surplus
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Category Breakdown & Payment Methods ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="font-bold text-base sm:text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
              Expense Breakdown by Category • செலவு வகைப்பாடு
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Expenditure distribution across catering, hall rental, decoration, nadaswaram, etc.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Donut Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {categoryData.map((cat, i) => (
                  <div
                    key={cat.name}
                    className="flex justify-between items-center text-xs py-1.5 px-2 rounded-lg border"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-variant)' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {getCategoryEmoji(cat.category)} {cat.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold ml-2" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(cat.value)}
                      </span>
                      <span className="text-[10px] text-stone-500 ml-1">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Methods (1 Col) */}
        <div>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={18} style={{ color: 'var(--gold)' }} />
              <h3 className="font-bold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                Payment Channels
              </h3>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Devotee contribution payment methods • செலுத்துகை வழிகள்
            </p>

            <div className="space-y-3">
              {paymentMethodData.map((pm) => (
                <div
                  key={pm.method}
                  className="p-3 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <div className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {pm.label}
                    </div>
                    <div className="text-[10px] text-stone-500">{pm.count} transactions</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(pm.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
              <p className="font-bold text-amber-900 dark:text-amber-300">
                ✨ Transparency & Seva
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                All community funds are 100% transparently maintained for temple poojas, annadhanam, and cultural functions.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
