import { format, parseISO, isValid } from 'date-fns';
import { ExpenseCategory } from '../types/expense';
import { PaymentMethod } from '../types/contribution';
import { FunctionType, FunctionStatus } from '../types/function';

/**
 * Format a number as Indian Rupees currency
 * Uses numeric(15,2) DB values — no floating point arithmetic
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '\u20b90';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '\u20b90';
  
  // Indian number formatting: 1,23,456.00
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted = rest.length > 0
    ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
    : lastThree;
  return `\u20b9${formatted}.${decPart}`;
};

/**
 * Format currency compact (e.g., ₹1.2L, ₹45K)
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (Math.abs(amount) >= 100000) return `\u20b9${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000) return `\u20b9${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
};

export const formatDate = (dateStr: string | null | undefined, fmt = 'dd MMM yyyy'): string => {
  if (!dateStr) return '—';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '—';
    return format(date, fmt);
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateStr: string | null | undefined): string => {
  return formatDate(dateStr, 'dd MMM yyyy, h:mm a');
};

export const formatDateInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatPaymentMethod = (method: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    other: 'Other',
  };
  return map[method] ?? method;
};

export const formatExpenseCategory = (category: ExpenseCategory): string => {
  const map: Record<ExpenseCategory, string> = {
    food: 'Food',
    hall: 'Hall',
    decoration: 'Decoration',
    transportation: 'Transportation',
    cultural_religious: 'Cultural / Religious',
    printing: 'Printing',
    sound_system: 'Sound System',
    gifts: 'Gifts',
    utilities: 'Utilities',
    miscellaneous: 'Miscellaneous',
  };
  return map[category] ?? category;
};

export const formatFunctionType = (type: FunctionType): string => {
  return type === 'ANNUAL' ? 'Purattasi Sani Kiyamai' : 'Gokulaashdami';
};

export const formatFunctionStatus = (status: FunctionStatus): string => {
  const map: Record<FunctionStatus, string> = {
    planning: 'Planning',
    active: 'Active',
    completed: 'Completed',
    archived: 'Archived',
  };
  return map[status] ?? status;
};

export const getCategoryIcon = (category: ExpenseCategory): string => {
  const map: Record<ExpenseCategory, string> = {
    food: 'restaurant-outline',
    hall: 'business-outline',
    decoration: 'sparkles-outline',
    transportation: 'car-outline',
    cultural_religious: 'flame-outline',
    printing: 'print-outline',
    sound_system: 'volume-high-outline',
    gifts: 'gift-outline',
    utilities: 'flash-outline',
    miscellaneous: 'ellipsis-horizontal-circle-outline',
  };
  return map[category] ?? 'receipt-outline';
};

export const getCategoryEmoji = (category: ExpenseCategory): string => {
  const map: Record<ExpenseCategory, string> = {
    food: '\uD83C\uDF7D\uFE0F',
    hall: '\uD83C\uDFDB\uFE0F',
    decoration: '\uD83C\uDF8A',
    transportation: '\uD83D\uDE97',
    cultural_religious: '\uD83D\uDECF\uFE0F',
    printing: '\uD83D\uDDC4\uFE0F',
    sound_system: '\uD83D\uDD09',
    gifts: '\uD83C\uDF81',
    utilities: '\uD83D\uDD0C',
    miscellaneous: '\uD83D\uDCCB',
  };
  return map[category] ?? '\uD83D\uDCB0';
};


export const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
