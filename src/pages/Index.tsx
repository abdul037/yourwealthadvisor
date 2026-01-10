import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Receipt, Wallet, TrendingDown, ArrowRight } from 'lucide-react';
import { Period } from '@/lib/periodUtils';
import { Button } from '@/components/ui/button';
import { NetWorthCard } from '@/components/NetWorthCard';
import { AllocationChart } from '@/components/AllocationChart';
import { LiquidityBreakdown } from '@/components/LiquidityBreakdown';
import { AssetList } from '@/components/AssetList';
import { TransactionForm } from '@/components/TransactionForm';
import { QuickTransactionInput } from '@/components/QuickTransactionInput';
import { RecentTransactions } from '@/components/RecentTransactions';
import { QuickStats } from '@/components/QuickStats';
import { PortfolioAggregation } from '@/components/PortfolioAggregation';
import { IncomeLiquidityChart } from '@/components/IncomeLiquidityChart';
import { EmergencyFundCalculator } from '@/components/EmergencyFundCalculator';
import { CashFlowForecast } from '@/components/CashFlowForecast';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { SetupWizard } from '@/components/SetupWizard';
import { GettingStartedChecklist } from '@/components/GettingStartedChecklist';
import { DashboardConnectedAccounts } from '@/components/DashboardConnectedAccounts';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { NotificationWidget } from '@/components/SmartNotificationCenter';
import { FeatureDiscovery } from '@/components/FeatureDiscovery';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { GuidedWorkflow } from '@/components/GuidedWorkflow';
import { useAssets, Asset as DBAsset } from '@/hooks/useAssets';
import { useTransactions, Transaction as DBTransaction } from '@/hooks/useTransactions';
import { useIncomes } from '@/hooks/useIncomes';
import { useLinkedAccounts, LinkedAccount } from '@/hooks/useLinkedAccounts';
import { Transaction, Asset } from '@/lib/portfolioData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAchievements } from '@/hooks/useAchievements';
import { BankAccount, BankTransaction } from '@/lib/mockBankingData';
import { convertToAED, isCashEquivalent } from '@/lib/currencyUtils';

const quickNavItems = [
  { path: '/income', label: 'Income', icon: DollarSign, color: 'bg-wealth-positive/20 text-wealth-positive' },
  { path: '/expenses', label: 'Expenses', icon: Receipt, color: 'bg-wealth-negative/20 text-wealth-negative' },
  { path: '/budget', label: 'Budget', icon: Wallet, color: 'bg-chart-2/20 text-chart-2' },
  { path: '/debt', label: 'Debt', icon: TrendingDown, color: 'bg-accent/20 text-accent' },
];

// Adapter to convert DB asset to component format with proper currency conversion
const adaptAsset = (dbAsset: DBAsset): Asset => {
  const aedValue = convertToAED(dbAsset.amount, dbAsset.currency);
  
  return {
    id: dbAsset.id,
    name: dbAsset.name,
    category: dbAsset.category as Asset['category'],
    amount: dbAsset.amount,
    unit: (dbAsset.currency || 'AED') as Asset['unit'],
    aedValue: aedValue,
    usdValue: aedValue * 0.27,
    inrValue: aedValue * 22.7,
    liquidityLevel: (dbAsset.liquidity_level || 'L2') as Asset['liquidityLevel'],
    isCash: isCashEquivalent(dbAsset.category),
  };
};

// Adapter to convert DB transaction to component format
const adaptTransaction = (dbTransaction: DBTransaction): Transaction => ({
  id: dbTransaction.id,
  amount: dbTransaction.amount,
  type: dbTransaction.type as Transaction['type'],
  category: dbTransaction.category,
  description: dbTransaction.description || '',
  date: dbTransaction.transaction_date,
  currency: (dbTransaction.currency || 'AED') as Transaction['currency'],
});

const Index = () => {
  const { assets: dbAssets, isLoading: assetsLoading } = useAssets();
  const { transactions: dbTransactions, isLoading: transactionsLoading, addTransaction } = useTransactions({ limit: 20 });
  const { totalMonthlyIncome, isLoading: incomesLoading } = useIncomes();
  const { accounts: linkedAccounts, isLoading: linkedAccountsLoading } = useLinkedAccounts();
  const { formatAmount } = useFormattedCurrency();
  const { isAuthenticated, profile, loading: profileLoading } = useUserProfile();
  const { updateStreak, checkTransactionAchievements } = useAchievements();
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1W');
  const [achievementsChecked, setAchievementsChecked] = useState(false);

  const isLoading = profileLoading || assetsLoading || transactionsLoading || incomesLoading || linkedAccountsLoading;

  // Debug logging
  console.log('[Dashboard] Data loaded:', {
    assetsCount: dbAssets.length,
    transactionsCount: dbTransactions.length,
    totalMonthlyIncome,
    linkedAccountsCount: linkedAccounts.length,
    userId: profile?.id,
    isAuthenticated,
    isLoading,
  });

  // Convert DB data to component format
  const assets: Asset[] = dbAssets.map(adaptAsset);
  const transactions: Transaction[] = dbTransactions.map(adaptTransaction);

  // Calculate linked accounts balance with proper currency conversion
  const linkedAccountsBalance = useMemo(() => {
    return linkedAccounts.reduce((sum, acc) => {
      const valueInAED = convertToAED(acc.opening_balance, acc.currency);
      // Only include positive balances (bank accounts, not utility dues)
      return sum + (valueInAED > 0 ? valueInAED : 0);
    }, 0);
  }, [linkedAccounts]);

  // Calculate cash position from income and expense transactions
  const cashPosition = useMemo(() => {
    const totalIncome = dbTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);
    
    const totalExpenses = dbTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);
    
    return totalIncome - totalExpenses;
  }, [dbTransactions]);

  // Update streak on page load
  useEffect(() => {
    if (isAuthenticated) {
      updateStreak();
    }
  }, [isAuthenticated, updateStreak]);

  // Check transaction achievements - only once when transactions load
  useEffect(() => {
    if (dbTransactions.length > 0 && !achievementsChecked && !isLoading) {
      checkTransactionAchievements(dbTransactions.length);
      setAchievementsChecked(true);
    }
  }, [dbTransactions.length, achievementsChecked, isLoading, checkTransactionAchievements]);

  // Convert linked accounts to BankAccount format for compatibility
  const connectedAccounts: BankAccount[] = linkedAccounts.map(acc => ({
    id: acc.id,
    bankLogo: acc.platform_logo || '🏦',
    bankName: acc.platform_name,
    accountNumber: acc.account_number || '****',
    accountType: acc.account_type as BankAccount['accountType'],
    balance: acc.opening_balance,
    currency: acc.currency as BankAccount['currency'],
    lastSynced: acc.last_synced || new Date().toISOString(),
    isConnected: acc.is_active ?? true,
  }));

  const handleAccountsConnected = (accounts: BankAccount[]) => {
    // This is now handled by the useLinkedAccounts hook
  };

  const handleTransactionsImported = async (bankTransactions: BankTransaction[]) => {
    // Import transactions to database
    for (const bt of bankTransactions) {
      await addTransaction.mutateAsync({
        amount: Math.abs(bt.amount),
        type: bt.amount < 0 ? 'expense' : 'income',
        category: bt.category,
        description: bt.description,
        transaction_date: bt.date,
        currency: 'AED',
      });
    }
  };
  
  // Show setup wizard for new authenticated users who haven't completed onboarding
  useEffect(() => {
    if (!profileLoading && isAuthenticated && profile && !profile.onboarding_completed) {
      const timer = setTimeout(() => setShowSetupWizard(true), 500);
      return () => clearTimeout(timer);
    }
  }, [profileLoading, isAuthenticated, profile]);
  
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await addTransaction.mutateAsync({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      description: transaction.description,
      transaction_date: transaction.date,
      currency: transaction.currency,
    });
  };

  // Use calculated monthly income
  const combinedIncome = totalMonthlyIncome || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <DashboardSkeleton variant="full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SetupWizard 
        open={showSetupWizard} 
        onOpenChange={setShowSetupWizard} 
        onAccountsConnected={handleAccountsConnected}
      />
      
      
      {/* Guided Workflow Overlay */}
      <GuidedWorkflow />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Welcome Banner */}
        <div className="mb-6">
          <WelcomeBanner />
        </div>
        
        {/* Feature Discovery Tips */}
        <div className="mb-6">
          <FeatureDiscovery />
        </div>
        
        {/* Getting Started Checklist, Progress & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="lg:col-span-2 space-y-4">
            <GettingStartedChecklist />
            <ProgressDashboard compact />
          </div>
          <div>
            <NotificationWidget />
          </div>
        </div>
        
        {/* Hero Section - Net Worth & Quick Actions */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex-1 min-w-0" data-tour="net-worth">
            <NetWorthCard 
              assets={assets} 
              linkedAccountsBalance={linkedAccountsBalance} 
              cashPosition={cashPosition}
              period={selectedPeriod} 
              onPeriodChange={setSelectedPeriod} 
            />
          </div>
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="wealth-card flex-1">
              <p className="wealth-label mb-3">Quick Add</p>
              <div className="space-y-3" data-tour="add-transaction">
                <QuickTransactionInput />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex-1 border-t border-border"></span>
                  <span>or use full form</span>
                  <span className="flex-1 border-t border-border"></span>
                </div>
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
                    <p className="text-lg sm:text-xl font-bold font-mono text-wealth-positive">
                      {combinedIncome > 0 ? `${formatAmount(combinedIncome)}/mo` : 'Add income'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {combinedIncome > 0 ? 'Monthly total' : 'Track your earnings'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Connected Accounts Widget */}
        {(connectedAccounts.length > 0 || isAuthenticated) && (
          <div className="mb-6 sm:mb-8">
            <DashboardConnectedAccounts 
              accounts={connectedAccounts}
              onAccountsConnected={handleAccountsConnected}
              onTransactionsImported={handleTransactionsImported}
            />
          </div>
        )}
        
        {/* Portfolio Aggregation - Connected Platforms */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Investment Portfolio Overview</h2>
          <PortfolioAggregation connectedAccounts={connectedAccounts} period={selectedPeriod} />
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
        <QuickStats assets={assets} linkedAccountsBalance={linkedAccountsBalance} period={selectedPeriod} />
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {/* Allocation Chart */}
          <AllocationChart assets={assets} linkedAccountsBalance={linkedAccountsBalance} />
          
          {/* Liquidity Breakdown */}
          <LiquidityBreakdown assets={assets} linkedAccountsBalance={linkedAccountsBalance} />
          
          {/* Recent Transactions */}
          <RecentTransactions transactions={transactions} period={selectedPeriod} />
        </div>
        
        {/* Asset List */}
        <div className="mt-6 sm:mt-8">
          <AssetList assets={assets} />
        </div>
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Your Personal Wealth Manager
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
