/**
 * Decimal-safe currency utilities for Indian Rupees (INR)
 * Avoids IEEE 754 floating-point accumulation errors in financial calculations.
 */

/** Convert a value to paisa (integer) to avoid float math */
function toPaisa(amount: number): number {
  return Math.round(amount * 100);
}

/** Convert paisa back to rupees */
function fromPaisa(paisa: number): number {
  return paisa / 100;
}

/** Add two INR amounts without floating-point drift */
export function addCurrency(a: number, b: number): number {
  return fromPaisa(toPaisa(a) + toPaisa(b));
}

/** Subtract b from a without floating-point drift */
export function subtractCurrency(a: number, b: number): number {
  return fromPaisa(toPaisa(a) - toPaisa(b));
}

/** Sum an array of INR amounts safely */
export function sumCurrency(amounts: number[]): number {
  const paisa = amounts.reduce((s, n) => s + toPaisa(n), 0);
  return fromPaisa(paisa);
}

/** Round to 2 decimal places (paise precision) */
export function roundCurrency(amount: number): number {
  return fromPaisa(toPaisa(amount));
}

/** Format INR for display with Indian number system */
export function formatINR(amount: number, showPaise = false): string {
  const rounded = roundCurrency(amount);
  return rounded.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showPaise ? 2 : 0,
    maximumFractionDigits: showPaise ? 2 : 0,
  });
}

/** Parse a currency string to a safe numeric value */
export function parseCurrencyInput(input: string): number | null {
  if (input.includes('-')) return null;
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed) || parsed < 0) return null;
  return roundCurrency(parsed);
}

/** Calculate balance: contributions minus expenses (integer-safe) */
export function calculateBalance(totalContributions: number, totalExpenses: number): number {
  return subtractCurrency(totalContributions, totalExpenses);
}
