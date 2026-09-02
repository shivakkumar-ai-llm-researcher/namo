import { ExpenseCategory } from './expense';

export interface AnnualAnalytics {
  year: number;
  function_id: string;
  function_name: string;
  total_contributions: number;
  total_expenses: number;
  savings: number;
  contributor_count: number;
  average_contribution: number;
  largest_expense_category: ExpenseCategory | null;
  monthly_contributions: MonthlyData[];
  monthly_expenses: MonthlyData[];
  category_breakdown: CategoryBreakdown[];
}

export interface FourYearAnalytics {
  function_id: string;
  function_name: string;
  years: YearlyData[];
  total_income: number;
  total_expenses: number;
  total_savings: number;
  category_breakdown: CategoryBreakdown[];
}

export interface YearlyData {
  year: number;
  income: number;
  expenses: number;
  savings: number;
  contributor_count: number;
}

export interface MonthlyData {
  month: number;
  year: number;
  amount: number;
  label: string;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface DashboardSummary {
  total_contributions: number;
  total_expenses: number;
  balance: number;
  contributor_count: number;
  recent_contributions: import('./contribution').Contribution[];
  recent_expenses: import('./expense').Expense[];
}