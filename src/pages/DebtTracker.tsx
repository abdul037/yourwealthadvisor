import { useState } from 'react';
import { WealthHeader } from '@/components/WealthHeader';
import { DebtOverview } from '@/components/DebtOverview';
import { DebtList } from '@/components/DebtList';
import { PayoffCalculator } from '@/components/PayoffCalculator';
import { DebtStrategy } from '@/components/DebtStrategy';
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
      <WealthHeader />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Debt Tracker</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your liabilities and plan your path to becoming debt-free
          </p>
        </div>
        
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
            WealthTrack • Debt Tracker
          </p>
        </footer>
      </main>
    </div>
  );
};

export default DebtTracker;
