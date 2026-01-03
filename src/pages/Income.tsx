import { useState } from 'react';
import { WealthHeader } from '@/components/WealthHeader';
import { IncomeOverview } from '@/components/IncomeOverview';
import { IncomeChart } from '@/components/IncomeChart';
import { IncomeBreakdown } from '@/components/IncomeBreakdown';
import { IncomeList } from '@/components/IncomeList';
import { SavingsRate } from '@/components/SavingsRate';
import { IncomeSource, sampleIncomeSources } from '@/lib/incomeData';
import { sampleExpenses } from '@/lib/expenseData';

const Income = () => {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(sampleIncomeSources);
  
  const handleAddIncome = (income: Omit<IncomeSource, 'id'>) => {
    const newIncome: IncomeSource = {
      ...income,
      id: crypto.randomUUID(),
    };
    setIncomeSources(prev => [newIncome, ...prev]);
  };
  
  const handleDeleteIncome = (id: string) => {
    setIncomeSources(prev => prev.filter(i => i.id !== id));
  };
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      <WealthHeader />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Income Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <IncomeOverview incomeSources={incomeSources} />
          </div>
          <div>
            <SavingsRate incomeSources={incomeSources} expenses={sampleExpenses} />
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <IncomeChart incomeSources={incomeSources} />
          <IncomeBreakdown incomeSources={incomeSources} month={currentMonth} year={currentYear} />
        </div>
        
        {/* Income List */}
        <IncomeList 
          incomeSources={incomeSources}
          onAddIncome={handleAddIncome}
          onDeleteIncome={handleDeleteIncome}
        />
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            WealthTrack • Family Income Tracking
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Income;
