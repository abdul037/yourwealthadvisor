import { useState } from 'react';
import { WealthHeader } from '@/components/WealthHeader';
import { MonthlyOverview } from '@/components/MonthlyOverview';
import { BudgetCard } from '@/components/BudgetCard';
import { SpendingChart } from '@/components/SpendingChart';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { ExpenseList } from '@/components/ExpenseList';
import { Expense, Budget, sampleExpenses, sampleBudgets } from '@/lib/expenseData';

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);
  
  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };
  
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };
  
  const handleAddBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
    };
    setBudgets(prev => [...prev, newBudget]);
  };
  
  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <WealthHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Monthly Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <MonthlyOverview expenses={expenses} budgets={budgets} />
          </div>
          <div>
            <BudgetCard 
              budgets={budgets} 
              expenses={expenses}
              onAddBudget={handleAddBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SpendingChart expenses={expenses} />
          <CategoryBreakdown expenses={expenses} month={currentMonth} year={currentYear} />
        </div>
        
        {/* Expense List */}
        <ExpenseList 
          expenses={expenses}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />
        
        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            WealthTrack • Expense Tracking
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Expenses;
