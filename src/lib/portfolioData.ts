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

// Dubai Family of 4: 2 earning partners, kids aged 5 & 7
// Combined household income ~AED 55,000/month
export const initialPortfolio: Asset[] = [
  // Cash & Savings - Emergency Fund + Daily Operations
  { id: '1', name: 'ENBD Joint Account', category: 'Cash', amount: 45000, unit: 'AED', aedValue: 45000, usdValue: 12150, inrValue: 1099800, liquidityLevel: 'L1', isCash: true },
  { id: '2', name: 'Partner 1 Salary Account', category: 'Cash', amount: 28500, unit: 'AED', aedValue: 28500, usdValue: 7695, inrValue: 696540, liquidityLevel: 'L1', isCash: true },
  { id: '3', name: 'Partner 2 Salary Account', category: 'Cash', amount: 22000, unit: 'AED', aedValue: 22000, usdValue: 5940, inrValue: 537680, liquidityLevel: 'L1', isCash: true },
  { id: '4', name: 'Kids Education Fund', category: 'Cash', amount: 85000, unit: 'AED', aedValue: 85000, usdValue: 22950, inrValue: 2077400, liquidityLevel: 'L2', isCash: true },
  { id: '5', name: 'Emergency Fund (6 months)', category: 'Cash', amount: 150000, unit: 'AED', aedValue: 150000, usdValue: 40500, inrValue: 3666000, liquidityLevel: 'L2', isCash: true },
  
  // Investments - Stocks & ETFs
  { id: '6', name: 'Sarwa Portfolio', category: 'Stocks', amount: 18500, unit: 'USD', aedValue: 67895, usdValue: 18500, inrValue: 1662410, liquidityLevel: 'L2', isCash: false },
  { id: '7', name: 'Interactive Brokers', category: 'Stocks', amount: 12800, unit: 'USD', aedValue: 46976, usdValue: 12800, inrValue: 1150208, liquidityLevel: 'L2', isCash: false },
  { id: '8', name: 'ENBD Securities (DFM)', category: 'Stocks', amount: 35000, unit: 'AED', aedValue: 35000, usdValue: 9450, inrValue: 855400, liquidityLevel: 'L2', isCash: false },
  { id: '9', name: 'India MF (Partner 1)', category: 'Stocks', amount: 850000, unit: 'INR', aedValue: 34850, usdValue: 9410, inrValue: 850000, liquidityLevel: 'L2', isCash: false },
  { id: '10', name: 'India MF (Partner 2)', category: 'Stocks', amount: 620000, unit: 'INR', aedValue: 25420, usdValue: 6863, inrValue: 620000, liquidityLevel: 'L2', isCash: false },
  
  // Bonds & Fixed Income
  { id: '11', name: 'National Bonds UAE', category: 'Bonds', amount: 75000, unit: 'AED', aedValue: 75000, usdValue: 20250, inrValue: 1833000, liquidityLevel: 'L2', isCash: false },
  { id: '12', name: 'Sukuk Fund', category: 'Bonds', amount: 40000, unit: 'AED', aedValue: 40000, usdValue: 10800, inrValue: 977600, liquidityLevel: 'L2', isCash: false },
  
  // Real Estate
  { id: '13', name: 'Family Home (Apartment)', category: 'Land Asset', amount: 1800000, unit: 'AED', aedValue: 1800000, usdValue: 486000, inrValue: 43992000, liquidityLevel: 'NL', isCash: false },
  { id: '14', name: 'Plot in India', category: 'Land Asset', amount: 4500000, unit: 'INR', aedValue: 184500, usdValue: 49815, inrValue: 4500000, liquidityLevel: 'NL', isCash: false },
  { id: '15', name: 'Stake (Rental REIT)', category: 'TokenRE', amount: 25000, unit: 'AED', aedValue: 25000, usdValue: 6750, inrValue: 611000, liquidityLevel: 'L2', isCash: false },
  
  // Gold & Precious Metals
  { id: '16', name: 'Physical Gold (Wife)', category: 'Gold', amount: 65000, unit: 'AED', aedValue: 65000, usdValue: 17550, inrValue: 1588600, liquidityLevel: 'L3', isCash: false },
  { id: '17', name: 'Digital Gold', category: 'DigiGold', amount: 8500, unit: 'AED', aedValue: 8500, usdValue: 2295, inrValue: 207740, liquidityLevel: 'L2', isCash: false },
  
  // Retirement & Long-term
  { id: '18', name: 'Partner 1 PF India', category: 'PF', amount: 450000, unit: 'INR', aedValue: 18450, usdValue: 4982, inrValue: 450000, liquidityLevel: 'NL', isCash: false },
  { id: '19', name: 'Partner 2 PF India', category: 'PF', amount: 280000, unit: 'INR', aedValue: 11480, usdValue: 3099, inrValue: 280000, liquidityLevel: 'NL', isCash: false },
  { id: '20', name: 'GRATUITY Accrued', category: 'PF', amount: 95000, unit: 'AED', aedValue: 95000, usdValue: 25650, inrValue: 2321800, liquidityLevel: 'NL', isCash: false },
  
  // Insurance & Protection
  { id: '21', name: 'Term Life (Partner 1)', category: 'Insurance', amount: 15000, unit: 'AED', aedValue: 15000, usdValue: 4050, inrValue: 366600, liquidityLevel: 'L3', isCash: false },
  { id: '22', name: 'Term Life (Partner 2)', category: 'Insurance', amount: 12000, unit: 'AED', aedValue: 12000, usdValue: 3240, inrValue: 293280, liquidityLevel: 'L3', isCash: false },
  { id: '23', name: 'Endowment Policy', category: 'Insurance', amount: 85000, unit: 'AED', aedValue: 85000, usdValue: 22950, inrValue: 2077400, liquidityLevel: 'L3', isCash: false },
  
  // Vehicles
  { id: '24', name: 'Family SUV (Nissan Patrol)', category: 'Car', amount: 85000, unit: 'AED', aedValue: 85000, usdValue: 22950, inrValue: 2077400, liquidityLevel: 'NL', isCash: false },
  { id: '25', name: 'Second Car (Honda)', category: 'Car', amount: 35000, unit: 'AED', aedValue: 35000, usdValue: 9450, inrValue: 855400, liquidityLevel: 'NL', isCash: false },
  
  // Crypto (Small Allocation)
  { id: '26', name: 'Bitcoin', category: 'Crypto', amount: 2500, unit: 'USD', aedValue: 9175, usdValue: 2500, inrValue: 224650, liquidityLevel: 'L2', isCash: false },
  { id: '27', name: 'Ethereum', category: 'Crypto', amount: 1200, unit: 'USD', aedValue: 4404, usdValue: 1200, inrValue: 107832, liquidityLevel: 'L2', isCash: false },
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
