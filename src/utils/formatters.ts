import { format, parseISO, isValid } from 'date-fns';
import type { ExpenseCategory, PaymentMethod, FunctionType, FunctionStatus } from '../types';

export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined) return '\u20b90';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '\u20b90';
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted = rest.length > 0 ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree : lastThree;
  return `\u20b9${formatted}.${decPart}`;
};

export const formatCurrencyCompact = (amount: number): string => {
  if (Math.abs(amount) >= 100000) return `\u20b9${(amount / 100000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1000) return `\u20b9${(amount / 1000).toFixed(1)}K`;
  return formatCurrency(amount);
};

export const formatDate = (dateStr: string | null | undefined, fmt = 'dd MMM yyyy'): string => {
  if (!dateStr) return '\u2014';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '\u2014';
    return format(date, fmt);
  } catch { return '\u2014'; }
};

export const formatDateTime = (dateStr: string | null | undefined): string => formatDate(dateStr, 'dd MMM yyyy, h:mm a');

export const formatPaymentMethod = (method: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = { cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', other: 'Other' };
  return map[method] ?? method;
};

export const formatExpenseCategory = (category: ExpenseCategory): string => {
  const map: Record<ExpenseCategory, string> = { food: 'Food', hall: 'Hall', decoration: 'Decoration', transportation: 'Transportation', cultural_religious: 'Cultural / Religious', printing: 'Printing', sound_system: 'Sound System', gifts: 'Gifts', utilities: 'Utilities', miscellaneous: 'Miscellaneous' };
  return map[category] ?? category;
};

export const formatFunctionType = (type: FunctionType): string =>
  type === 'ANNUAL' ? 'Purattasi Sani Kiyamai' : 'Gokulaashdami';

export const formatFunctionStatus = (status: FunctionStatus): string => {
  const map: Record<FunctionStatus, string> = { planning: 'Planning', active: 'Active', completed: 'Completed', archived: 'Archived' };
  return map[status] ?? status;
};

export const getCategoryEmoji = (category: ExpenseCategory): string => {
  const map: Record<ExpenseCategory, string> = { food: '🍽️', hall: '🏛️', decoration: '🎊', transportation: '🚗', cultural_religious: '🛕', printing: '🗄️', sound_system: '🔉', gifts: '🎁', utilities: '🔌', miscellaneous: '📋' };
  return map[category] ?? '💰';
};

export const getInitials = (name: string | null | undefined): string => {
  if (!name) return '?';
  const clean = name.replace(/\(.*?\)/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
