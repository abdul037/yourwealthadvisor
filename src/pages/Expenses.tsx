import { useExpenses, Transaction } from '@/hooks/useTransactions';
import { useBudgets, Budget as DBBudget } from '@/hooks/useBudgets';
import { MonthlyOverview } from '@/components/MonthlyOverview';
import { BudgetCard } from '@/components/BudgetCard';
import { SpendingChart } from '@/components/SpendingChart';
import { CategoryBreakdown } from '@/components/CategoryBreakdown';
import { ExpenseList } from '@/components/ExpenseList';
import { PageHeader } from '@/components/PageHeader';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Expense, Budget } from '@/lib/expenseData';
import { Receipt } from 'lucide-react';

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

const Expenses = () => {
  const { transactions, isLoading: expensesLoading, addTransaction, deleteTransaction } = useExpenses();
  const { budgets: dbBudgets, isLoading: budgetsLoading, addBudget, deleteBudget } = useBudgets();
  
  const isLoading = expensesLoading || budgetsLoading;
  
  // Convert DB data to component format
  const expenses: Expense[] = transactions.map(adaptExpense);
  const budgets: Budget[] = dbBudgets.map(adaptBudget);
  
  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    await addTransaction.mutateAsync({
      type: 'expense',
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      transaction_date: expense.date,
    });
  };
  
  const handleDeleteExpense = async (id: string) => {
    await deleteTransaction.mutateAsync(id);
  };
  
  const handleAddBudget = async (budget: Omit<Budget, 'id'>) => {
    await addBudget.mutateAsync({
      category: budget.category,
      allocated_amount: budget.limit,
      currency: budget.currency,
      period: budget.period,
    });
  };
  
  const handleDeleteBudget = async (id: string) => {
    await deleteBudget.mutateAsync(id);
  };
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <PageHeader 
            title="Expense Management"
            description="Track spending and manage your budget categories"
            breadcrumb={[{ label: 'Expenses', path: '/expenses' }]}
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
          title="Expense Management"
          description="Track spending and manage your budget categories"
          breadcrumb={[{ label: 'Expenses', path: '/expenses' }]}
        />
        
        {expenses.length === 0 && budgets.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses recorded"
            description="Start tracking your spending by adding your first expense."
            actionLabel="Add Expense"
            onAction={() => {/* Trigger add expense dialog */}}
          />
        ) : (
          <>
            {/* Monthly Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <SpendingChart expenses={expenses} />
              <CategoryBreakdown expenses={expenses} month={currentMonth} year={currentYear} />
            </div>
          </>
        )}
        
        {/* Expense List */}
        <ExpenseList 
          expenses={expenses}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Family Expense Tracking
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Expenses;
