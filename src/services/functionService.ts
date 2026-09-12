import { supabase } from './supabase';
import { CommunityFunction, CreateFunctionInput, UpdateFunctionInput, FunctionSummary } from '../types';

export const functionService = {
  async getAll(): Promise<CommunityFunction[]> {
    const { data, error } = await supabase
      .from('functions')
      .select('*')
      .order('start_year', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('functionService.getAll error:', error.message);
      throw new Error(`Failed to load functions: ${error.message}`);
    }
    // Empty is valid
    return (data as CommunityFunction[]) ?? [];
  },

  async getById(id: string): Promise<CommunityFunction> {
    const { data, error } = await supabase
      .from('functions')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(`Function not found: ${error.message}`);
    return data as CommunityFunction;
  },

  async getActive(): Promise<CommunityFunction | null> {
    const { data, error } = await supabase
      .from('functions')
      .select('*')
      .eq('status', 'active')
      .order('start_year', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error('getActive error:', error.message);
      return null;
    }
    return data as CommunityFunction | null;
  },

  async create(input: CreateFunctionInput, userId: string): Promise<CommunityFunction> {
    if (!userId) throw new Error('Authentication required.');

    // Validate four-year span
    if (input.type === 'FOUR_YEAR' && input.end_year) {
      if (input.end_year - input.start_year !== 3) {
        throw new Error('Four-year festival must span exactly 4 years (end_year = start_year + 3).');
      }
    }

    const { data, error } = await supabase
      .from('functions')
      .insert({ ...input, created_by: userId })
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can create functions.');
      }
      throw new Error(`Failed to create function: ${error.message}`);
    }
    return data as CommunityFunction;
  },

  async update(id: string, input: UpdateFunctionInput): Promise<CommunityFunction> {
    // Validate four-year span if changing years
    if (input.type === 'FOUR_YEAR' && input.end_year && input.start_year) {
      if (input.end_year - input.start_year !== 3) {
        throw new Error('Four-year festival must span exactly 4 years (end_year = start_year + 3).');
      }
    }

    const { data, error } = await supabase
      .from('functions')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can update functions.');
      }
      throw new Error(`Failed to update function: ${error.message}`);
    }
    return data as CommunityFunction;
  },

  async getSummary(functionId: string): Promise<FunctionSummary> {
    const { data, error } = await supabase
      .rpc('get_function_summary', { p_function_id: functionId });

    if (error) {
      console.error('getSummary RPC error:', error.message);
      // Real fallback: query tables directly
      const [cRes, eRes] = await Promise.all([
        supabase.from('contributions').select('amount').eq('function_id', functionId),
        supabase.from('expenses').select('amount').eq('function_id', functionId),
      ]);
      const tc = (cRes.data ?? []).reduce((s, c) => s + Number(c.amount), 0);
      const te = (eRes.data ?? []).reduce((s, e) => s + Number(e.amount), 0);
      return {
        function_id: functionId,
        total_contributions: tc,
        total_expenses: te,
        balance: tc - te,
        contributor_count: cRes.data?.length ?? 0,
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      function_id: functionId,
      total_contributions: Number(row?.total_contributions ?? 0),
      total_expenses: Number(row?.total_expenses ?? 0),
      balance: Number(row?.balance ?? 0),
      contributor_count: Number(row?.contributor_count ?? 0),
    };
  },

  async getDashboardSummary(functionId: string) {
    const { data, error } = await supabase
      .rpc('get_dashboard_summary', { p_function_id: functionId });

    if (error) {
      console.error('getDashboardSummary RPC error:', error.message);
      return await this.getSummary(functionId);
    }
    return data;
  },
};
