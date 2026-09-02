export type ExpenseCategory =
  | 'food'
  | 'hall'
  | 'decoration'
  | 'transportation'
  | 'cultural_religious'
  | 'printing'
  | 'sound_system'
  | 'gifts'
  | 'utilities'
  | 'miscellaneous';

export interface Expense {
  id: string;
  function_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment_method: import('./contribution').PaymentMethod;
  expense_date: string;
  reference_number: string | null;
  notes: string | null;
  receipt_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  function?: {
    id: string;
    name: string;
  };
}

export interface CreateExpenseInput {
  function_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment_method: import('./contribution').PaymentMethod;
  expense_date: string;
  reference_number?: string;
  notes?: string;
  receipt_url?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseFilters {
  function_id?: string;
  category?: ExpenseCategory;
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}