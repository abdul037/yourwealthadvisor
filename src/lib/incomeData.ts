import { Currency } from './portfolioData';

export interface IncomeSource {
  id: string;
  partner: 'Partner 1' | 'Partner 2' | 'Joint';
  type: 'salary' | 'bonus' | 'freelance' | 'investment' | 'rental' | 'other';
  description: string;
  amount: number;
  currency: Currency;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  date: string;
}

export interface MonthlyIncome {
  month: string;
  year: number;
  partner1: number;
  partner2: number;
  bonus: number;
  other: number;
  total: number;
}

export const INCOME_TYPES = [
  { name: 'salary', label: 'Salary', color: 'hsl(var(--primary))' },
  { name: 'bonus', label: 'Bonus', color: 'hsl(142, 76%, 45%)' },
  { name: 'freelance', label: 'Freelance', color: 'hsl(262, 83%, 58%)' },
  { name: 'investment', label: 'Investment', color: 'hsl(45, 93%, 50%)' },
  { name: 'rental', label: 'Rental', color: 'hsl(200, 70%, 50%)' },
  { name: 'other', label: 'Other', color: 'hsl(215, 20%, 55%)' },
];

export const PARTNER_COLORS = {
  'Partner 1': 'hsl(var(--primary))',
  'Partner 2': 'hsl(280, 65%, 60%)',
  'Joint': 'hsl(142, 76%, 45%)',
};

// Dubai Family: Partner 1 - Senior role AED 32,000/mo, Partner 2 - Mid-level AED 23,000/mo
const today = new Date();
const formatDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const sampleIncomeSources: IncomeSource[] = [
  // Current month salaries
  { id: '1', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary - Tech Lead', amount: 32000, currency: 'AED', frequency: 'monthly', date: formatDate(1) },
  { id: '2', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary - Marketing Manager', amount: 23000, currency: 'AED', frequency: 'monthly', date: formatDate(1) },
  
  // Previous months
  { id: '3', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary', amount: 32000, currency: 'AED', frequency: 'monthly', date: formatDate(32) },
  { id: '4', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary', amount: 23000, currency: 'AED', frequency: 'monthly', date: formatDate(32) },
  { id: '5', partner: 'Partner 1', type: 'bonus', description: 'Q4 Performance Bonus', amount: 15000, currency: 'AED', frequency: 'quarterly', date: formatDate(35) },
  
  { id: '6', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary', amount: 32000, currency: 'AED', frequency: 'monthly', date: formatDate(62) },
  { id: '7', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary', amount: 23000, currency: 'AED', frequency: 'monthly', date: formatDate(62) },
  { id: '8', partner: 'Partner 2', type: 'bonus', description: 'Year-end Bonus', amount: 12000, currency: 'AED', frequency: 'annual', date: formatDate(65) },
  
  { id: '9', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary', amount: 32000, currency: 'AED', frequency: 'monthly', date: formatDate(92) },
  { id: '10', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary', amount: 23000, currency: 'AED', frequency: 'monthly', date: formatDate(92) },
  { id: '11', partner: 'Joint', type: 'investment', description: 'Dividend Income - ENBD Securities', amount: 2500, currency: 'AED', frequency: 'quarterly', date: formatDate(95) },
  
  { id: '12', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary', amount: 32000, currency: 'AED', frequency: 'monthly', date: formatDate(122) },
  { id: '13', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary', amount: 23000, currency: 'AED', frequency: 'monthly', date: formatDate(122) },
  { id: '14', partner: 'Partner 1', type: 'freelance', description: 'Consulting Project', amount: 8000, currency: 'AED', frequency: 'one-time', date: formatDate(125) },
  
  { id: '15', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary', amount: 32000, currency: 'AED', frequency: 'monthly', date: formatDate(152) },
  { id: '16', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary', amount: 23000, currency: 'AED', frequency: 'monthly', date: formatDate(152) },
  { id: '17', partner: 'Joint', type: 'rental', description: 'India Property Rental', amount: 45000, currency: 'INR', frequency: 'monthly', date: formatDate(155) },
  
  { id: '18', partner: 'Partner 1', type: 'salary', description: 'Monthly Salary', amount: 30000, currency: 'AED', frequency: 'monthly', date: formatDate(182) },
  { id: '19', partner: 'Partner 2', type: 'salary', description: 'Monthly Salary', amount: 22000, currency: 'AED', frequency: 'monthly', date: formatDate(182) },
  { id: '20', partner: 'Partner 1', type: 'bonus', description: 'Mid-year Bonus', amount: 10000, currency: 'AED', frequency: 'annual', date: formatDate(185) },
];

export function getIncomeTypeColor(type: string): string {
  const incomeType = INCOME_TYPES.find(t => t.name === type);
  return incomeType?.color || 'hsl(215, 20%, 55%)';
}

export function getMonthlyIncomeData(incomeSources: IncomeSource[]): MonthlyIncome[] {
  const monthlyData: Record<string, MonthlyIncome> = {};
  
  // Get last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleString('default', { month: 'short' });
    months.push({ key, monthName, year: date.getFullYear(), month: date.getMonth() });
    monthlyData[key] = {
      month: monthName,
      year: date.getFullYear(),
      partner1: 0,
      partner2: 0,
      bonus: 0,
      other: 0,
      total: 0,
    };
  }
  
  incomeSources.forEach(income => {
    const date = new Date(income.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (monthlyData[key]) {
      // Convert INR to AED for consistency
      const amount = income.currency === 'INR' ? income.amount * 0.041 : income.amount;
      
      if (income.type === 'salary') {
        if (income.partner === 'Partner 1') {
          monthlyData[key].partner1 += amount;
        } else if (income.partner === 'Partner 2') {
          monthlyData[key].partner2 += amount;
        }
      } else if (income.type === 'bonus') {
        monthlyData[key].bonus += amount;
      } else {
        monthlyData[key].other += amount;
      }
      monthlyData[key].total += amount;
    }
  });
  
  return months.map(m => monthlyData[m.key]);
}

export function getIncomeByPartner(incomeSources: IncomeSource[], month?: number, year?: number): Record<string, number> {
  const filtered = month !== undefined && year !== undefined
    ? incomeSources.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
    : incomeSources;
  
  return filtered.reduce((acc, income) => {
    const amount = income.currency === 'INR' ? income.amount * 0.041 : income.amount;
    acc[income.partner] = (acc[income.partner] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
}

export function getIncomeByType(incomeSources: IncomeSource[], month?: number, year?: number): Record<string, number> {
  const filtered = month !== undefined && year !== undefined
    ? incomeSources.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
    : incomeSources;
  
  return filtered.reduce((acc, income) => {
    const amount = income.currency === 'INR' ? income.amount * 0.041 : income.amount;
    const type = INCOME_TYPES.find(t => t.name === income.type)?.label || 'Other';
    acc[type] = (acc[type] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
}
