import { create } from 'zustand';
import { Expense, ExpenseFilters } from '../types';

interface ExpenseStore {
  expenses: Expense[];
  totalCount: number;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  setExpenses: (expenses: Expense[], totalCount: number) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  setFilters: (filters: ExpenseFilters) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultFilters: ExpenseFilters = {
  page: 1,
  limit: 20,
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  totalCount: 0,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  setExpenses: (expenses, totalCount) => set({ expenses, totalCount }),
  addExpense: (expense) => set((state) => ({
    expenses: [expense, ...state.expenses],
    totalCount: state.totalCount + 1,
  })),
  updateExpense: (expense) => set((state) => ({
    expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
  })),
  removeExpense: (id) => set((state) => ({
    expenses: state.expenses.filter(e => e.id !== id),
    totalCount: Math.max(0, state.totalCount - 1),
  })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
