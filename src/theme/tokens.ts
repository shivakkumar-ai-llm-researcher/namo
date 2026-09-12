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
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Tirupati Balaji Sacred Temple Palette (Light - Srivari Sannidhi)
export const lightColors = {
  // Background (Sacred Chandanam Sandalwood & Silk Ivory)
  background: '#FCF8EE',
  surface: '#FFFFFF',
  surfaceVariant: '#F7EFE0',

  // Text (Temple Bronze & Teak)
  textPrimary: '#29180C',
  textSecondary: '#6B4E38',
  textTertiary: '#9E826C',
  textInverse: '#FFFFFF',

  // Brand (Auspicious Kalyana Maroon / Kumkum & Swarna Gold)
  primary: '#851D1D', // Sacred Kumkum Temple Red/Maroon
  primaryLight: '#FEF3C7', // Sandalwood Gold Glow
  primaryDark: '#5E1010', // Deep Temple Sanctum Maroon

  // Sacred Balaji Accents
  gold: '#D97706', // Srivari Swarna Gold
  goldLight: '#FEF3C7',
  maroon: '#851D1D',
  maroonLight: '#FEE2E2',

  // Semantic
  success: '#15803D', // Sacred Tulasi Green
  successLight: '#F0FDF4',
  warning: '#D97706', // Auspicious Deepam Flame
  warningLight: '#FFFBEB',
  error: '#DC2626', // Sacred Kumkum
  errorLight: '#FEF2F2',
  info: '#0369A1', // Shankha Ocean Blue
  infoLight: '#F0F9FF',

  // Financial (Balaji Offerings & Sacred Ledger)
  income: '#15803D', // Sacred Tulasi Green (Punya / Offerings)
  incomeLight: '#F0FDF4',
  expense: '#DC2626', // Sacred Kumkum Disbursals
  expenseLight: '#FEF2F2',
  savings: '#B45309', // Srivari Hundi Gold
  savingsLight: '#FEF3C7',
  balance: '#9A3412', // Peethambaram Amber
  balanceLight: '#FFEDD5',

  // Border (Sandalwood Gold)
  border: '#EADBC8',
  borderFocus: '#B45309',

  // Tab bar (Temple Silk Ivory & Sacred Maroon)
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#851D1D',
  tabBarInactive: '#8A705E',
};

// Tirupati Balaji Sacred Temple Palette (Dark - Shaligram Vigraha & Ananda Nilayam)
export const darkColors = {
  // Background (Sacred Shaligram Black Stone)
  background: '#120D08',
  surface: '#1E1610',
  surfaceVariant: '#2E2218',

  // Text (Radiant Camphor & Sacred Gold Glow)
  textPrimary: '#FEF3C7',
  textSecondary: '#D7C4A5',
  textTertiary: '#9C8570',
  textInverse: '#FFFFFF',

  // Brand (Auspicious Kalyana Maroon / Kumkum - Same Sacred Color as Light Mode)
  primary: '#851D1D', // Sacred Kumkum Temple Red/Maroon
  primaryLight: '#3E1010', // Deep Temple Sanctum Maroon Glow
  primaryDark: '#5E1010', // Deep Temple Sanctum Maroon

  // Sacred Balaji Accents
  gold: '#D97706',
  goldLight: '#38250E',
  maroon: '#851D1D',
  maroonLight: '#3E1010',

  // Semantic
  success: '#22C55E',
  successLight: '#052E16',
  warning: '#F59E0B',
  warningLight: '#38250E',
  error: '#EF4444',
  errorLight: '#3E0A0A',
  info: '#38BDF8',
  infoLight: '#0C2E4A',

  // Financial
  income: '#22C55E', // Glowing Tulasi
  incomeLight: '#052E16',
  expense: '#EF4444', // Sacred Kumkum
  expenseLight: '#3E0A0A',
  savings: '#F59E0B', // Glowing Srivari Hundi
  savingsLight: '#38250E',
  balance: '#FB923C', // Peethambaram
  balanceLight: '#3A1A05',

  // Border
  border: '#3D2D20',
  borderFocus: '#F59E0B',

  // Tab bar
  tabBarBackground: '#1A130C',
  tabBarActive: '#F59E0B',
  tabBarInactive: '#7C6755',
};

export type ThemeColors = typeof lightColors;
