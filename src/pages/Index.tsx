import { useState } from 'react';
import { NetWorthCard } from '@/components/NetWorthCard';
import { AllocationChart } from '@/components/AllocationChart';
import { LiquidityBreakdown } from '@/components/LiquidityBreakdown';
import { AssetList } from '@/components/AssetList';
import { TransactionForm } from '@/components/TransactionForm';
import { RecentTransactions } from '@/components/RecentTransactions';
import { QuickStats } from '@/components/QuickStats';
import { PortfolioAggregation } from '@/components/PortfolioAggregation';
import { IncomeLiquidityChart } from '@/components/IncomeLiquidityChart';
import { EmergencyFundCalculator } from '@/components/EmergencyFundCalculator';
import { CashFlowForecast } from '@/components/CashFlowForecast';
import { initialPortfolio, Transaction, Asset } from '@/lib/portfolioData';

const Index = () => {
  const [assets] = useState<Asset[]>(initialPortfolio);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Hero Section - Net Worth & Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0">
            <NetWorthCard assets={assets} />
          </div>
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="wealth-card flex-1">
              <p className="wealth-label mb-2">Quick Actions</p>
              <div className="space-y-2">
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>
            </div>
            <div className="wealth-card">
              <p className="wealth-label mb-1">Combined Income</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-wealth-positive">AED 55,000/mo</p>
              <p className="text-xs text-muted-foreground mt-1">2 earning partners</p>
            </div>
          </div>
        </div>
        
        {/* Portfolio Aggregation - Connected Platforms */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Investment Portfolio Overview</h2>
          <PortfolioAggregation />
        </div>
        
        {/* Income Liquidity & Emergency Fund */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <IncomeLiquidityChart />
          <EmergencyFundCalculator />
        </div>
        
        {/* Cash Flow Forecast */}
        <div className="mb-6 sm:mb-8">
          <CashFlowForecast />
        </div>
        
        {/* Quick Stats */}
        <QuickStats assets={assets} />
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {/* Allocation Chart */}
          <AllocationChart assets={assets} />
          
          {/* Liquidity Breakdown */}
          <LiquidityBreakdown assets={assets} />
          
          {/* Recent Transactions */}
          <RecentTransactions transactions={transactions} />
        </div>
        
        {/* Asset List */}
        <div className="mt-6 sm:mt-8">
          <AssetList assets={assets} />
        </div>
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            WealthTrack • Family of 4 in Dubai (Kids: 5 & 7 yrs)
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
