import { supabase } from './supabase';
import { AuditLog, AuditAction, AuditEntity } from '../types';

export const auditService = {
  async log(
    userId: string,
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    previousValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null,
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        previous_value: previousValue,
        new_value: newValue,
      });
    } catch (e) {
      // Never let audit log failures block the main operation
      console.error('Audit log failed:', e);
    }
  },

  async getAll(page = 1, limit = 30): Promise<{ data: AuditLog[]; count: number }> {
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profile:profiles(id, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data: (data ?? []) as AuditLog[], count: count ?? 0 };
  },
};
