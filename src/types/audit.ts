export type AuditAction = 'created' | 'updated' | 'deleted';
export type AuditEntity = 'contribution' | 'expense' | 'function' | 'member';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entity_id: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
  // Joined
  profile?: {
    id: string;
    full_name: string | null;
  };
}
