import { supabase } from '../lib/supabase';
import type { Member, CreateMemberInput, UpdateMemberInput, Contribution, CreateContributionInput, UpdateContributionInput, ContributionFilters, Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseFilters, CommunityFunction, CreateFunctionInput, UpdateFunctionInput, Profile } from '../types';

// ─── Auth ───────────────────────────────────────────────
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() {
    await supabase.auth.signOut();
  },
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw error;
  },
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  async getProfile(userId: string, email?: string): Promise<Profile> {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) return data as Profile;
    } catch {}
    return { id: userId, role: 'visitor', full_name: email?.split('@')[0] ?? 'User', avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  },
};

// ─── Members ─────────────────────────────────────────────
export const memberService = {
  async getAll(search = '', page = 1, limit = 50): Promise<{ data: Member[]; total: number }> {
    let query = supabase.from('members').select('*', { count: 'exact' }).order('full_name');
    if (search) query = query.ilike('full_name', `%${search}%`);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data ?? []) as Member[], total: count ?? 0 };
  },
  async getById(id: string): Promise<Member> {
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Member;
  },
  async create(input: CreateMemberInput): Promise<Member> {
    const { data, error } = await supabase.from('members').insert(input).select().single();
    if (error) throw error;
    return data as Member;
  },
  async update(id: string, input: UpdateMemberInput): Promise<Member> {
    const { data, error } = await supabase.from('members').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Member;
  },
};

// ─── Contributions ───────────────────────────────────────
export const contributionService = {
  async getAll(filters: ContributionFilters = {}): Promise<{ data: Contribution[]; total: number }> {
    const { page = 1, limit = 50, ...rest } = filters;
    let query = supabase.from('contributions').select('*, member:members(id,full_name,member_id), function:functions(id,name,type,start_year,end_year)', { count: 'exact' }).order('payment_date', { ascending: false });
    if (rest.function_id) query = query.eq('function_id', rest.function_id);
    if (rest.member_id) query = query.eq('member_id', rest.member_id);
    if (rest.from_date) query = query.gte('payment_date', rest.from_date);
    if (rest.to_date) query = query.lte('payment_date', rest.to_date);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data ?? []) as Contribution[], total: count ?? 0 };
  },
  async getById(id: string): Promise<Contribution> {
    const { data, error } = await supabase.from('contributions').select('*, member:members(id,full_name,member_id), function:functions(id,name,type,start_year,end_year)').eq('id', id).single();
    if (error) throw error;
    return data as Contribution;
  },
  async create(input: CreateContributionInput): Promise<Contribution> {
    const { data, error } = await supabase.from('contributions').insert(input).select().single();
    if (error) throw error;
    return data as Contribution;
  },
  async update(id: string, input: UpdateContributionInput): Promise<Contribution> {
    const { data, error } = await supabase.from('contributions').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Contribution;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contributions').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Expenses ─────────────────────────────────────────────
export const expenseService = {
  async getAll(filters: ExpenseFilters = {}): Promise<{ data: Expense[]; total: number }> {
    const { page = 1, limit = 50, ...rest } = filters;
    let query = supabase.from('expenses').select('*, function:functions(id,name,type,start_year,end_year)', { count: 'exact' }).order('expense_date', { ascending: false });
    if (rest.function_id) query = query.eq('function_id', rest.function_id);
    if (rest.category) query = query.eq('category', rest.category);
    if (rest.from_date) query = query.gte('expense_date', rest.from_date);
    if (rest.to_date) query = query.lte('expense_date', rest.to_date);
    if (rest.search) query = query.ilike('description', `%${rest.search}%`);
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;
    return { data: (data ?? []) as Expense[], total: count ?? 0 };
  },
  async getById(id: string): Promise<Expense> {
    const { data, error } = await supabase.from('expenses').select('*, function:functions(id,name,type,start_year,end_year)').eq('id', id).single();
    if (error) throw error;
    return data as Expense;
  },
  async create(input: CreateExpenseInput): Promise<Expense> {
    const { data, error } = await supabase.from('expenses').insert(input).select().single();
    if (error) throw error;
    return data as Expense;
  },
  async update(id: string, input: UpdateExpenseInput): Promise<Expense> {
    const { data, error } = await supabase.from('expenses').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as Expense;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Functions ────────────────────────────────────────────
export const functionService = {
  async getAll(): Promise<CommunityFunction[]> {
    const { data, error } = await supabase.from('functions').select('*').order('start_year', { ascending: false });
    if (error) throw error;
    return (data ?? []) as CommunityFunction[];
  },
  async getById(id: string): Promise<CommunityFunction> {
    const { data, error } = await supabase.from('functions').select('*').eq('id', id).single();
    if (error) throw error;
    return data as CommunityFunction;
  },
  async create(input: CreateFunctionInput): Promise<CommunityFunction> {
    const { data, error } = await supabase.from('functions').insert(input).select().single();
    if (error) throw error;
    return data as CommunityFunction;
  },
  async update(id: string, input: UpdateFunctionInput): Promise<CommunityFunction> {
    const { data, error } = await supabase.from('functions').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data as CommunityFunction;
  },
};
