import { useState, useCallback } from 'react';
import { useExpenses, Transaction } from '@/hooks/useTransactions';
import { useBudgets, Budget as DBBudget } from '@/hooks/useBudgets';
import { useIncomes } from '@/hooks/useIncomes';
import { BudgetAllocation } from '@/components/BudgetAllocation';
import { BudgetTracker } from '@/components/BudgetTracker';
import { NotificationCenter } from '@/components/NotificationCenter';
import { BudgetVsActualChart } from '@/components/BudgetVsActualChart';
import { VacationPlanner } from '@/components/VacationPlanner';
import { RecurringTransactionsDashboard } from '@/components/RecurringTransactionsDashboard';
import { BillsCalendar } from '@/components/BillsCalendar';
import { PageHeader } from '@/components/PageHeader';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { useBudgetAlerts, BudgetAlert } from '@/hooks/useBudgetAlerts';
import { Budget, Expense } from '@/lib/expenseData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Adapter to convert DB transaction to expense format
const adaptExpense = (transaction: Transaction): Expense => ({
  id: transaction.id,
  category: transaction.category,
  description: transaction.description || '',
  amount: transaction.amount,
  currency: (transaction.currency || 'AED') as Expense['currency'],
  date: transaction.transaction_date,
});

// Adapter to convert DB budget to component format
const adaptBudget = (dbBudget: DBBudget): Budget => ({
  id: dbBudget.id,
  category: dbBudget.category,
  limit: dbBudget.allocated_amount,
  currency: (dbBudget.currency || 'AED') as Budget['currency'],
  period: (dbBudget.period || 'monthly') as Budget['period'],
});

const BudgetPlanner = () => {
  const { transactions, isLoading: expensesLoading } = useExpenses();
  const { budgets: dbBudgets, isLoading: budgetsLoading, addBudget, updateBudget } = useBudgets();
  const { totalMonthlyIncome, isLoading: incomesLoading } = useIncomes();
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  
  const isLoading = expensesLoading || budgetsLoading || incomesLoading;
  
  // Convert DB data to component format
  const expenses: Expense[] = transactions.map(adaptExpense);
  const budgets: Budget[] = dbBudgets.map(adaptBudget);
  
  // Use calculated monthly income (no fallback to mock data)
  const currentMonthIncome = totalMonthlyIncome || 0;
  
  // Handle new alerts
  const handleAlertTriggered = useCallback((alert: BudgetAlert) => {
    setAlerts(prev => {
      // Don't add duplicates
      if (prev.find(a => a.id === alert.id)) return prev;
      return [...prev, alert];
    });
  }, []);
  
  // Use budget alerts hook
  useBudgetAlerts({
    budgets,
    expenses,
    onAlertTriggered: handleAlertTriggered,
  });
  
  const handleUpdateBudgets = async (updatedBudgets: Budget[]) => {
    // Update each modified budget
    for (const budget of updatedBudgets) {
      const original = budgets.find(b => b.id === budget.id);
      if (original && original.limit !== budget.limit) {
        await updateBudget.mutateAsync({
          id: budget.id,
          allocated_amount: budget.limit,
        });
      }
    }
  };
  
  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    await addBudget.mutateAsync({
      category: budget.category,
      allocated_amount: budget.limit,
      currency: budget.currency,
      period: budget.period,
    });
  };
  
  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };
  
  const handleDismissAllAlerts = () => {
    setAlerts([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <PageHeader 
            title="Budget Planner"
            description="Allocate your income, track spending, manage recurring bills, and get alerts"
            breadcrumb={[{ label: 'Budget', path: '/budget' }]}
          />
          <DashboardSkeleton variant="full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Page Header */}
        <PageHeader 
          title="Budget Planner"
          description="Allocate your income, track spending, manage recurring bills, and get alerts"
          breadcrumb={[{ label: 'Budget', path: '/budget' }]}
        />
        
        <Tabs defaultValue="budget" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="vacation">Vacation</TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="space-y-6">
            {/* Budget Allocation & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <BudgetAllocation 
                  monthlyIncome={currentMonthIncome}
                  budgets={budgets}
                  onUpdateBudgets={handleUpdateBudgets}
                  onAddBudget={handleAddBudget}
                />
              </div>
              <div>
                <NotificationCenter 
                  alerts={alerts}
                  onDismiss={handleDismissAlert}
                  onDismissAll={handleDismissAllAlerts}
                />
              </div>
            </div>
            
            {/* Budget Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <BudgetTracker budgets={budgets} expenses={expenses} />
              <BudgetVsActualChart budgets={budgets} expenses={expenses} />
            </div>
          </TabsContent>

          <TabsContent value="recurring">
            <RecurringTransactionsDashboard />
          </TabsContent>

          <TabsContent value="calendar">
            <BillsCalendar />
          </TabsContent>

          <TabsContent value="vacation">
            <VacationPlanner />
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Monthly Budget Planner
          </p>
        </footer>
      </main>
    </div>
  );
};

export default BudgetPlanner;
