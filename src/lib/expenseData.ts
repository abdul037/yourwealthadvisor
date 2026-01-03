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
  { name: 'Housing', icon: 'Home', color: 'hsl(160, 60%, 45%)' },
  { name: 'Childcare', icon: 'Baby', color: 'hsl(320, 70%, 60%)' },
  { name: 'Other', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 55%)' },
];

// Dubai Family of 4: 2 earning partners, kids aged 5 & 7
// Monthly household expenses ~AED 35,000-40,000
const today = new Date();
const formatDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const sampleExpenses: Expense[] = [
  // Current month - Housing & Major Bills
  { id: '1', category: 'Housing', description: 'Apartment Rent', amount: 8500, currency: 'AED', date: formatDate(1) },
  { id: '2', category: 'Education', description: 'School Fees - Child 1 (Grade 2)', amount: 4500, currency: 'AED', date: formatDate(2) },
  { id: '3', category: 'Education', description: 'School Fees - Child 2 (KG2)', amount: 3800, currency: 'AED', date: formatDate(2) },
  { id: '4', category: 'Childcare', description: 'After-school activities', amount: 1200, currency: 'AED', date: formatDate(3) },
  
  // Groceries & Food
  { id: '5', category: 'Food & Dining', description: 'Carrefour weekly groceries', amount: 850, currency: 'AED', date: formatDate(3) },
  { id: '6', category: 'Food & Dining', description: 'Spinneys organic produce', amount: 420, currency: 'AED', date: formatDate(7) },
  { id: '7', category: 'Food & Dining', description: 'Family dinner - PF Changs', amount: 380, currency: 'AED', date: formatDate(5) },
  { id: '8', category: 'Food & Dining', description: 'Kids birthday party catering', amount: 650, currency: 'AED', date: formatDate(12) },
  { id: '9', category: 'Food & Dining', description: 'Weekly groceries', amount: 780, currency: 'AED', date: formatDate(14) },
  { id: '10', category: 'Food & Dining', description: 'Online grocery delivery', amount: 520, currency: 'AED', date: formatDate(21) },
  
  // Utilities
  { id: '11', category: 'Utilities', description: 'DEWA (electricity + water)', amount: 850, currency: 'AED', date: formatDate(4) },
  { id: '12', category: 'Utilities', description: 'Du Internet + TV', amount: 499, currency: 'AED', date: formatDate(5) },
  { id: '13', category: 'Utilities', description: 'Etisalat Mobile (2 lines)', amount: 350, currency: 'AED', date: formatDate(6) },
  { id: '14', category: 'Utilities', description: 'District cooling (Empower)', amount: 420, currency: 'AED', date: formatDate(8) },
  
  // Transport
  { id: '15', category: 'Transport', description: 'Petrol - Nissan Patrol', amount: 450, currency: 'AED', date: formatDate(2) },
  { id: '16', category: 'Transport', description: 'Petrol - Honda', amount: 180, currency: 'AED', date: formatDate(9) },
  { id: '17', category: 'Transport', description: 'Salik (toll charges)', amount: 120, currency: 'AED', date: formatDate(10) },
  { id: '18', category: 'Transport', description: 'RTA Parking', amount: 85, currency: 'AED', date: formatDate(11) },
  { id: '19', category: 'Transport', description: 'Car wash', amount: 60, currency: 'AED', date: formatDate(15) },
  
  // Healthcare
  { id: '20', category: 'Healthcare', description: 'Pediatric checkup - Child 1', amount: 350, currency: 'AED', date: formatDate(8) },
  { id: '21', category: 'Healthcare', description: 'Pharmacy - vitamins', amount: 180, currency: 'AED', date: formatDate(10) },
  { id: '22', category: 'Healthcare', description: 'Dental cleaning', amount: 450, currency: 'AED', date: formatDate(18) },
  
  // Entertainment & Kids Activities
  { id: '23', category: 'Entertainment', description: 'Dubai Mall - movies + arcade', amount: 320, currency: 'AED', date: formatDate(6) },
  { id: '24', category: 'Entertainment', description: 'Wild Wadi tickets', amount: 580, currency: 'AED', date: formatDate(13) },
  { id: '25', category: 'Childcare', description: 'Swimming lessons (2 kids)', amount: 800, currency: 'AED', date: formatDate(15) },
  { id: '26', category: 'Entertainment', description: 'Netflix + Disney+', amount: 95, currency: 'AED', date: formatDate(1) },
  
  // Shopping
  { id: '27', category: 'Shopping', description: 'Kids school uniforms', amount: 650, currency: 'AED', date: formatDate(20) },
  { id: '28', category: 'Shopping', description: 'IKEA - home items', amount: 420, currency: 'AED', date: formatDate(16) },
  { id: '29', category: 'Shopping', description: 'Kids toys - Toys R Us', amount: 280, currency: 'AED', date: formatDate(22) },
  
  // Subscriptions & Services
  { id: '30', category: 'Subscriptions', description: 'Gym membership (2 adults)', amount: 600, currency: 'AED', date: formatDate(1) },
  { id: '31', category: 'Subscriptions', description: 'Spotify Family', amount: 35, currency: 'AED', date: formatDate(5) },
  { id: '32', category: 'Childcare', description: 'Part-time nanny', amount: 2000, currency: 'AED', date: formatDate(1) },
  
  // Previous months data for charts
  { id: '33', category: 'Housing', description: 'Apartment Rent', amount: 8500, currency: 'AED', date: formatDate(32) },
  { id: '34', category: 'Education', description: 'School Fees - Child 1', amount: 4500, currency: 'AED', date: formatDate(33) },
  { id: '35', category: 'Education', description: 'School Fees - Child 2', amount: 3800, currency: 'AED', date: formatDate(33) },
  { id: '36', category: 'Food & Dining', description: 'Monthly groceries', amount: 2800, currency: 'AED', date: formatDate(40) },
  { id: '37', category: 'Utilities', description: 'DEWA + Internet', amount: 1450, currency: 'AED', date: formatDate(38) },
  { id: '38', category: 'Transport', description: 'Petrol + Salik', amount: 850, currency: 'AED', date: formatDate(45) },
  { id: '39', category: 'Childcare', description: 'Nanny + activities', amount: 3500, currency: 'AED', date: formatDate(35) },
  { id: '40', category: 'Healthcare', description: 'Annual health checkups', amount: 1200, currency: 'AED', date: formatDate(50) },
  
  // 2 months ago
  { id: '41', category: 'Housing', description: 'Apartment Rent', amount: 8500, currency: 'AED', date: formatDate(62) },
  { id: '42', category: 'Education', description: 'School Fees', amount: 8300, currency: 'AED', date: formatDate(63) },
  { id: '43', category: 'Food & Dining', description: 'Groceries + Dining', amount: 3200, currency: 'AED', date: formatDate(70) },
  { id: '44', category: 'Entertainment', description: 'Eid celebration', amount: 2500, currency: 'AED', date: formatDate(68) },
  { id: '45', category: 'Shopping', description: 'Eid shopping', amount: 3500, currency: 'AED', date: formatDate(65) },
  
  // 3 months ago
  { id: '46', category: 'Housing', description: 'Apartment Rent', amount: 8500, currency: 'AED', date: formatDate(92) },
  { id: '47', category: 'Education', description: 'School Fees', amount: 8300, currency: 'AED', date: formatDate(93) },
  { id: '48', category: 'Transport', description: 'Car service + insurance', amount: 2800, currency: 'AED', date: formatDate(95) },
  { id: '49', category: 'Food & Dining', description: 'Monthly groceries', amount: 2600, currency: 'AED', date: formatDate(100) },
  { id: '50', category: 'Childcare', description: 'Summer camp registration', amount: 4000, currency: 'AED', date: formatDate(98) },
  
  // 4 months ago
  { id: '51', category: 'Housing', description: 'Apartment Rent', amount: 8500, currency: 'AED', date: formatDate(122) },
  { id: '52', category: 'Education', description: 'School Fees', amount: 8300, currency: 'AED', date: formatDate(123) },
  { id: '53', category: 'Healthcare', description: 'Kids vaccinations', amount: 1500, currency: 'AED', date: formatDate(130) },
  { id: '54', category: 'Shopping', description: 'Summer clothes', amount: 1800, currency: 'AED', date: formatDate(125) },
  
  // 5 months ago
  { id: '55', category: 'Housing', description: 'Apartment Rent', amount: 8500, currency: 'AED', date: formatDate(152) },
  { id: '56', category: 'Education', description: 'School Fees', amount: 8300, currency: 'AED', date: formatDate(153) },
  { id: '57', category: 'Entertainment', description: 'Family trip - Abu Dhabi', amount: 3500, currency: 'AED', date: formatDate(160) },
  { id: '58', category: 'Food & Dining', description: 'Monthly expenses', amount: 2900, currency: 'AED', date: formatDate(155) },
];

// Budgets for Dubai family of 4
export const sampleBudgets: Budget[] = [
  { id: '1', category: 'Housing', limit: 9000, currency: 'AED', period: 'monthly' },
  { id: '2', category: 'Education', limit: 9000, currency: 'AED', period: 'monthly' },
  { id: '3', category: 'Food & Dining', limit: 4000, currency: 'AED', period: 'monthly' },
  { id: '4', category: 'Transport', limit: 1200, currency: 'AED', period: 'monthly' },
  { id: '5', category: 'Utilities', limit: 2500, currency: 'AED', period: 'monthly' },
  { id: '6', category: 'Childcare', limit: 4500, currency: 'AED', period: 'monthly' },
  { id: '7', category: 'Entertainment', limit: 1500, currency: 'AED', period: 'monthly' },
  { id: '8', category: 'Healthcare', limit: 1500, currency: 'AED', period: 'monthly' },
  { id: '9', category: 'Shopping', limit: 2000, currency: 'AED', period: 'monthly' },
  { id: '10', category: 'Subscriptions', limit: 800, currency: 'AED', period: 'monthly' },
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
