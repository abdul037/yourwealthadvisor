import { useState } from 'react';
import { useDebts, Debt as DBDebt } from '@/hooks/useDebts';
import { DebtOverview } from '@/components/DebtOverview';
import { DebtList } from '@/components/DebtList';
import { PayoffCalculator } from '@/components/PayoffCalculator';
import { DebtStrategy } from '@/components/DebtStrategy';
import { PageHeader } from '@/components/PageHeader';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Debt } from '@/lib/debtData';
import { TrendingDown } from 'lucide-react';

// Adapter to convert DB debt to component format
const adaptDebt = (dbDebt: DBDebt): Debt => ({
  id: dbDebt.id,
  name: dbDebt.name,
  type: (dbDebt.type || 'other') as Debt['type'],
  principal: dbDebt.principal,
  currentBalance: dbDebt.current_balance,
  interestRate: dbDebt.interest_rate || 0,
  minimumPayment: dbDebt.minimum_payment || 0,
  monthlyPayment: dbDebt.minimum_payment || 0, // Using minimum as monthly for now
  startDate: dbDebt.start_date || new Date().toISOString().split('T')[0],
  endDate: dbDebt.end_date || undefined,
  currency: (dbDebt.currency || 'AED') as Debt['currency'],
  lender: dbDebt.lender || 'Unknown',
});

const DebtTracker = () => {
  const { debts: dbDebts, isLoading, addDebt, deleteDebt } = useDebts();
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  
  // Convert DB data to component format
  const debts: Debt[] = dbDebts.map(adaptDebt);
  
  const handleAddDebt = async (debt: Omit<Debt, 'id'>) => {
    await addDebt.mutateAsync({
      name: debt.name,
      type: debt.type,
      principal: debt.principal,
      current_balance: debt.currentBalance,
      interest_rate: debt.interestRate,
      minimum_payment: debt.minimumPayment,
      lender: debt.lender,
      currency: debt.currency,
      start_date: debt.startDate,
      end_date: debt.endDate || null,
    });
  };
  
  const handleDeleteDebt = async (id: string) => {
    await deleteDebt.mutateAsync(id);
    if (selectedDebt?.id === id) {
      setSelectedDebt(null);
    }
  };
  
  const handleSelectDebt = (debt: Debt) => {
    setSelectedDebt(debt);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <PageHeader 
            title="Debt Tracker"
            description="Manage your liabilities and plan your path to becoming debt-free"
            breadcrumb={[{ label: 'Debt', path: '/debt' }]}
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
          title="Debt Tracker"
          description="Manage your liabilities and plan your path to becoming debt-free"
          breadcrumb={[{ label: 'Debt', path: '/debt' }]}
        />
        
        {debts.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="No debts tracked"
            description="Add your debts to track payoff progress and optimize your repayment strategy."
            actionLabel="Add Debt"
            onAction={() => {/* Trigger add debt dialog */}}
          />
        ) : (
          <>
            {/* Debt Overview */}
            <div className="mb-6 sm:mb-8">
              <DebtOverview debts={debts} />
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <DebtList 
                debts={debts}
                onAddDebt={handleAddDebt}
                onDeleteDebt={handleDeleteDebt}
                onSelectDebt={handleSelectDebt}
              />
              <PayoffCalculator 
                debt={selectedDebt}
                onClose={() => setSelectedDebt(null)}
              />
            </div>
            
            {/* Strategy */}
            {debts.length > 1 && (
              <div className="mb-6 sm:mb-8">
                <DebtStrategy debts={debts} />
              </div>
            )}
          </>
        )}
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Debt Tracker
          </p>
        </footer>
      </main>
    </div>
  );
};

export default DebtTracker;
