import { useState, useCallback } from 'react';
import { BudgetAllocation } from '@/components/BudgetAllocation';
import { BudgetTracker } from '@/components/BudgetTracker';
import { NotificationCenter } from '@/components/NotificationCenter';
import { BudgetVsActualChart } from '@/components/BudgetVsActualChart';
import { VacationPlanner } from '@/components/VacationPlanner';
import { RecurringTransactionsDashboard } from '@/components/RecurringTransactionsDashboard';
import { BillsCalendar } from '@/components/BillsCalendar';
import { useBudgetAlerts, BudgetAlert } from '@/hooks/useBudgetAlerts';
import { Budget, Expense, sampleExpenses, sampleBudgets } from '@/lib/expenseData';
import { sampleIncomeSources, getMonthlyIncomeData } from '@/lib/incomeData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);
  const [expenses] = useState<Expense[]>(sampleExpenses);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  
  // Calculate monthly income
  const monthlyIncomeData = getMonthlyIncomeData(sampleIncomeSources);
  const currentMonthIncome = monthlyIncomeData[monthlyIncomeData.length - 1]?.total || 55000;
  
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
  
  const handleUpdateBudgets = (updatedBudgets: Budget[]) => {
    setBudgets(updatedBudgets);
  };
  
  const handleAddBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
    };
    setBudgets(prev => [...prev, newBudget]);
  };
  
  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };
  
  const handleDismissAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Monthly Budget Planner</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Allocate your income, track spending, manage recurring bills, and get alerts
          </p>
        </div>
        
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
