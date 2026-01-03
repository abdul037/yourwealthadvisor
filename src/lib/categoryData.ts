import { Currency } from './portfolioData';

// Dynamic category management
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface NetWorthSnapshot {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export interface Milestone {
  id: string;
  name: string;
  targetAmount: number;
  targetDate?: string;
  achieved: boolean;
  achievedDate?: string;
  currency: Currency;
}

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', type: 'expense', icon: 'UtensilsCrossed', color: 'hsl(32, 95%, 55%)', isDefault: true },
  { id: '2', name: 'Transport', type: 'expense', icon: 'Car', color: 'hsl(200, 70%, 50%)', isDefault: true },
  { id: '3', name: 'Utilities', type: 'expense', icon: 'Zap', color: 'hsl(45, 93%, 50%)', isDefault: true },
  { id: '4', name: 'Entertainment', type: 'expense', icon: 'Gamepad2', color: 'hsl(280, 65%, 60%)', isDefault: true },
  { id: '5', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: 'hsl(340, 75%, 55%)', isDefault: true },
  { id: '6', name: 'Healthcare', type: 'expense', icon: 'Heart', color: 'hsl(0, 84%, 60%)', isDefault: true },
  { id: '7', name: 'Education', type: 'expense', icon: 'GraduationCap', color: 'hsl(217, 91%, 60%)', isDefault: true },
  { id: '8', name: 'Subscriptions', type: 'expense', icon: 'CreditCard', color: 'hsl(262, 83%, 58%)', isDefault: true },
  { id: '9', name: 'Housing', type: 'expense', icon: 'Home', color: 'hsl(160, 60%, 45%)', isDefault: true },
  { id: '10', name: 'Childcare', type: 'expense', icon: 'Baby', color: 'hsl(320, 70%, 60%)', isDefault: true },
  { id: '11', name: 'Other', type: 'expense', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 55%)', isDefault: true },
];

// Default income categories
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: '20', name: 'Salary', type: 'income', icon: 'Briefcase', color: 'hsl(var(--primary))', isDefault: true },
  { id: '21', name: 'Bonus', type: 'income', icon: 'Gift', color: 'hsl(142, 76%, 45%)', isDefault: true },
  { id: '22', name: 'Freelance', type: 'income', icon: 'Laptop', color: 'hsl(262, 83%, 58%)', isDefault: true },
  { id: '23', name: 'Investment', type: 'income', icon: 'TrendingUp', color: 'hsl(45, 93%, 50%)', isDefault: true },
  { id: '24', name: 'Rental', type: 'income', icon: 'Home', color: 'hsl(200, 70%, 50%)', isDefault: true },
  { id: '25', name: 'Dividend', type: 'income', icon: 'Coins', color: 'hsl(38, 92%, 50%)', isDefault: true },
  { id: '26', name: 'Side Business', type: 'income', icon: 'Store', color: 'hsl(173, 80%, 40%)', isDefault: true },
  { id: '27', name: 'Other', type: 'income', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 55%)', isDefault: true },
];

// Sample milestones for Dubai family
export const sampleMilestones: Milestone[] = [
  { id: '1', name: 'Emergency Fund (6 months)', targetAmount: 150000, achieved: true, achievedDate: '2025-06-15', currency: 'AED' },
  { id: '2', name: 'Kids College Fund', targetAmount: 500000, targetDate: '2035-09-01', achieved: false, currency: 'AED' },
  { id: '3', name: 'Villa Down Payment', targetAmount: 800000, targetDate: '2028-12-31', achieved: false, currency: 'AED' },
  { id: '4', name: 'Investment Portfolio 1M', targetAmount: 1000000, targetDate: '2030-01-01', achieved: false, currency: 'AED' },
  { id: '5', name: 'Net Worth 5M AED', targetAmount: 5000000, targetDate: '2035-01-01', achieved: false, currency: 'AED' },
];

// Generate historical net worth data (simulated 12 months)
export function generateNetWorthHistory(currentNetWorth: number): NetWorthSnapshot[] {
  const history: NetWorthSnapshot[] = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate growth with some variance
    const monthsAgo = i;
    const growthFactor = 1 - (monthsAgo * 0.018) + (Math.random() * 0.02 - 0.01);
    const netWorth = Math.round(currentNetWorth * growthFactor);
    
    history.push({
      date: date.toISOString().split('T')[0],
      totalAssets: Math.round(netWorth * 1.02), // Slight difference for assets
      totalLiabilities: Math.round(netWorth * 0.02),
      netWorth,
    });
  }
  
  return history;
}

// Calculate projected net worth based on savings rate
export function calculateProjection(
  currentNetWorth: number,
  monthlySavings: number,
  monthsAhead: number,
  annualGrowthRate: number = 0.08
): NetWorthSnapshot[] {
  const projections: NetWorthSnapshot[] = [];
  const now = new Date();
  const monthlyGrowthRate = Math.pow(1 + annualGrowthRate, 1/12) - 1;
  
  let projectedWorth = currentNetWorth;
  
  for (let i = 1; i <= monthsAhead; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() + i);
    
    projectedWorth = (projectedWorth + monthlySavings) * (1 + monthlyGrowthRate);
    
    projections.push({
      date: date.toISOString().split('T')[0],
      totalAssets: Math.round(projectedWorth * 1.02),
      totalLiabilities: Math.round(projectedWorth * 0.02),
      netWorth: Math.round(projectedWorth),
    });
  }
  
  return projections;
}

// Parse CSV/Excel bulk upload data
export interface BulkUploadRow {
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  currency: string;
}

export function parseCSVData(csvText: string): BulkUploadRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const rows: BulkUploadRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 5) {
      rows.push({
        date: values[headers.indexOf('date')] || new Date().toISOString().split('T')[0],
        type: (values[headers.indexOf('type')]?.toLowerCase() as 'income' | 'expense') || 'expense',
        category: values[headers.indexOf('category')] || 'Other',
        description: values[headers.indexOf('description')] || '',
        amount: parseFloat(values[headers.indexOf('amount')]) || 0,
        currency: values[headers.indexOf('currency')]?.toUpperCase() || 'AED',
      });
    }
  }
  
  return rows;
}
