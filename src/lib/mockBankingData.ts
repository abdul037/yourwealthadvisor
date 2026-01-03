// Mock Banking Demo Data
// Simulates Lean Technologies Open Banking API responses

export interface BankAccount {
  id: string;
  bankName: string;
  bankLogo: string;
  accountNumber: string;
  accountType: 'current' | 'savings' | 'credit_card';
  balance: number;
  currency: string;
  lastSynced: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  category: string;
  merchantName?: string;
  reference?: string;
}

export interface Bank {
  id: string;
  name: string;
  logo: string;
  country: string;
  supported: boolean;
}

// UAE Banks for demo
export const DEMO_BANKS: Bank[] = [
  { id: 'enbd', name: 'Emirates NBD', logo: '🏦', country: 'UAE', supported: true },
  { id: 'adcb', name: 'ADCB', logo: '🏛️', country: 'UAE', supported: true },
  { id: 'fab', name: 'First Abu Dhabi Bank', logo: '🏦', country: 'UAE', supported: true },
  { id: 'dib', name: 'Dubai Islamic Bank', logo: '🕌', country: 'UAE', supported: true },
  { id: 'mashreq', name: 'Mashreq Bank', logo: '🏦', country: 'UAE', supported: true },
  { id: 'rakbank', name: 'RAKBANK', logo: '🏛️', country: 'UAE', supported: true },
];

// Demo connected accounts
export const DEMO_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    bankName: 'Emirates NBD',
    bankLogo: '🏦',
    accountNumber: '****4521',
    accountType: 'current',
    balance: 45680.50,
    currency: 'AED',
    lastSynced: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    bankName: 'Emirates NBD',
    bankLogo: '🏦',
    accountNumber: '****8832',
    accountType: 'savings',
    balance: 125000.00,
    currency: 'AED',
    lastSynced: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    bankName: 'ADCB',
    bankLogo: '🏛️',
    accountNumber: '****2156',
    accountType: 'credit_card',
    balance: -8450.25,
    currency: 'AED',
    lastSynced: new Date().toISOString(),
  },
];

// Generate mock transactions for last 30 days
const generateMockTransactions = (): BankTransaction[] => {
  const transactions: BankTransaction[] = [];
  const today = new Date();
  
  const mockData = [
    // Income
    { days: 1, desc: 'Salary Credit - Tech Lead Position', amount: 32000, type: 'credit', category: 'Salary', merchant: 'COMPANY PAYROLL' },
    { days: 1, desc: 'Salary Credit - Marketing Manager', amount: 23000, type: 'credit', category: 'Salary', merchant: 'COMPANY PAYROLL' },
    
    // Rent & Housing
    { days: 2, desc: 'Rent Payment - Dubai Marina', amount: 8500, type: 'debit', category: 'Housing', merchant: 'LANDLORD TRANSFER' },
    
    // Groceries
    { days: 3, desc: 'Carrefour MOE', amount: 850, type: 'debit', category: 'Food & Dining', merchant: 'CARREFOUR HYPERMARKET' },
    { days: 7, desc: 'Spinneys The Greens', amount: 420, type: 'debit', category: 'Food & Dining', merchant: 'SPINNEYS LLC' },
    { days: 14, desc: 'LuLu Hypermarket', amount: 680, type: 'debit', category: 'Food & Dining', merchant: 'LULU HYPERMARKET' },
    
    // Dining Out
    { days: 5, desc: 'PF Changs JBR', amount: 380, type: 'debit', category: 'Food & Dining', merchant: 'PF CHANGS' },
    { days: 9, desc: 'Cheesecake Factory', amount: 520, type: 'debit', category: 'Food & Dining', merchant: 'THE CHEESECAKE FACTORY' },
    
    // Utilities
    { days: 4, desc: 'DEWA Bill Payment', amount: 850, type: 'debit', category: 'Utilities', merchant: 'DEWA' },
    { days: 5, desc: 'Du Monthly Bill', amount: 499, type: 'debit', category: 'Utilities', merchant: 'DU TELECOM' },
    { days: 6, desc: 'Etisalat Mobile', amount: 350, type: 'debit', category: 'Utilities', merchant: 'ETISALAT' },
    
    // Transport
    { days: 2, desc: 'ADNOC Petrol', amount: 250, type: 'debit', category: 'Transport', merchant: 'ADNOC STATION' },
    { days: 8, desc: 'ENOC Petrol', amount: 180, type: 'debit', category: 'Transport', merchant: 'ENOC STATION' },
    { days: 10, desc: 'Salik Toll', amount: 120, type: 'debit', category: 'Transport', merchant: 'SALIK' },
    { days: 15, desc: 'RTA Parking', amount: 85, type: 'debit', category: 'Transport', merchant: 'RTA PARKING' },
    
    // Education
    { days: 2, desc: 'School Fees - GEMS', amount: 4500, type: 'debit', category: 'Education', merchant: 'GEMS EDUCATION' },
    { days: 2, desc: 'School Fees - Kindergarten', amount: 3800, type: 'debit', category: 'Education', merchant: 'NURSERY WORLD' },
    
    // Entertainment
    { days: 6, desc: 'VOX Cinemas Dubai Mall', amount: 120, type: 'debit', category: 'Entertainment', merchant: 'VOX CINEMAS' },
    { days: 13, desc: 'Wild Wadi Waterpark', amount: 580, type: 'debit', category: 'Entertainment', merchant: 'WILD WADI' },
    { days: 1, desc: 'Netflix Subscription', amount: 60, type: 'debit', category: 'Subscriptions', merchant: 'NETFLIX.COM' },
    { days: 1, desc: 'Spotify Premium', amount: 35, type: 'debit', category: 'Subscriptions', merchant: 'SPOTIFY' },
    
    // Shopping
    { days: 11, desc: 'IKEA Dubai Festival City', amount: 420, type: 'debit', category: 'Shopping', merchant: 'IKEA UAE' },
    { days: 16, desc: 'Namshi Online', amount: 350, type: 'debit', category: 'Shopping', merchant: 'NAMSHI.COM' },
    { days: 20, desc: 'Amazon.ae', amount: 280, type: 'debit', category: 'Shopping', merchant: 'AMAZON AE' },
    
    // Healthcare
    { days: 8, desc: 'Mediclinic Consultation', amount: 350, type: 'debit', category: 'Healthcare', merchant: 'MEDICLINIC' },
    { days: 10, desc: 'Pharmacy - Life Pharmacy', amount: 180, type: 'debit', category: 'Healthcare', merchant: 'LIFE PHARMACY' },
    
    // Childcare
    { days: 3, desc: 'After School Activities', amount: 1200, type: 'debit', category: 'Childcare', merchant: 'KIDS CLUB' },
    { days: 15, desc: 'Swimming Lessons', amount: 800, type: 'debit', category: 'Childcare', merchant: 'SWIM TIME' },
    
    // Other income
    { days: 12, desc: 'Dividend Credit - ENBD Securities', amount: 850, type: 'credit', category: 'Investment', merchant: 'ENBD SECURITIES' },
    { days: 18, desc: 'Freelance Payment', amount: 3500, type: 'credit', category: 'Freelance', merchant: 'CLIENT TRANSFER' },
  ];
  
  mockData.forEach((item, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - item.days);
    
    transactions.push({
      id: `txn-${index + 1}`,
      accountId: item.type === 'credit' ? 'acc-1' : (index % 3 === 0 ? 'acc-3' : 'acc-1'),
      date: date.toISOString(),
      description: item.desc,
      amount: item.amount,
      currency: 'AED',
      type: item.type as 'credit' | 'debit',
      category: item.category,
      merchantName: item.merchant,
      reference: `REF${Date.now()}${index}`,
    });
  });
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const DEMO_TRANSACTIONS = generateMockTransactions();

// Simulate API delay
export const simulateApiCall = <T>(data: T, delayMs: number = 1500): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
};

// Category mapping for auto-categorization
export const CATEGORY_MAPPING: Record<string, string> = {
  'CARREFOUR': 'Food & Dining',
  'SPINNEYS': 'Food & Dining',
  'LULU': 'Food & Dining',
  'RESTAURANT': 'Food & Dining',
  'CAFE': 'Food & Dining',
  'DEWA': 'Utilities',
  'DU TELECOM': 'Utilities',
  'ETISALAT': 'Utilities',
  'ADNOC': 'Transport',
  'ENOC': 'Transport',
  'SALIK': 'Transport',
  'RTA': 'Transport',
  'UBER': 'Transport',
  'CAREEM': 'Transport',
  'GEMS': 'Education',
  'SCHOOL': 'Education',
  'NURSERY': 'Education',
  'NETFLIX': 'Subscriptions',
  'SPOTIFY': 'Subscriptions',
  'AMAZON': 'Shopping',
  'NAMSHI': 'Shopping',
  'NOON': 'Shopping',
  'IKEA': 'Shopping',
  'MEDICLINIC': 'Healthcare',
  'PHARMACY': 'Healthcare',
  'HOSPITAL': 'Healthcare',
  'PAYROLL': 'Salary',
  'SALARY': 'Salary',
};
