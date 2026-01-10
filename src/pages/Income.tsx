import { useIncomes, IncomeSource as DBIncomeSource } from '@/hooks/useIncomes';
import { useExpenses, Transaction } from '@/hooks/useTransactions';
import { usePartners, Partner } from '@/hooks/usePartners';
import { IncomeOverview } from '@/components/IncomeOverview';
import { IncomeChart } from '@/components/IncomeChart';
import { IncomeBreakdown } from '@/components/IncomeBreakdown';
import { IncomeList } from '@/components/IncomeList';
import { SavingsRate } from '@/components/SavingsRate';
import { PageHeader } from '@/components/PageHeader';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { IncomeSource } from '@/lib/incomeData';
import { Expense } from '@/lib/expenseData';
import { DollarSign } from 'lucide-react';

// Helper to determine partner label based on partner order
const getPartnerLabel = (partnerId: string, partners: Partner[]): IncomeSource['partner'] => {
  const sortedPartners = [...partners].sort((a, b) => 
    new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
  );
  const partnerIndex = sortedPartners.findIndex(p => p.id === partnerId);
  if (partnerIndex === 0) return 'Partner 1';
  if (partnerIndex === 1) return 'Partner 2';
  return 'Joint';
};

// Adapter to convert DB income to component format
const adaptIncome = (dbIncome: DBIncomeSource, partners: Partner[]): IncomeSource => {
  // Normalize type - case insensitive matching
  const rawType = (dbIncome.source_type || 'other').toLowerCase();
  const normalizedType = ['salary', 'bonus', 'freelance', 'investment', 'rental', 'other'].includes(rawType)
    ? rawType as IncomeSource['type']
    : 'other';
  
  return {
    id: dbIncome.id,
    partner: getPartnerLabel(dbIncome.partner_id, partners),
    type: normalizedType,
    description: dbIncome.source_name,
    amount: dbIncome.amount,
    currency: (dbIncome.currency || 'AED') as IncomeSource['currency'],
    frequency: (dbIncome.frequency || 'monthly') as IncomeSource['frequency'],
    date: dbIncome.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
};

// Adapter to convert DB transaction to expense format
const adaptExpense = (transaction: Transaction): Expense => ({
  id: transaction.id,
  category: transaction.category,
  description: transaction.description || '',
  amount: transaction.amount,
  currency: (transaction.currency || 'AED') as Expense['currency'],
  date: transaction.transaction_date,
});

const Income = () => {
  const { incomes, isLoading: incomesLoading, addIncome, deleteIncome } = useIncomes();
  const { transactions: expenseTransactions, isLoading: expensesLoading } = useExpenses();
  const { partners, isLoading: partnersLoading } = usePartners();
  
  const isLoading = incomesLoading || expensesLoading || partnersLoading;
  
  // Convert DB data to component format with partner context
  const incomeSources: IncomeSource[] = incomes.map(i => adaptIncome(i, partners));
  const expenses: Expense[] = expenseTransactions.map(adaptExpense);
  
  // Get partner names for display
  const sortedPartners = [...partners].sort((a, b) => 
    new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
  );
  const partnerNames = {
    partner1Name: sortedPartners[0]?.name || 'Partner 1',
    partner2Name: sortedPartners[1]?.name || 'Partner 2',
  };
  
  const handleAddIncome = async (income: Omit<IncomeSource, 'id'>) => {
    // Find the correct partner_id based on the partner label
    let partnerId = sortedPartners[0]?.id;
    if (income.partner === 'Partner 2' && sortedPartners[1]) {
      partnerId = sortedPartners[1].id;
    }
    
    if (!partnerId) {
      console.error('No partners found');
      return;
    }
    
    await addIncome.mutateAsync({
      source_name: income.description,
      source_type: income.type,
      amount: income.amount,
      currency: income.currency,
      frequency: income.frequency,
      partner_id: partnerId,
    });
  };
  
  const handleDeleteIncome = async (id: string) => {
    await deleteIncome.mutateAsync(id);
  };
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <PageHeader 
            title="Income Tracking"
            description="Monitor your income sources and track earnings over time"
            breadcrumb={[{ label: 'Income', path: '/income' }]}
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
          title="Income Tracking"
          description="Monitor your income sources and track earnings over time"
          breadcrumb={[{ label: 'Income', path: '/income' }]}
        />
        
        {incomeSources.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No income sources yet"
            description="Add your first income source to start tracking your earnings."
            actionLabel="Add Income"
            onAction={() => {/* Trigger add income dialog */}}
          />
        ) : (
          <>
            {/* Income Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="lg:col-span-2">
                <IncomeOverview 
                  incomeSources={incomeSources} 
                  partnerNames={partnerNames}
                />
              </div>
              <div>
                <SavingsRate incomeSources={incomeSources} expenses={expenses} />
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <IncomeChart incomeSources={incomeSources} />
              <IncomeBreakdown incomeSources={incomeSources} month={currentMonth} year={currentYear} />
            </div>
          </>
        )}
        
        {/* Income List */}
        <IncomeList 
          incomeSources={incomeSources}
          onAddIncome={handleAddIncome}
          onDeleteIncome={handleDeleteIncome}
        />
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Family Income Tracking
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Income;
