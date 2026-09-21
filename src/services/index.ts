import { supabase } from '../lib/supabase';
import type {
  Member,
  CreateMemberInput,
  UpdateMemberInput,
  Contribution,
  CreateContributionInput,
  UpdateContributionInput,
  ContributionFilters,
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  CommunityFunction,
  CreateFunctionInput,
  UpdateFunctionInput,
  Profile,
} from '../types';
import {
  fallbackFunctions,
  fallbackMembers,
  fallbackContributions,
  fallbackExpenses,
} from './fallbackData';

function getLocalItems<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItem<T>(key: string, item: T) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalItems<T>(key);
    localStorage.setItem(key, JSON.stringify([item, ...list]));
  } catch {}
}

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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
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
    return {
      id: userId,
      role: 'visitor',
      full_name: email?.split('@')[0] ?? 'User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
};

// ─── Members ─────────────────────────────────────────────
export const memberService = {
  async getAll(search = '', page = 1, limit = 50): Promise<{ data: Member[]; total: number }> {
    try {
      let query = supabase.from('members').select('*', { count: 'exact' }).order('full_name');
      if (search) query = query.ilike('full_name', `%${search}%`);
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);
      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        const local = getLocalItems<Member>('namo_local_members');
        const merged = [...local, ...(data as Member[])];
        return { data: merged, total: (count ?? data.length) + local.length };
      }
    } catch {}

    const local = getLocalItems<Member>('namo_local_members');
    let list = [...local, ...fallbackMembers];
    if (search) {
      list = list.filter(
        (m) =>
          m.full_name.toLowerCase().includes(search.toLowerCase()) ||
          m.member_id.toLowerCase().includes(search.toLowerCase())
      );
    }
    const from = (page - 1) * limit;
    return { data: list.slice(from, from + limit), total: list.length };
  },
  async getById(id: string): Promise<Member> {
    const local = getLocalItems<Member>('namo_local_members');
    const lFound = local.find((m) => m.id === id);
    if (lFound) return lFound;

    try {
      const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
      if (!error && data) return data as Member;
    } catch {}

    const fallback = fallbackMembers.find((m) => m.id === id);
    if (fallback) return fallback;
    throw new Error('Member not found');
  },
  async create(input: CreateMemberInput): Promise<Member> {
    const newMember: Member = {
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
      member_id: input.member_id,
      full_name: input.full_name,
      phone: input.phone ?? null,
      email: input.email ?? null,
      role: input.role ?? 'visitor',
      status: input.status ?? 'active',
      join_date: input.join_date ?? new Date().toISOString().slice(0, 10),
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabase.from('members').insert(input).select().single();
      if (!error && data) return data as Member;
    } catch {}
    saveLocalItem('namo_local_members', newMember);
    return newMember;
  },
  async update(id: string, input: UpdateMemberInput): Promise<Member> {
    try {
      const { data, error } = await supabase.from('members').update(input).eq('id', id).select().single();
      if (!error && data) return data as Member;
    } catch {}
    const member = await this.getById(id);
    const updated = { ...member, ...input, updated_at: new Date().toISOString() };
    saveLocalItem('namo_local_members', updated);
    return updated;
  },
};

// ─── Contributions ───────────────────────────────────────
export const contributionService = {
  async getAll(filters: ContributionFilters = {}): Promise<{ data: Contribution[]; total: number }> {
    const { page = 1, limit = 50, ...rest } = filters;
    try {
      let query = supabase
        .from('contributions')
        .select(
          '*, member:members(id,full_name,member_id), function:functions(id,name,type,start_year,end_year)',
          { count: 'exact' }
        )
        .order('payment_date', { ascending: false });
      if (rest.function_id) query = query.eq('function_id', rest.function_id);
      if (rest.member_id) query = query.eq('member_id', rest.member_id);
      if (rest.from_date) query = query.gte('payment_date', rest.from_date);
      if (rest.to_date) query = query.lte('payment_date', rest.to_date);
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);
      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        const local = getLocalItems<Contribution>('namo_local_contributions');
        return { data: [...local, ...(data as Contribution[])], total: (count ?? data.length) + local.length };
      }
    } catch {}

    const local = getLocalItems<Contribution>('namo_local_contributions');
    let list = [...local, ...fallbackContributions];
    if (rest.function_id) list = list.filter((c) => c.function_id === rest.function_id);
    if (rest.member_id) list = list.filter((c) => c.member_id === rest.member_id);
    if (rest.payment_method) list = list.filter((c) => c.payment_method === rest.payment_method);
    if (rest.from_date) list = list.filter((c) => c.payment_date >= rest.from_date!);
    if (rest.to_date) list = list.filter((c) => c.payment_date <= rest.to_date!);

    const from = (page - 1) * limit;
    return { data: list.slice(from, from + limit), total: list.length };
  },
  async getById(id: string): Promise<Contribution> {
    const local = getLocalItems<Contribution>('namo_local_contributions');
    const lFound = local.find((c) => c.id === id);
    if (lFound) return lFound;

    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(
          '*, member:members(id,full_name,member_id), function:functions(id,name,type,start_year,end_year)'
        )
        .eq('id', id)
        .single();
      if (!error && data) return data as Contribution;
    } catch {}

    const fallback = fallbackContributions.find((c) => c.id === id);
    if (fallback) return fallback;
    throw new Error('Contribution not found');
  },
  async create(input: CreateContributionInput): Promise<Contribution> {
    const fn = fallbackFunctions.find((f) => f.id === input.function_id);
    const mem = fallbackMembers.find((m) => m.id === input.member_id);
    const newCont: Contribution = {
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
      function_id: input.function_id,
      member_id: input.member_id,
      amount: input.amount,
      payment_method: input.payment_method,
      payment_date: input.payment_date,
      reference_number: input.reference_number ?? null,
      notes: input.notes ?? null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      function: fn ? { id: fn.id, name: fn.name, type: fn.type, start_year: fn.start_year, end_year: fn.end_year } : undefined,
      member: mem ? { id: mem.id, full_name: mem.full_name, member_id: mem.member_id } : undefined,
    };
    try {
      const { data, error } = await supabase.from('contributions').insert(input).select().single();
      if (!error && data) return data as Contribution;
    } catch {}
    saveLocalItem('namo_local_contributions', newCont);
    return newCont;
  },
  async update(id: string, input: UpdateContributionInput): Promise<Contribution> {
    try {
      const { data, error } = await supabase.from('contributions').update(input).eq('id', id).select().single();
      if (!error && data) return data as Contribution;
    } catch {}
    const c = await this.getById(id);
    const updated = { ...c, ...input, updated_at: new Date().toISOString() };
    saveLocalItem('namo_local_contributions', updated);
    return updated;
  },
  async delete(id: string): Promise<void> {
    try {
      await supabase.from('contributions').delete().eq('id', id);
    } catch {}
    if (typeof window !== 'undefined') {
      const local = getLocalItems<Contribution>('namo_local_contributions').filter((c) => c.id !== id);
      localStorage.setItem('namo_local_contributions', JSON.stringify(local));
    }
  },
};

// ─── Expenses ─────────────────────────────────────────────
export const expenseService = {
  async getAll(filters: ExpenseFilters = {}): Promise<{ data: Expense[]; total: number }> {
    const { page = 1, limit = 50, ...rest } = filters;
    try {
      let query = supabase
        .from('expenses')
        .select('*, function:functions(id,name,type,start_year,end_year)', { count: 'exact' })
        .order('expense_date', { ascending: false });
      if (rest.function_id) query = query.eq('function_id', rest.function_id);
      if (rest.category) query = query.eq('category', rest.category);
      if (rest.from_date) query = query.gte('expense_date', rest.from_date);
      if (rest.to_date) query = query.lte('expense_date', rest.to_date);
      if (rest.search) query = query.ilike('description', `%${rest.search}%`);
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);
      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        const local = getLocalItems<Expense>('namo_local_expenses');
        return { data: [...local, ...(data as Expense[])], total: (count ?? data.length) + local.length };
      }
    } catch {}

    const local = getLocalItems<Expense>('namo_local_expenses');
    let list = [...local, ...fallbackExpenses];
    if (rest.function_id) list = list.filter((e) => e.function_id === rest.function_id);
    if (rest.category) list = list.filter((e) => e.category === rest.category);
    if (rest.from_date) list = list.filter((e) => e.expense_date >= rest.from_date!);
    if (rest.to_date) list = list.filter((e) => e.expense_date <= rest.to_date!);
    if (rest.search) list = list.filter((e) => e.description.toLowerCase().includes(rest.search!.toLowerCase()));

    const from = (page - 1) * limit;
    return { data: list.slice(from, from + limit), total: list.length };
  },
  async getById(id: string): Promise<Expense> {
    const local = getLocalItems<Expense>('namo_local_expenses');
    const lFound = local.find((e) => e.id === id);
    if (lFound) return lFound;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*, function:functions(id,name,type,start_year,end_year)')
        .eq('id', id)
        .single();
      if (!error && data) return data as Expense;
    } catch {}

    const fallback = fallbackExpenses.find((e) => e.id === id);
    if (fallback) return fallback;
    throw new Error('Expense not found');
  },
  async create(input: CreateExpenseInput): Promise<Expense> {
    const fn = fallbackFunctions.find((f) => f.id === input.function_id);
    const newExp: Expense = {
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
      function_id: input.function_id,
      category: input.category,
      description: input.description,
      amount: input.amount,
      payment_method: input.payment_method,
      expense_date: input.expense_date,
      reference_number: input.reference_number ?? null,
      notes: input.notes ?? null,
      receipt_url: input.receipt_url ?? null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      function: fn ? { id: fn.id, name: fn.name, type: fn.type, start_year: fn.start_year, end_year: fn.end_year } : undefined,
    };
    try {
      const { data, error } = await supabase.from('expenses').insert(input).select().single();
      if (!error && data) return data as Expense;
    } catch {}
    saveLocalItem('namo_local_expenses', newExp);
    return newExp;
  },
  async update(id: string, input: UpdateExpenseInput): Promise<Expense> {
    try {
      const { data, error } = await supabase.from('expenses').update(input).eq('id', id).select().single();
      if (!error && data) return data as Expense;
    } catch {}
    const exp = await this.getById(id);
    const updated = { ...exp, ...input, updated_at: new Date().toISOString() };
    saveLocalItem('namo_local_expenses', updated);
    return updated;
  },
  async delete(id: string): Promise<void> {
    try {
      await supabase.from('expenses').delete().eq('id', id);
    } catch {}
    if (typeof window !== 'undefined') {
      const local = getLocalItems<Expense>('namo_local_expenses').filter((e) => e.id !== id);
      localStorage.setItem('namo_local_expenses', JSON.stringify(local));
    }
  },
};

// ─── Functions ────────────────────────────────────────────
export const functionService = {
  async getAll(): Promise<CommunityFunction[]> {
    try {
      const { data, error } = await supabase
        .from('functions')
        .select('*')
        .order('start_year', { ascending: false });
      if (!error && data && data.length > 0) {
        const local = getLocalItems<CommunityFunction>('namo_local_functions');
        return [...local, ...(data as CommunityFunction[])];
      }
    } catch {}

    const local = getLocalItems<CommunityFunction>('namo_local_functions');
    return [...local, ...fallbackFunctions];
  },
  async getById(id: string): Promise<CommunityFunction> {
    const local = getLocalItems<CommunityFunction>('namo_local_functions');
    const lFound = local.find((f) => f.id === id);
    if (lFound) return lFound;

    try {
      const { data, error } = await supabase.from('functions').select('*').eq('id', id).single();
      if (!error && data) return data as CommunityFunction;
    } catch {}

    const fallback = fallbackFunctions.find((f) => f.id === id);
    if (fallback) return fallback;
    throw new Error('Function not found');
  },
  async create(input: CreateFunctionInput): Promise<CommunityFunction> {
    const newFn: CommunityFunction = {
      id: crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
      name: input.name,
      type: input.type,
      start_year: input.start_year,
      end_year: input.end_year ?? null,
      description: input.description ?? null,
      status: input.status ?? 'active',
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const { data, error } = await supabase.from('functions').insert(input).select().single();
      if (!error && data) return data as CommunityFunction;
    } catch {}
    saveLocalItem('namo_local_functions', newFn);
    return newFn;
  },
  async update(id: string, input: UpdateFunctionInput): Promise<CommunityFunction> {
    try {
      const { data, error } = await supabase.from('functions').update(input).eq('id', id).select().single();
      if (!error && data) return data as CommunityFunction;
    } catch {}
    const fn = await this.getById(id);
    const updated = { ...fn, ...input, updated_at: new Date().toISOString() };
    saveLocalItem('namo_local_functions', updated);
    return updated;
  },
};
