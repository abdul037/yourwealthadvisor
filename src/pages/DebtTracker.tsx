import { useState } from 'react';
import { DebtOverview } from '@/components/DebtOverview';
import { DebtList } from '@/components/DebtList';
import { PayoffCalculator } from '@/components/PayoffCalculator';
import { DebtStrategy } from '@/components/DebtStrategy';
import { PageHeader } from '@/components/PageHeader';
import { Debt, sampleDebts } from '@/lib/debtData';

const DebtTracker = () => {
  const [debts, setDebts] = useState<Debt[]>(sampleDebts);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  
  const handleAddDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt: Debt = {
      ...debt,
      id: crypto.randomUUID(),
    };
    setDebts(prev => [...prev, newDebt]);
  };
  
  const handleDeleteDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    if (selectedDebt?.id === id) {
      setSelectedDebt(null);
    }
  };
  
  const handleSelectDebt = (debt: Debt) => {
    setSelectedDebt(debt);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Page Header */}
        <PageHeader 
          title="Debt Tracker"
          description="Manage your liabilities and plan your path to becoming debt-free"
          breadcrumb={[{ label: 'Debt', path: '/debt' }]}
        />
        
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
