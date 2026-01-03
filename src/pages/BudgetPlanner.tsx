import { useState, useCallback } from 'react';
import { BudgetAllocation } from '@/components/BudgetAllocation';
import { BudgetTracker } from '@/components/BudgetTracker';
import { NotificationCenter } from '@/components/NotificationCenter';
import { BudgetVsActualChart } from '@/components/BudgetVsActualChart';
import { VacationPlanner } from '@/components/VacationPlanner';
import { useBudgetAlerts, BudgetAlert } from '@/hooks/useBudgetAlerts';
import { Budget, Expense, sampleExpenses, sampleBudgets } from '@/lib/expenseData';
import { sampleIncomeSources, getMonthlyIncomeData } from '@/lib/incomeData';
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
            Allocate your income, track spending, and get alerts when approaching budget limits
          </p>
        </div>
        
        {/* Budget Allocation & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <BudgetTracker budgets={budgets} expenses={expenses} />
          <BudgetVsActualChart budgets={budgets} expenses={expenses} />
        </div>
        
        {/* Vacation Planner */}
        <div className="mb-6 sm:mb-8">
          <VacationPlanner />
        </div>
        
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
