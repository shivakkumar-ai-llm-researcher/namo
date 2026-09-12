import { supabase } from './supabase';
import { Member, CreateMemberInput, UpdateMemberInput } from '../types';
import { auditService } from './auditService';

export const memberService = {
  async getAll(search?: string, page = 1, limit = 50): Promise<{ data: Member[]; count: number }> {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('members')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,member_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('full_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('memberService.getAll error:', error.message);
      throw new Error(`Failed to load members: ${error.message}`);
    }

    // Empty result is valid — the database has no members yet
    return { data: (data as Member[]) ?? [], count: count ?? 0 };
  },

  async getById(id: string): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(`Member not found: ${error.message}`);
    return data as Member;
  },

  async create(input: CreateMemberInput, userId: string): Promise<Member> {
    if (!userId) throw new Error('Authentication required.');

    // Strip any `role` field — members table has no role column
    const { role, ...memberPayload } = input as any;

    const { data, error } = await supabase
      .from('members')
      .insert({ ...memberPayload, created_by: userId })
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can add members.');
      }
      if (error.code === '23505') {
        throw new Error('A member with this ID already exists.');
      }
      throw new Error(`Failed to create member: ${error.message}`);
    }

    auditService.log(userId, 'created', 'member', data.id, null, memberPayload as any)
      .catch((e) => console.warn('Audit log failed:', e));

    return data as Member;
  },

  async update(id: string, input: UpdateMemberInput, userId: string): Promise<Member> {
    if (!userId) throw new Error('Authentication required.');

    const previous = await this.getById(id);

    const { data, error } = await supabase
      .from('members')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('Permission denied. Only administrators can update members.');
      }
      throw new Error(`Failed to update member: ${error.message}`);
    }

    auditService.log(userId, 'updated', 'member', id, previous as any, input as any)
      .catch((e) => console.warn('Audit log failed:', e));

    return data as Member;
  },

  async disable(id: string, userId: string): Promise<void> {
    await this.update(id, { status: 'inactive' }, userId);
  },

  async generateMemberId(): Promise<string> {
    // Count from database, not local array
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });
    const next = (count ?? 0) + 1;
    return `MBR${String(next).padStart(3, '0')}`;
  },
};
