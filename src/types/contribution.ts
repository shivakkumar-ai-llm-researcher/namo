export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';

export interface Contribution {
  id: string;
  function_id: string;
  member_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  member?: {
    id: string;
    full_name: string;
    member_id: string;
  };
  function?: {
    id: string;
    name: string;
  };
}

export interface CreateContributionInput {
  function_id: string;
  member_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export type UpdateContributionInput = Partial<CreateContributionInput>;

export interface ContributionFilters {
  function_id?: string;
  member_id?: string;
  payment_method?: PaymentMethod;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}
