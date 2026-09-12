import { supabase } from './supabase';
import { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseFilters } from '../types';
import { auditService } from './auditService';

const EXPENSE_SELECT = `
  *,
  function:functions(id, name, type, start_year, end_year)
`;

export const expenseService = {
  async getAll(filters: ExpenseFilters = {}): Promise<{ data: Expense[]; count: number }> {
    const { page = 1, limit = 20, function_id, category, from_date, to_date } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('expenses')
      .select(EXPENSE_SELECT, { count: 'exact' });

    if (function_id) query = query.eq('function_id', function_id);
    if (category) query = query.eq('category', category);
    if (from_date) query = query.gte('expense_date', from_date);
    if (to_date) query = query.lte('expense_date', to_date);

    const { data, error, count } = await query
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('expenseService.getAll error:', error.message);
      throw new Error(`Failed to load expenses: ${error.message}`);
    }

    // Empty array is valid — do NOT fall back to mock data
    return { data: (data as Expense[]) ?? [], count: count ?? 0 };
  },

  async getById(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .select(EXPENSE_SELECT)
      .eq('id', id)
      .single();
    if (error) throw new Error(`Failed to load expense: ${error.message}`);
    return data as Expense;
  },

  async getRecent(functionId: string, limit = 5): Promise<Expense[]> {
    let query = supabase
      .from('expenses')
      .select(EXPENSE_SELECT)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (functionId) query = query.eq('function_id', functionId);
    const { data, error } = await query;
    if (error) {
      console.error('getRecent expenses error:', error.message);
      return [];
    }
    return (data as Expense[]) ?? [];
  },

  async create(input: CreateExpenseInput, userId: string): Promise<Expense> {
    if (!userId) {
      throw new Error('Authentication required. Please log in again.');
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...input, created_by: userId })
      .select(EXPENSE_SELECT)
      .single();

    if (error) {
      console.error('Expense insert error:', error.message, error.code);
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can record expenses.');
      }
      throw new Error(`Failed to save expense: ${error.message}`);
    }

    auditService.log(userId, 'created', 'expense', (data as Expense).id, null, input as any)
      .catch((e) => console.warn('Audit log failed:', e));

    return data as Expense;
  },

  async update(id: string, input: UpdateExpenseInput, userId: string): Promise<Expense> {
    if (!userId) throw new Error('Authentication required.');

    const previous = await this.getById(id);

    const { data, error } = await supabase
      .from('expenses')
      .update(input)
      .eq('id', id)
      .select(EXPENSE_SELECT)
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can modify expenses.');
      }
      throw new Error(`Failed to update expense: ${error.message}`);
    }

    auditService.log(userId, 'updated', 'expense', id, previous as any, input as any)
      .catch((e) => console.warn('Audit log failed:', e));

    return data as Expense;
  },

  async delete(id: string, userId: string): Promise<void> {
    if (!userId) throw new Error('Authentication required.');

    const previous = await this.getById(id);

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can delete expenses.');
      }
      throw new Error(`Failed to delete expense: ${error.message}`);
    }

    auditService.log(userId, 'deleted', 'expense', id, previous as any, null)
      .catch((e) => console.warn('Audit log failed:', e));
  },

  async getByCategory(functionId: string): Promise<{ category: string; amount: number; percentage: number }[]> {
    // Use database query instead of local array
    let query = supabase
      .from('expenses')
      .select('category, amount');
    if (functionId) query = query.eq('function_id', functionId);
    const { data, error } = await query;
    if (error) {
      console.error('getByCategory error:', error.message);
      return [];
    }
    const list = (data as { category: string; amount: number }[]) ?? [];
    const total = list.reduce((sum, e) => sum + Number(e.amount), 0) || 1;
    const catMap: Record<string, number> = {};
    list.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });
    return Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / total) * 100),
    }));
  },
};
