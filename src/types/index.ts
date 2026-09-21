export type UserRole = 'admin' | 'visitor';
export interface Profile { id: string; role: UserRole; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string; }
export type MemberStatus = 'active' | 'inactive';
export interface Member { id: string; member_id: string; full_name: string; phone: string | null; email: string | null; role?: UserRole; status: MemberStatus; join_date: string; created_by: string | null; created_at: string; updated_at: string; }
export interface CreateMemberInput { member_id: string; full_name: string; phone?: string; email?: string; role?: UserRole; status?: MemberStatus; join_date?: string; }
export type UpdateMemberInput = Partial<CreateMemberInput>;
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';
export interface Contribution { id: string; function_id: string; member_id: string; amount: number; payment_method: PaymentMethod; payment_date: string; reference_number: string | null; notes: string | null; created_by: string | null; created_at: string; updated_at: string; member?: { id: string; full_name: string; member_id: string; }; function?: { id: string; name: string; type?: FunctionType; start_year?: number; end_year?: number | null; }; }
export interface CreateContributionInput { function_id: string; member_id: string; amount: number; payment_method: PaymentMethod; payment_date: string; reference_number?: string; notes?: string; }
export type UpdateContributionInput = Partial<CreateContributionInput>;
export interface ContributionFilters { function_id?: string; member_id?: string; payment_method?: PaymentMethod; from_date?: string; to_date?: string; search?: string; page?: number; limit?: number; }
export type ExpenseCategory = 'food' | 'hall' | 'decoration' | 'transportation' | 'cultural_religious' | 'printing' | 'sound_system' | 'gifts' | 'utilities' | 'miscellaneous';
export interface Expense { id: string; function_id: string; category: ExpenseCategory; description: string; amount: number; payment_method: PaymentMethod; expense_date: string; reference_number: string | null; notes: string | null; receipt_url: string | null; created_by: string | null; created_at: string; updated_at: string; function?: { id: string; name: string; type?: FunctionType; start_year?: number; end_year?: number | null; }; }
export interface CreateExpenseInput { function_id: string; category: ExpenseCategory; description: string; amount: number; payment_method: PaymentMethod; expense_date: string; reference_number?: string; notes?: string; receipt_url?: string; }
export type UpdateExpenseInput = Partial<CreateExpenseInput>;
export interface ExpenseFilters { function_id?: string; category?: ExpenseCategory; from_date?: string; to_date?: string; search?: string; page?: number; limit?: number; }
export type FunctionType = 'ANNUAL' | 'FOUR_YEAR';
export type FunctionStatus = 'planning' | 'active' | 'completed' | 'archived';
export interface CommunityFunction { id: string; name: string; type: FunctionType; start_year: number; end_year: number | null; description: string | null; status: FunctionStatus; created_by: string | null; created_at: string; updated_at: string; }
export interface CreateFunctionInput { name: string; type: FunctionType; start_year: number; end_year?: number; description?: string; status?: FunctionStatus; }
export type UpdateFunctionInput = Partial<CreateFunctionInput>;
