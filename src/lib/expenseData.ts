import { Currency } from './portfolioData';

export interface Budget {
  id: string;
  category: string;
  limit: number;
  currency: Currency;
  period: 'monthly' | 'weekly';
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
}

export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'UtensilsCrossed', color: 'hsl(32, 95%, 55%)' },
  { name: 'Transport', icon: 'Car', color: 'hsl(200, 70%, 50%)' },
  { name: 'Utilities', icon: 'Zap', color: 'hsl(45, 93%, 50%)' },
  { name: 'Entertainment', icon: 'Gamepad2', color: 'hsl(280, 65%, 60%)' },
  { name: 'Shopping', icon: 'ShoppingBag', color: 'hsl(340, 75%, 55%)' },
  { name: 'Healthcare', icon: 'Heart', color: 'hsl(0, 84%, 60%)' },
  { name: 'Education', icon: 'GraduationCap', color: 'hsl(217, 91%, 60%)' },
  { name: 'Subscriptions', icon: 'CreditCard', color: 'hsl(262, 83%, 58%)' },
  { name: 'Other', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 55%)' },
];

// Sample expenses for demo - using relative dates
const today = new Date();
const formatDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const sampleExpenses: Expense[] = [
  { id: '1', category: 'Food & Dining', description: 'Grocery shopping', amount: 450, currency: 'AED', date: formatDate(1) },
  { id: '2', category: 'Transport', description: 'Fuel', amount: 200, currency: 'AED', date: formatDate(1) },
  { id: '3', category: 'Utilities', description: 'DEWA Bill', amount: 380, currency: 'AED', date: formatDate(2) },
  { id: '4', category: 'Entertainment', description: 'Netflix', amount: 55, currency: 'AED', date: formatDate(2) },
  { id: '5', category: 'Shopping', description: 'Clothes', amount: 320, currency: 'AED', date: formatDate(4) },
  { id: '6', category: 'Food & Dining', description: 'Restaurant', amount: 180, currency: 'AED', date: formatDate(5) },
  { id: '7', category: 'Healthcare', description: 'Pharmacy', amount: 85, currency: 'AED', date: formatDate(6) },
  { id: '8', category: 'Transport', description: 'RTA Parking', amount: 40, currency: 'AED', date: formatDate(7) },
  { id: '9', category: 'Subscriptions', description: 'Spotify', amount: 25, currency: 'AED', date: formatDate(9) },
  { id: '10', category: 'Food & Dining', description: 'Coffee shop', amount: 35, currency: 'AED', date: formatDate(10) },
  { id: '11', category: 'Utilities', description: 'Internet', amount: 299, currency: 'AED', date: formatDate(14) },
  { id: '12', category: 'Shopping', description: 'Electronics', amount: 899, currency: 'AED', date: formatDate(16) },
  { id: '13', category: 'Food & Dining', description: 'Grocery', amount: 520, currency: 'AED', date: formatDate(19) },
  { id: '14', category: 'Entertainment', description: 'Movies', amount: 120, currency: 'AED', date: formatDate(22) },
  { id: '15', category: 'Transport', description: 'Uber', amount: 65, currency: 'AED', date: formatDate(24) },
  // Previous months data
  { id: '16', category: 'Food & Dining', description: 'Groceries', amount: 580, currency: 'AED', date: formatDate(35) },
  { id: '17', category: 'Transport', description: 'Fuel', amount: 250, currency: 'AED', date: formatDate(38) },
  { id: '18', category: 'Shopping', description: 'Home items', amount: 450, currency: 'AED', date: formatDate(42) },
  { id: '19', category: 'Utilities', description: 'DEWA', amount: 420, currency: 'AED', date: formatDate(45) },
  { id: '20', category: 'Entertainment', description: 'Concert', amount: 350, currency: 'AED', date: formatDate(50) },
  { id: '21', category: 'Food & Dining', description: 'Restaurant', amount: 290, currency: 'AED', date: formatDate(55) },
  { id: '22', category: 'Transport', description: 'Car service', amount: 800, currency: 'AED', date: formatDate(60) },
  { id: '23', category: 'Shopping', description: 'Gifts', amount: 600, currency: 'AED', date: formatDate(65) },
  { id: '24', category: 'Food & Dining', description: 'Groceries', amount: 480, currency: 'AED', date: formatDate(70) },
  { id: '25', category: 'Utilities', description: 'Phone', amount: 180, currency: 'AED', date: formatDate(75) },
  { id: '26', category: 'Entertainment', description: 'Games', amount: 200, currency: 'AED', date: formatDate(80) },
  { id: '27', category: 'Food & Dining', description: 'Dining out', amount: 350, currency: 'AED', date: formatDate(90) },
  { id: '28', category: 'Shopping', description: 'Clothes', amount: 700, currency: 'AED', date: formatDate(100) },
  { id: '29', category: 'Transport', description: 'Flight', amount: 1200, currency: 'AED', date: formatDate(110) },
  { id: '30', category: 'Food & Dining', description: 'Groceries', amount: 550, currency: 'AED', date: formatDate(120) },
];

export const sampleBudgets: Budget[] = [
  { id: '1', category: 'Food & Dining', limit: 2000, currency: 'AED', period: 'monthly' },
  { id: '2', category: 'Transport', limit: 800, currency: 'AED', period: 'monthly' },
  { id: '3', category: 'Entertainment', limit: 500, currency: 'AED', period: 'monthly' },
  { id: '4', category: 'Shopping', limit: 1500, currency: 'AED', period: 'monthly' },
  { id: '5', category: 'Utilities', limit: 1000, currency: 'AED', period: 'monthly' },
];

export function getCategoryColor(categoryName: string): string {
  const category = EXPENSE_CATEGORIES.find(c => c.name === categoryName);
  return category?.color || 'hsl(215, 20%, 55%)';
}

export function getMonthlySpending(expenses: Expense[], month: number, year: number): number {
  return expenses
    .filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === month && date.getFullYear() === year;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getSpendingByCategory(expenses: Expense[], month?: number, year?: number): Record<string, number> {
  const filtered = month !== undefined && year !== undefined
    ? expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === month && date.getFullYear() === year;
      })
    : expenses;
  
  return filtered.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
}
