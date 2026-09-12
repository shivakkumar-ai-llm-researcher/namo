import { z } from 'zod';
import { PaymentMethod } from '../types/contribution';
import { ExpenseCategory } from '../types/expense';
import { FunctionType, FunctionStatus } from '../types/function';

export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'upi', 'bank_transfer', 'other'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'food', 'hall', 'decoration', 'transportation', 'cultural_religious',
  'printing', 'sound_system', 'gifts', 'utilities', 'miscellaneous',
];
export const FUNCTION_TYPES: FunctionType[] = ['ANNUAL', 'FOUR_YEAR'];
export const FUNCTION_STATUSES: FunctionStatus[] = ['planning', 'active', 'completed', 'archived'];

export const contributionSchema = z.object({
  function_id: z.string().uuid('Please select a valid function'),
  member_id: z.string().uuid('Please select a valid member'),
  amount: z.number({ message: 'Amount must be a number' }).positive('Amount must be greater than 0').multipleOf(0.01),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'other'] as const),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reference_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const expenseSchema = z.object({
  function_id: z.string().uuid('Please select a valid function'),
  category: z.enum(['food', 'hall', 'decoration', 'transportation', 'cultural_religious', 'printing', 'sound_system', 'gifts', 'utilities', 'miscellaneous'] as const),
  description: z.string().min(1, 'Description is required').max(200),
  amount: z.number({ message: 'Amount must be a number' }).positive('Amount must be greater than 0').multipleOf(0.01),
  payment_method: z.enum(['cash', 'upi', 'bank_transfer', 'other'] as const),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  reference_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const memberSchema = z.object({
  member_id: z.string().min(1, 'Member ID is required').max(20),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[0-9+\-\s]{7,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive'] as const).optional(),
  join_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const functionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['ANNUAL', 'FOUR_YEAR'] as const),
  start_year: z.number().int().min(2000).max(2100),
  end_year: z.number().int().min(2000).max(2100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['planning', 'active', 'completed', 'archived'] as const).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
