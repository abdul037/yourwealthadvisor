import { Currency } from './portfolioData';

export interface Debt {
  id: string;
  name: string;
  type: 'credit_card' | 'car_loan' | 'mortgage' | 'personal_loan' | 'student_loan' | 'other';
  principal: number;
  currentBalance: number;
  interestRate: number; // Annual percentage
  minimumPayment: number;
  monthlyPayment: number;
  startDate: string;
  endDate?: string;
  currency: Currency;
  lender: string;
}

export interface PayoffProjection {
  month: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const DEBT_TYPES = [
  { name: 'credit_card', label: 'Credit Card', icon: 'CreditCard', color: 'hsl(340, 75%, 55%)' },
  { name: 'car_loan', label: 'Car Loan', icon: 'Car', color: 'hsl(200, 70%, 50%)' },
  { name: 'mortgage', label: 'Mortgage', icon: 'Home', color: 'hsl(142, 71%, 45%)' },
  { name: 'personal_loan', label: 'Personal Loan', icon: 'Wallet', color: 'hsl(262, 83%, 58%)' },
  { name: 'student_loan', label: 'Student Loan', icon: 'GraduationCap', color: 'hsl(217, 91%, 60%)' },
  { name: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 55%)' },
];

// Sample debts for Dubai family
export const sampleDebts: Debt[] = [
  {
    id: '1',
    name: 'Nissan Patrol Loan',
    type: 'car_loan',
    principal: 180000,
    currentBalance: 85000,
    interestRate: 3.99,
    minimumPayment: 2800,
    monthlyPayment: 3200,
    startDate: '2022-06-01',
    endDate: '2027-06-01',
    currency: 'AED',
    lender: 'Emirates NBD',
  },
  {
    id: '2',
    name: 'ADCB Credit Card',
    type: 'credit_card',
    principal: 25000,
    currentBalance: 12500,
    interestRate: 36.0,
    minimumPayment: 625,
    monthlyPayment: 2000,
    startDate: '2024-01-15',
    currency: 'AED',
    lender: 'ADCB',
  },
  {
    id: '3',
    name: 'Honda City Loan',
    type: 'car_loan',
    principal: 65000,
    currentBalance: 28000,
    interestRate: 4.25,
    minimumPayment: 1200,
    monthlyPayment: 1400,
    startDate: '2023-03-01',
    endDate: '2027-03-01',
    currency: 'AED',
    lender: 'FAB',
  },
];

export function getDebtTypeInfo(type: string) {
  return DEBT_TYPES.find(t => t.name === type) || DEBT_TYPES[DEBT_TYPES.length - 1];
}

// Calculate payoff projection with amortization
export function calculatePayoffProjection(debt: Debt, extraPayment: number = 0): PayoffProjection[] {
  const projections: PayoffProjection[] = [];
  let balance = debt.currentBalance;
  const monthlyRate = debt.interestRate / 100 / 12;
  const payment = debt.monthlyPayment + extraPayment;
  let month = 0;
  const startDate = new Date();
  
  while (balance > 0 && month < 360) { // Max 30 years
    month++;
    const interest = balance * monthlyRate;
    const principalPayment = Math.min(payment - interest, balance);
    balance = Math.max(balance - principalPayment, 0);
    
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month);
    
    projections.push({
      month,
      date: date.toISOString().split('T')[0],
      payment: principalPayment + interest,
      principal: principalPayment,
      interest,
      balance,
    });
    
    if (balance <= 0) break;
  }
  
  return projections;
}

// Calculate total interest paid
export function calculateTotalInterest(projections: PayoffProjection[]): number {
  return projections.reduce((sum, p) => sum + p.interest, 0);
}

// Calculate payoff date
export function getPayoffDate(projections: PayoffProjection[]): string | null {
  if (projections.length === 0) return null;
  return projections[projections.length - 1].date;
}

// Calculate months to payoff
export function getMonthsToPayoff(projections: PayoffProjection[]): number {
  return projections.length;
}

// Debt snowball strategy (smallest balance first)
export function getSnowballOrder(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => a.currentBalance - b.currentBalance);
}

// Debt avalanche strategy (highest interest first)
export function getAvalancheOrder(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

// Calculate debt-free date with strategy
export function calculateDebtFreeDate(debts: Debt[], strategy: 'snowball' | 'avalanche', extraPayment: number = 0): string | null {
  if (debts.length === 0) return null;
  
  const orderedDebts = strategy === 'snowball' ? getSnowballOrder(debts) : getAvalancheOrder(debts);
  let maxPayoffDate = new Date();
  
  let availableExtra = extraPayment;
  
  orderedDebts.forEach((debt, index) => {
    const projection = calculatePayoffProjection({
      ...debt,
      monthlyPayment: debt.monthlyPayment + (index === 0 ? availableExtra : 0),
    });
    
    const payoffDate = getPayoffDate(projection);
    if (payoffDate) {
      const date = new Date(payoffDate);
      if (date > maxPayoffDate) {
        maxPayoffDate = date;
      }
    }
  });
  
  return maxPayoffDate.toISOString().split('T')[0];
}
