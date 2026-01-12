// Centralized currency conversion utility

export const EXCHANGE_RATES: Record<string, number> = {
  USD_AED: 3.67,
  INR_AED: 0.044,
  PKR_AED: 0.013,
  EUR_AED: 4.00,
  GBP_AED: 4.66,
  SAR_AED: 0.98,
  BTC_AED: 367000, // ~$100,000 * 3.67
  AED_AED: 1,
  // Reverse rates
  AED_USD: 0.27,
  AED_INR: 22.7,
  AED_PKR: 76.9,
  AED_EUR: 0.25,
  AED_GBP: 0.21,
  AED_SAR: 1.02,
  AED_BTC: 0.0000027,
};

export function convertToAED(amount: number, currency: string = 'AED'): number {
  if (!amount || isNaN(amount)) return 0;
  const key = `${currency.toUpperCase()}_AED`;
  const rate = EXCHANGE_RATES[key] || 1;
  return amount * rate;
}

export function convertFromAED(amount: number, targetCurrency: string = 'AED'): number {
  if (!amount || isNaN(amount)) return 0;
  const key = `AED_${targetCurrency.toUpperCase()}`;
  const rate = EXCHANGE_RATES[key] || 1;
  return amount * rate;
}

// Categories that should be treated as cash equivalents
export const CASH_EQUIVALENT_CATEGORIES = [
  'Cash',
  'Fixed Deposit',
  'Savings',
  'Bank Account',
  'Money Market',
];

// Check if a category is a cash equivalent
export function isCashEquivalent(category: string): boolean {
  return CASH_EQUIVALENT_CATEGORIES.some(
    c => c.toLowerCase() === category.toLowerCase()
  );
}
