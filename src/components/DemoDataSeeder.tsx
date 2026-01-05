import { useState } from 'react';
import { Database, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, subMonths } from 'date-fns';

interface SeedProgress {
  step: string;
  progress: number;
  completed: boolean;
}

const DEMO_INCOME_SOURCES: Array<{
  source_name: string;
  source_type: string;
  amount: number;
  currency: string;
  frequency: string;
  liquidity_level: 'L1' | 'L2' | 'L3' | 'NL';
}> = [
  { source_name: 'Monthly Salary', source_type: 'salary', amount: 25000, currency: 'AED', frequency: 'monthly', liquidity_level: 'L1' },
  { source_name: 'Freelance Projects', source_type: 'freelance', amount: 5000, currency: 'AED', frequency: 'monthly', liquidity_level: 'L1' },
  { source_name: 'Rental Income', source_type: 'rental', amount: 8000, currency: 'AED', frequency: 'monthly', liquidity_level: 'L2' },
  { source_name: 'Investment Dividends', source_type: 'investment', amount: 2000, currency: 'AED', frequency: 'quarterly', liquidity_level: 'L2' },
];

const DEMO_EXPENSES = [
  { category: 'Food & Dining', description: 'Grocery shopping', amount: 1200 },
  { category: 'Food & Dining', description: 'Restaurant dinner', amount: 350 },
  { category: 'Transport', description: 'Fuel', amount: 400 },
  { category: 'Transport', description: 'Salik tolls', amount: 150 },
  { category: 'Utilities', description: 'DEWA bill', amount: 850 },
  { category: 'Utilities', description: 'Internet & TV', amount: 450 },
  { category: 'Entertainment', description: 'Netflix subscription', amount: 55 },
  { category: 'Entertainment', description: 'Cinema tickets', amount: 120 },
  { category: 'Shopping', description: 'Clothing', amount: 800 },
  { category: 'Healthcare', description: 'Pharmacy', amount: 200 },
  { category: 'Education', description: 'Online course', amount: 500 },
  { category: 'Subscriptions', description: 'Gym membership', amount: 350 },
];

const DEMO_BUDGETS = [
  { category: 'Food & Dining', allocated_amount: 3000, period: 'monthly' },
  { category: 'Transport', allocated_amount: 1500, period: 'monthly' },
  { category: 'Utilities', allocated_amount: 1500, period: 'monthly' },
  { category: 'Entertainment', allocated_amount: 1000, period: 'monthly' },
  { category: 'Shopping', allocated_amount: 2000, period: 'monthly' },
  { category: 'Healthcare', allocated_amount: 500, period: 'monthly' },
  { category: 'Subscriptions', allocated_amount: 500, period: 'monthly' },
];

const DEMO_ASSETS = [
  { name: 'Emergency Savings', category: 'Cash', amount: 50000, currency: 'AED', liquidity_level: 'L1' },
  { name: 'Checking Account', category: 'Cash', amount: 15000, currency: 'AED', liquidity_level: 'L1' },
  { name: 'UAE Stock Portfolio', category: 'Stocks', amount: 75000, currency: 'AED', liquidity_level: 'L2' },
  { name: 'US Tech ETFs', category: 'Stocks', amount: 25000, currency: 'USD', liquidity_level: 'L2' },
  { name: 'Gold Coins', category: 'Gold', amount: 30000, currency: 'AED', liquidity_level: 'L2' },
  { name: 'Retirement Fund', category: 'Retirement', amount: 100000, currency: 'AED', liquidity_level: 'L3' },
  { name: 'Fixed Deposit', category: 'Fixed Deposit', amount: 50000, currency: 'AED', liquidity_level: 'L3' },
];

const DEMO_DEBTS = [
  { name: 'Car Loan', type: 'Auto Loan', principal: 120000, current_balance: 85000, interest_rate: 3.5, minimum_payment: 2500, lender: 'Emirates NBD' },
  { name: 'Credit Card', type: 'Credit Card', principal: 15000, current_balance: 8500, interest_rate: 24, minimum_payment: 850, lender: 'ADCB' },
];

const DEMO_GOALS = [
  { name: 'Emergency Fund', target_amount: 100000, current_amount: 50000, category: 'Emergency Fund', priority: 'high', target_date: format(subMonths(new Date(), -12), 'yyyy-MM-dd') },
  { name: 'Dream Vacation', target_amount: 25000, current_amount: 8000, category: 'Vacation', priority: 'medium', target_date: format(subMonths(new Date(), -6), 'yyyy-MM-dd') },
  { name: 'New Car Down Payment', target_amount: 50000, current_amount: 15000, category: 'Car', priority: 'low', target_date: format(subMonths(new Date(), -18), 'yyyy-MM-dd') },
];

export function DemoDataSeeder() {
  const [open, setOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const updateProgress = (step: string, progress: number, completed: boolean = false) => {
    setSeedProgress(prev => {
      const existing = prev.find(p => p.step === step);
      if (existing) {
        return prev.map(p => p.step === step ? { step, progress, completed } : p);
      }
      return [...prev, { step, progress, completed }];
    });
  };

  const seedDemoData = async () => {
    setIsSeeding(true);
    setSeedProgress([]);
    setIsComplete(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create a partner for income sources
      updateProgress('Creating partner', 20);
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .insert({ name: 'Primary Earner', role: 'Primary', user_id: user.id })
        .select()
        .single();
      
      if (partnerError) throw partnerError;
      updateProgress('Creating partner', 100, true);

      // 2. Seed income sources
      updateProgress('Adding income sources', 20);
      const incomeData = DEMO_INCOME_SOURCES.map(income => ({
        ...income,
        user_id: user.id,
        partner_id: partnerData.id,
        is_active: true,
      }));
      
      const { error: incomeError } = await supabase.from('income_sources').insert(incomeData);
      if (incomeError) throw incomeError;
      updateProgress('Adding income sources', 100, true);

      // 3. Seed expenses (transactions)
      updateProgress('Adding expenses', 20);
      const expenseData = DEMO_EXPENSES.flatMap((expense, index) => {
        // Create multiple transactions across different dates
        const transactions = [];
        for (let month = 0; month < 3; month++) {
          transactions.push({
            ...expense,
            type: 'expense',
            currency: 'AED',
            user_id: user.id,
            transaction_date: format(subDays(subMonths(new Date(), month), index % 28), 'yyyy-MM-dd'),
          });
        }
        return transactions;
      });
      
      const { error: expenseError } = await supabase.from('transactions').insert(expenseData);
      if (expenseError) throw expenseError;
      updateProgress('Adding expenses', 100, true);

      // 4. Seed budgets
      updateProgress('Creating budgets', 20);
      const budgetData = DEMO_BUDGETS.map(budget => ({
        ...budget,
        currency: 'AED',
        user_id: user.id,
        is_active: true,
      }));
      
      const { error: budgetError } = await supabase.from('budgets').insert(budgetData);
      if (budgetError) throw budgetError;
      updateProgress('Creating budgets', 100, true);

      // 5. Seed assets
      updateProgress('Adding assets', 20);
      const assetData = DEMO_ASSETS.map(asset => ({
        ...asset,
        user_id: user.id,
        is_active: true,
      }));
      
      const { error: assetError } = await supabase.from('assets').insert(assetData);
      if (assetError) throw assetError;
      updateProgress('Adding assets', 100, true);

      // 6. Seed debts
      updateProgress('Adding debts', 20);
      const debtData = DEMO_DEBTS.map(debt => ({
        ...debt,
        currency: 'AED',
        user_id: user.id,
        is_active: true,
      }));
      
      const { error: debtError } = await supabase.from('debts').insert(debtData);
      if (debtError) throw debtError;
      updateProgress('Adding debts', 100, true);

      // 7. Seed savings goals (milestones)
      updateProgress('Creating savings goals', 20);
      const goalData = DEMO_GOALS.map(goal => ({
        ...goal,
        user_id: user.id,
        is_achieved: false,
      }));
      
      const { error: goalError } = await supabase.from('milestones').insert(goalData);
      if (goalError) throw goalError;
      updateProgress('Creating savings goals', 100, true);

      // 8. Update onboarding progress
      updateProgress('Finishing up', 50);
      await supabase
        .from('profiles')
        .update({
          onboarding_progress: {
            income_added: true,
            expense_added: true,
            budget_created: true,
            goal_created: true,
            bank_connected: false,
          }
        })
        .eq('id', user.id);
      updateProgress('Finishing up', 100, true);

      setIsComplete(true);
      toast({
        title: 'Demo data loaded!',
        description: 'Your account now has sample data to explore. Refresh to see all changes.',
      });

    } catch (error: any) {
      console.error('Error seeding demo data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed demo data',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleComplete = () => {
    setOpen(false);
    // Refresh the page to show new data
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-dashed">
          <Sparkles className="w-4 h-4" />
          Load Demo Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Load Demo Data
          </DialogTitle>
          <DialogDescription>
            Populate your account with sample income, expenses, budgets, assets, and savings goals to explore all features.
          </DialogDescription>
        </DialogHeader>

        {!isSeeding && !isComplete && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-500">This will add sample data</p>
                  <p className="text-muted-foreground mt-1">
                    Demo data includes income sources, 3 months of expenses, budgets, assets, debts, and savings goals.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-wealth-positive" />
                <span>4 Income Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-wealth-positive" />
                <span>36 Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-wealth-positive" />
                <span>7 Budget Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-wealth-positive" />
                <span>7 Assets</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-wealth-positive" />
                <span>2 Debts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-wealth-positive" />
                <span>3 Savings Goals</span>
              </div>
            </div>
          </div>
        )}

        {isSeeding && (
          <div className="space-y-3 py-4">
            {seedProgress.map((item) => (
              <div key={item.step} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {item.completed ? (
                      <Check className="w-4 h-4 text-wealth-positive" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {item.step}
                  </span>
                  <span className="text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1" />
              </div>
            ))}
          </div>
        )}

        {isComplete && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-wealth-positive/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-wealth-positive" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Demo Data Loaded!</h3>
            <p className="text-sm text-muted-foreground">
              Your account is now populated with sample data. Click below to refresh and explore.
            </p>
          </div>
        )}

        <DialogFooter>
          {!isSeeding && !isComplete && (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={seedDemoData} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Load Demo Data
              </Button>
            </>
          )}
          {isComplete && (
            <Button onClick={handleComplete} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Refresh & Explore
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}