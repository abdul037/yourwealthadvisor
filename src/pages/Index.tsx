import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Receipt, Wallet, TrendingDown, LineChart, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useFormattedCurrency } from '@/components/FormattedCurrency';

const quickNavItems = [
  { path: '/income', label: 'Income', icon: DollarSign, color: 'bg-wealth-positive/20 text-wealth-positive' },
  { path: '/expenses', label: 'Expenses', icon: Receipt, color: 'bg-wealth-negative/20 text-wealth-negative' },
  { path: '/budget', label: 'Budget', icon: Wallet, color: 'bg-chart-2/20 text-chart-2' },
  { path: '/debt', label: 'Debt', icon: TrendingDown, color: 'bg-accent/20 text-accent' },
];

const Index = () => {
  const [assets] = useState<Asset[]>(initialPortfolio);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { formatAmount } = useFormattedCurrency();
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Calculate combined monthly income (AED value)
  const combinedIncome = 55000; // This would come from actual income sources

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Hero Section - Net Worth & Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0" data-tour="net-worth">
            <NetWorthCard assets={assets} />
          </div>
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="wealth-card flex-1">
              <p className="wealth-label mb-3">Quick Actions</p>
              <div className="space-y-2" data-tour="add-transaction">
                <TransactionForm onAddTransaction={handleAddTransaction} />
              </div>
              
              {/* Quick Nav Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4" data-tour="quick-nav">
                {quickNavItems.map(item => (
                  <Link key={item.path} to={item.path}>
                    <Button 
                      variant="ghost" 
                      className={`w-full h-auto flex flex-col items-center gap-1 py-3 ${item.color} hover:opacity-80`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/income" className="block">
              <div className="wealth-card hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="wealth-label mb-1">Combined Income</p>
                    <p className="text-lg sm:text-xl font-bold font-mono text-wealth-positive">{formatAmount(combinedIncome)}/mo</p>
                    <p className="text-xs text-muted-foreground mt-1">2 earning partners</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
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
