import {
  addCurrency,
  subtractCurrency,
  sumCurrency,
  roundCurrency,
  formatINR,
  parseCurrencyInput,
  calculateBalance,
} from '../src/utils/currency';

describe('Currency Utilities', () => {
  describe('addCurrency', () => {
    it('adds two amounts without floating point drift', () => {
      expect(addCurrency(0.1, 0.2)).toBe(0.3);
    });
    it('adds large amounts correctly', () => {
      expect(addCurrency(50000, 25000)).toBe(75000);
    });
    it('handles zero', () => {
      expect(addCurrency(5000, 0)).toBe(5000);
    });
  });

  describe('subtractCurrency', () => {
    it('subtracts without floating point errors', () => {
      expect(subtractCurrency(0.3, 0.1)).toBe(0.2);
    });
    it('allows negative balance', () => {
      expect(subtractCurrency(1000, 2000)).toBe(-1000);
    });
  });

  describe('sumCurrency', () => {
    it('sums array of amounts safely', () => {
      expect(sumCurrency([100, 200, 300.50])).toBe(600.5);
    });
    it('returns 0 for empty array', () => {
      expect(sumCurrency([])).toBe(0);
    });
    it('handles float precision', () => {
      expect(sumCurrency([0.1, 0.2, 0.3])).toBe(0.6);
    });
  });

  describe('roundCurrency', () => {
    it('rounds to 2 decimal places', () => {
      expect(roundCurrency(10.005)).toBe(10.01);
    });
    it('does not alter clean values', () => {
      expect(roundCurrency(1000)).toBe(1000);
    });
  });

  describe('parseCurrencyInput', () => {
    it('parses clean number string', () => {
      expect(parseCurrencyInput('5000')).toBe(5000);
    });
    it('returns null for negative', () => {
      expect(parseCurrencyInput('-100')).toBeNull();
    });
    it('returns null for invalid string', () => {
      expect(parseCurrencyInput('abc')).toBeNull();
    });
    it('parses decimal amounts', () => {
      expect(parseCurrencyInput('1500.50')).toBe(1500.5);
    });
    it('strips currency symbols', () => {
      expect(parseCurrencyInput('\u20b95,000')).toBe(5000);
    });
  });

  describe('calculateBalance', () => {
    it('calculates positive balance', () => {
      expect(calculateBalance(55000, 39500)).toBe(15500);
    });
    it('calculates deficit', () => {
      expect(calculateBalance(10000, 15000)).toBe(-5000);
    });
    it('zero balance', () => {
      expect(calculateBalance(10000, 10000)).toBe(0);
    });
  });
});
