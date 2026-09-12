import { supabase } from './supabase';
import { Contribution, CreateContributionInput, UpdateContributionInput, ContributionFilters } from '../types';
import { auditService } from './auditService';

const CONTRIBUTION_SELECT = `
  *,
  member:members(id, full_name, member_id),
  function:functions(id, name, type, start_year, end_year)
`;

export const contributionService = {
  async getAll(filters: ContributionFilters = {}): Promise<{ data: Contribution[]; count: number }> {
    const { page = 1, limit = 20, function_id, member_id, payment_method, from_date, to_date, search } = filters;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('contributions')
      .select(CONTRIBUTION_SELECT, { count: 'exact' });

    if (function_id) query = query.eq('function_id', function_id);
    if (member_id) query = query.eq('member_id', member_id);
    if (payment_method) query = query.eq('payment_method', payment_method);
    if (from_date) query = query.gte('payment_date', from_date);
    if (to_date) query = query.lte('payment_date', to_date);

    const { data, error, count } = await query
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('contributionService.getAll error:', error.message);
      throw new Error(`Failed to load contributions: ${error.message}`);
    }

    // Empty array is a valid state — do NOT fall back to mock data
    return { data: (data as Contribution[]) ?? [], count: count ?? 0 };
  },

  async getById(id: string): Promise<Contribution> {
    const { data, error } = await supabase
      .from('contributions')
      .select(CONTRIBUTION_SELECT)
      .eq('id', id)
      .single();
    if (error) throw new Error(`Failed to load contribution: ${error.message}`);
    return data as Contribution;
  },

  async getRecent(functionId: string, limit = 5): Promise<Contribution[]> {
    let query = supabase
      .from('contributions')
      .select(CONTRIBUTION_SELECT)
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (functionId) query = query.eq('function_id', functionId);
    const { data, error } = await query;
    if (error) {
      console.error('getRecent contributions error:', error.message);
      return [];
    }
    return (data as Contribution[]) ?? [];
  },

  async create(input: CreateContributionInput, userId: string): Promise<Contribution> {
    // Require authenticated user — never use a dummy UUID
    if (!userId) {
      throw new Error('Authentication required. Please log in again.');
    }

    const { data, error } = await supabase
      .from('contributions')
      .insert({ ...input, created_by: userId })
      .select(CONTRIBUTION_SELECT)
      .single();

    if (error) {
      // Surface the actual error — do NOT fabricate success
      console.error('Contribution insert error:', error.message, error.code);
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can record contributions.');
      }
      throw new Error(`Failed to save contribution: ${error.message}`);
    }

    // Audit log (best-effort, non-blocking)
    auditService.log(userId, 'created', 'contribution', (data as Contribution).id, null, input as any)
      .catch((e) => console.warn('Audit log failed:', e));

    return data as Contribution;
  },

  async update(id: string, input: UpdateContributionInput, userId: string): Promise<Contribution> {
    if (!userId) throw new Error('Authentication required.');

    // Capture previous state for audit
    const previous = await this.getById(id);

    const { data, error } = await supabase
      .from('contributions')
      .update(input)
      .eq('id', id)
      .select(CONTRIBUTION_SELECT)
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can modify contributions.');
      }
      throw new Error(`Failed to update contribution: ${error.message}`);
    }

    auditService.log(userId, 'updated', 'contribution', id, previous as any, input as any)
      .catch((e) => console.warn('Audit log failed:', e));

    return data as Contribution;
  },

  async delete(id: string, userId: string): Promise<void> {
    if (!userId) throw new Error('Authentication required.');

    // Capture for audit before deletion
    const previous = await this.getById(id);

    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can delete contributions.');
      }
      throw new Error(`Failed to delete contribution: ${error.message}`);
    }

    // Audit the deletion
    auditService.log(userId, 'deleted', 'contribution', id, previous as any, null)
      .catch((e) => console.warn('Audit log failed:', e));
  },

  async getMemberContributions(memberId: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select(CONTRIBUTION_SELECT)
      .eq('member_id', memberId)
      .order('payment_date', { ascending: false });
    if (error) {
      console.error('getMemberContributions error:', error.message);
      return [];
    }
    return (data as Contribution[]) ?? [];
  },
};
