export type MemberStatus = 'active' | 'inactive';
export type MemberRole = 'admin' | 'visitor';

export interface Member {
  id: string;
  member_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role?: MemberRole;
  status: MemberStatus;
  join_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMemberInput {
  member_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  role?: MemberRole;
  status?: MemberStatus;
  join_date?: string;
}

export type UpdateMemberInput = Partial<CreateMemberInput>;
