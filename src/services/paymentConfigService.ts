import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentConfig {
  upiId: string;
  upiQrUri?: string | null;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch?: string;
  notes?: string;
  updatedAt?: string;
}

const STORAGE_KEY = '@namo_community_payment_config_v2';

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  accountHolder: 'Sri Venkateswara Swamy Seva Trust',
  accountNumber: '39284719283',
  ifscCode: 'SBIN0001234',
  bankName: 'State Bank of India',
  branch: 'Tirumala Road Branch',
  upiId: 'srivaritrust@sbi',
  upiQrUri: null,
  notes: 'Official Community Contribution Account for Purattasi & Gokulaashdami',
  updatedAt: new Date().toISOString(),
};

export const paymentConfigService = {
  async getConfig(): Promise<PaymentConfig> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_PAYMENT_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to read payment config:', e);
    }
    return DEFAULT_PAYMENT_CONFIG;
  },

  async saveConfig(config: PaymentConfig): Promise<PaymentConfig> {
    const updated: PaymentConfig = {
      ...config,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async resetToDefault(): Promise<PaymentConfig> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PAYMENT_CONFIG));
    return DEFAULT_PAYMENT_CONFIG;
  },
};
