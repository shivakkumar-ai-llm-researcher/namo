export type FunctionType = 'ANNUAL' | 'FOUR_YEAR';
export type FunctionStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface CommunityFunction {
  id: string;
  name: string;
  type: FunctionType;
  start_year: number;
  end_year: number | null;
  description: string | null;
  status: FunctionStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FunctionSummary {
  function_id: string;
  total_contributions: number;
  total_expenses: number;
  balance: number;
  contributor_count: number;
}

export interface CreateFunctionInput {
  name: string;
  type: FunctionType;
  start_year: number;
  end_year?: number;
  description?: string;
  status?: FunctionStatus;
}

export type UpdateFunctionInput = Partial<CreateFunctionInput>;
