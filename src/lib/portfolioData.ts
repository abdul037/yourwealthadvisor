export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  amount: number;
  unit: Currency;
  aedValue: number;
  usdValue: number;
  inrValue: number;
  liquidityLevel: LiquidityLevel;
  isCash: boolean;
}

export type Currency = 'AED' | 'USD' | 'INR' | 'PND' | 'KWD' | 'OMR' | 'JOR' | 'SAR';

export type AssetCategory = 
  | 'Land Asset'
  | 'Stocks'
  | 'Cash'
  | 'Car'
  | 'Bonds'
  | 'TokenRE'
  | 'Gold'
  | 'Insurance'
  | 'PF'
  | 'Crypto'
  | 'DigiGold';

export type LiquidityLevel = 'L1' | 'L2' | 'L3' | 'NL';

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  'Land Asset': 'hsl(var(--asset-land))',
  'Stocks': 'hsl(var(--asset-stocks))',
  'Cash': 'hsl(var(--asset-cash))',
  'Car': 'hsl(var(--asset-car))',
  'Bonds': 'hsl(var(--asset-bonds))',
  'TokenRE': 'hsl(var(--asset-real-estate))',
  'Gold': 'hsl(var(--asset-gold))',
  'Insurance': 'hsl(var(--asset-insurance))',
  'PF': 'hsl(var(--asset-pf))',
  'Crypto': 'hsl(var(--asset-crypto))',
  'DigiGold': 'hsl(var(--asset-gold))',
};

export const LIQUIDITY_LABELS: Record<LiquidityLevel, string> = {
  'L1': 'Highly Liquid',
  'L2': 'Liquid',
  'L3': 'Semi-Liquid',
  'NL': 'Non-Liquid',
};

export const initialPortfolio: Asset[] = [
  { id: '1', name: 'Current ENBD', category: 'Cash', amount: 13706, unit: 'AED', aedValue: 13706, usdValue: 3701, inrValue: 334975, liquidityLevel: 'L1', isCash: true },
  { id: '2', name: 'ENBD Securities', category: 'Stocks', amount: 2061, unit: 'AED', aedValue: 2061, usdValue: 556, inrValue: 50371, liquidityLevel: 'L2', isCash: false },
  { id: '3', name: 'National Bonds', category: 'Bonds', amount: 23900, unit: 'AED', aedValue: 23900, usdValue: 6453, inrValue: 584116, liquidityLevel: 'L2', isCash: false },
  { id: '4', name: 'Etoro', category: 'Stocks', amount: 4931, unit: 'USD', aedValue: 18097, usdValue: 4931, inrValue: 443100, liquidityLevel: 'L2', isCash: false },
  { id: '5', name: 'Sarwa', category: 'Stocks', amount: 7424, unit: 'USD', aedValue: 27246, usdValue: 7424, inrValue: 667121, liquidityLevel: 'L2', isCash: false },
  { id: '6', name: 'SMCWD', category: 'TokenRE', amount: 4000, unit: 'AED', aedValue: 4000, usdValue: 1080, inrValue: 97760, liquidityLevel: 'L2', isCash: false },
  { id: '7', name: 'KITE', category: 'Stocks', amount: 432000, unit: 'INR', aedValue: 17712, usdValue: 4752, inrValue: 432000, liquidityLevel: 'L2', isCash: false },
  { id: '8', name: 'MF', category: 'Stocks', amount: 258000, unit: 'INR', aedValue: 10578, usdValue: 2838, inrValue: 258000, liquidityLevel: 'L2', isCash: false },
  { id: '9', name: 'Gold', category: 'Gold', amount: 5900, unit: 'AED', aedValue: 5900, usdValue: 1593, inrValue: 144196, liquidityLevel: 'L3', isCash: false },
  { id: '10', name: 'PF', category: 'PF', amount: 75000, unit: 'INR', aedValue: 3075, usdValue: 825, inrValue: 75000, liquidityLevel: 'NL', isCash: false },
  { id: '11', name: 'LND', category: 'Land Asset', amount: 3000000, unit: 'INR', aedValue: 123000, usdValue: 33000, inrValue: 3000000, liquidityLevel: 'NL', isCash: false },
  { id: '12', name: 'ARSHD', category: 'Cash', amount: 225000, unit: 'INR', aedValue: 9225, usdValue: 2475, inrValue: 225000, liquidityLevel: 'NL', isCash: true },
  { id: '13', name: 'BB', category: 'Cash', amount: 150000, unit: 'INR', aedValue: 6150, usdValue: 1650, inrValue: 150000, liquidityLevel: 'NL', isCash: true },
  { id: '14', name: 'WZRX', category: 'Crypto', amount: 20000, unit: 'INR', aedValue: 820, usdValue: 220, inrValue: 20000, liquidityLevel: 'L2', isCash: false },
  { id: '15', name: 'Car', category: 'Car', amount: 40000, unit: 'AED', aedValue: 40000, usdValue: 10800, inrValue: 977600, liquidityLevel: 'NL', isCash: false },
  { id: '16', name: 'Cash AED (bag)', category: 'Cash', amount: 9625, unit: 'AED', aedValue: 9625, usdValue: 2599, inrValue: 235235, liquidityLevel: 'L1', isCash: true },
  { id: '17', name: 'Cash Pounds (Bag)', category: 'Cash', amount: 185, unit: 'PND', aedValue: 917, usdValue: 250, inrValue: 22401, liquidityLevel: 'L3', isCash: true },
  { id: '18', name: 'ENBD SAVE', category: 'Cash', amount: 2990, unit: 'AED', aedValue: 2990, usdValue: 807, inrValue: 73076, liquidityLevel: 'L1', isCash: true },
  { id: '19', name: 'Etoro Cash', category: 'Cash', amount: 412, unit: 'USD', aedValue: 1512, usdValue: 412, inrValue: 36954, liquidityLevel: 'L1', isCash: true },
  { id: '20', name: 'Insurance', category: 'Insurance', amount: 5505, unit: 'AED', aedValue: 5505, usdValue: 1500, inrValue: 134542, liquidityLevel: 'L3', isCash: false },
  { id: '21', name: 'TokenRE Additional', category: 'TokenRE', amount: 12378, unit: 'AED', aedValue: 12378, usdValue: 3342, inrValue: 302518, liquidityLevel: 'L2', isCash: false },
  { id: '22', name: 'DigiGold', category: 'DigiGold', amount: 1007, unit: 'AED', aedValue: 1007, usdValue: 275, inrValue: 24622, liquidityLevel: 'L2', isCash: false },
];

export interface Transaction {
  id: string;
  type: 'expense' | 'investment' | 'income';
  category: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
}

export const EXCHANGE_RATES: Record<string, number> = {
  'AED_USD': 0.27,
  'AED_INR': 24.44,
  'USD_AED': 3.67,
  'USD_INR': 89.86,
  'INR_AED': 0.041,
  'INR_USD': 0.011,
};

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  const key = `${from}_${to}`;
  const rate = EXCHANGE_RATES[key];
  if (rate) return amount * rate;
  return amount;
}

export function formatCurrency(amount: number, currency: Currency = 'AED'): string {
  const symbols: Record<Currency, string> = {
    'AED': 'AED ',
    'USD': '$',
    'INR': '₹',
    'PND': '£',
    'KWD': 'KWD ',
    'OMR': 'OMR ',
    'JOR': 'JOD ',
    'SAR': 'SAR ',
  };
  
  return `${symbols[currency]}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatCompact(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}
