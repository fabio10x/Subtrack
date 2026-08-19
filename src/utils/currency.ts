import { CurrencyCode, CurrencyConfig, BillingCycle } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.78 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.52 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 153.5 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 83.4 },
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', rateToUSD: 0.89 },
};

/**
 * Converts an amount from one currency to target currency
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number {
  if (from === to) return amount;
  // Convert from origin to USD, then USD to target
  const fromRate = CURRENCIES[from]?.rateToUSD || 1.0;
  const toRate = CURRENCIES[to]?.rateToUSD || 1.0;
  const inUSD = amount / fromRate;
  return inUSD * toRate;
}

/**
 * Formats a currency amount with symbol and proper decimal places
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  compact: boolean = false
): string {
  const cfg = CURRENCIES[currency] || CURRENCIES.USD;
  const isJPY = currency === 'JPY';
  
  if (compact && Math.abs(amount) >= 1000) {
    const formatted = (amount / 1000).toFixed(1);
    return `${cfg.symbol}${formatted}k`;
  }

  const formattedNum = amount.toLocaleString(undefined, {
    minimumFractionDigits: isJPY ? 0 : 2,
    maximumFractionDigits: isJPY ? 0 : 2,
  });

  return `${cfg.symbol}${formattedNum}`;
}

/**
 * Calculates monthly equivalent cost of a subscription
 */
export function getMonthlyEquivalent(
  cost: number,
  cycle: BillingCycle,
  fromCurrency: CurrencyCode,
  targetCurrency: CurrencyCode
): number {
  const convertedCost = convertCurrency(cost, fromCurrency, targetCurrency);
  switch (cycle) {
    case 'weekly':
      return (convertedCost * 52) / 12;
    case 'monthly':
      return convertedCost;
    case 'quarterly':
      return convertedCost / 3;
    case 'yearly':
      return convertedCost / 12;
    default:
      return convertedCost;
  }
}

/**
 * Calculates annual equivalent cost of a subscription
 */
export function getAnnualEquivalent(
  cost: number,
  cycle: BillingCycle,
  fromCurrency: CurrencyCode,
  targetCurrency: CurrencyCode
): number {
  const monthly = getMonthlyEquivalent(cost, cycle, fromCurrency, targetCurrency);
  return monthly * 12;
}
