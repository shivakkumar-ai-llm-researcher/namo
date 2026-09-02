export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const lightColors = {
  // Background
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4F8',

  // Text
  textPrimary: '#1A2332',
  textSecondary: '#6B7A99',
  textTertiary: '#9BA8C0',
  textInverse: '#FFFFFF',

  // Brand
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',

  // Semantic
  success: '#16A34A',
  successLight: '#F0FDF4',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  info: '#0891B2',
  infoLight: '#F0F9FF',

  // Financial
  income: '#16A34A',
  incomeLight: '#F0FDF4',
  expense: '#DC2626',
  expenseLight: '#FEF2F2',
  savings: '#2563EB',
  savingsLight: '#EFF6FF',
  balance: '#7C3AED',
  balanceLight: '#F5F3FF',

  // Border
  border: '#E2E8F0',
  borderFocus: '#2563EB',

  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#2563EB',
  tabBarInactive: '#94A3B8',
};

export const darkColors = {
  // Background
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',

  // Brand
  primary: '#3B82F6',
  primaryLight: '#1E3A5F',
  primaryDark: '#2563EB',

  // Semantic
  success: '#22C55E',
  successLight: '#052E16',
  warning: '#F59E0B',
  warningLight: '#2D1F00',
  error: '#EF4444',
  errorLight: '#2D0808',
  info: '#06B6D4',
  infoLight: '#082F49',

  // Financial
  income: '#22C55E',
  incomeLight: '#052E16',
  expense: '#EF4444',
  expenseLight: '#2D0808',
  savings: '#3B82F6',
  savingsLight: '#1E3A5F',
  balance: '#A78BFA',
  balanceLight: '#2D1B69',

  // Border
  border: '#334155',
  borderFocus: '#3B82F6',

  // Tab bar
  tabBarBackground: '#1E293B',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#475569',
};

export type ThemeColors = typeof lightColors;
