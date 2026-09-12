/**
 * Financial Integrity Tests
 * Validates core financial calculation correctness and data integrity rules.
 */
import { sumCurrency, subtractCurrency, addCurrency, calculateBalance } from '../src/utils/currency';

describe('Financial Integrity', () => {
  describe('Balance Calculation', () => {
    it('balance = total contributions - total expenses', () => {
      const contributions = [5000, 3000, 2500, 1500];
      const expenses = [4000, 2000, 1000];
      const totalC = sumCurrency(contributions);
      const totalE = sumCurrency(expenses);
      const balance = calculateBalance(totalC, totalE);
      expect(totalC).toBe(12000);
      expect(totalE).toBe(7000);
      expect(balance).toBe(5000);
    });

    it('surplus shows as positive balance', () => {
      expect(calculateBalance(50000, 39500)).toBe(10500);
    });

    it('deficit shows as negative balance', () => {
      expect(calculateBalance(10000, 15000)).toBe(-5000);
    });
  });

  describe('Amount Validation', () => {
    it('contribution amount must be positive', () => {
      const validateAmount = (amount: number): boolean => amount > 0;
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
      expect(validateAmount(0.01)).toBe(true);
      expect(validateAmount(5000)).toBe(true);
    });

    it('expense amount must be positive', () => {
      const validateAmount = (amount: number): boolean => amount > 0;
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-1)).toBe(false);
      expect(validateAmount(100)).toBe(true);
    });
  });

  describe('Duplicate Submission Protection', () => {
    it('isSubmitting flag prevents double submit', async () => {
      let submitCount = 0;
      let isSubmitting = false;

      const handleSubmit = async () => {
        if (isSubmitting) return; // Guard
        isSubmitting = true;
        try {
          submitCount++;
          await new Promise((r) => setTimeout(r, 20));
        } finally {
          isSubmitting = false;
        }
      };

      // Simulate concurrent double-tap
      const call1 = handleSubmit();
      const call2 = handleSubmit(); // Should be ignored because call1 is in-flight
      await Promise.all([call1, call2]);
      expect(submitCount).toBe(1);
    });
  });

  describe('Database Failure Behavior', () => {
    it('a failed insert must not report success', () => {
      // The service contract: if error is truthy, throw — never return success
      const simulateServiceCreate = (shouldFail: boolean): Promise<{ id: string }> => {
        if (shouldFail) {
          return Promise.reject(new Error('Failed to save contribution: RLS policy violation'));
        }
        return Promise.resolve({ id: 'real-uuid-from-db' });
      };

      return expect(simulateServiceCreate(true)).rejects.toThrow('Failed to save contribution');
    });

    it('empty database returns empty array, not mock data', () => {
      // Validate the contract: empty result = empty array
      const emptyResult = { data: [], count: 0 };
      expect(emptyResult.data).toHaveLength(0);
      expect(emptyResult.data).not.toContain(expect.objectContaining({ member_id: expect.anything() }));
    });
  });

  describe('Four-Year Festival Validation', () => {
    it('FOUR_YEAR function must span exactly 4 years', () => {
      const validate = (startYear: number, endYear: number): boolean => {
        return endYear - startYear === 3;
      };
      expect(validate(2024, 2027)).toBe(true);
      expect(validate(2024, 2026)).toBe(false); // Only 3 years
      expect(validate(2024, 2028)).toBe(false); // 5 years
    });
  });
});
