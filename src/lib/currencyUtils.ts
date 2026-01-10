// Centralized currency conversion utility

export const EXCHANGE_RATES: Record<string, number> = {
  USD_AED: 3.67,
  INR_AED: 0.044,
  PKR_AED: 0.013,
  AED_AED: 1,
  AED_USD: 0.27,
  AED_INR: 22.7,
  AED_PKR: 76.9,
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
