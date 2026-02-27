import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Receipt, Wallet, TrendingDown, ArrowRight, Link2, Plus, ChevronDown, Bell, Sparkles, Target, Globe, CheckCircle2, Circle, Info } from 'lucide-react';
import { Period } from '@/lib/periodUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { useBudgets } from '@/hooks/useBudgets';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useNotifications } from '@/hooks/useNotifications';
import { BankAccount, BankTransaction } from '@/lib/mockBankingData';
import { convertToAED, isCashEquivalent } from '@/lib/currencyUtils';
import { trackAppEvent } from '@/lib/appAnalytics';

const quickNavItems = [
  { path: '/income', label: 'Income', icon: DollarSign, color: 'bg-wealth-positive/20 text-wealth-positive' },
  { path: '/expenses', label: 'Expenses', icon: Receipt, color: 'bg-wealth-negative/20 text-wealth-negative' },
  { path: '/budget', label: 'Budget', icon: Wallet, color: 'bg-chart-2/20 text-chart-2' },
  { path: '/debt', label: 'Debt', icon: TrendingDown, color: 'bg-accent/20 text-accent' },
];

const summaryCardClass =
  "wealth-card p-4 relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/4 before:via-transparent before:to-transparent before:opacity-50 before:pointer-events-none";

type FocusMode = 'young_pro' | 'expat';

const focusStorageKey = 'tharwa_dashboard_focus';
const aiMapReviewedKey = 'tharwa_ai_map_reviewed';
const aiMapViewedKey = 'tharwa_ai_map_viewed';

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
  const { totalAllocated } = useBudgets();
  const { goals } = useSavingsGoals();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [gettingStartedOpen, setGettingStartedOpen] = useState(false);
  const [showFullTransactionForm, setShowFullTransactionForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1W');
  const [achievementsChecked, setAchievementsChecked] = useState(false);
  const [focusMode, setFocusMode] = useState<FocusMode>(() => {
    if (typeof window === 'undefined') return 'young_pro';
    const stored = window.localStorage.getItem(focusStorageKey) as FocusMode | null;
    return stored || 'young_pro';
  });
  const [aiMapReviewed, setAiMapReviewed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(aiMapReviewedKey) === 'true';
  });

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

  const currencySummary = useMemo(() => {
    const counts: Record<string, number> = {};
    dbTransactions.forEach(tx => {
      const currency = tx.currency || 'AED';
      counts[currency] = (counts[currency] || 0) + 1;
    });
    linkedAccounts.forEach(acc => {
      const currency = acc.currency || 'AED';
      counts[currency] = (counts[currency] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      totalCurrencies: entries.length,
      primaryCurrency: entries[0]?.[0] || 'AED',
      secondaryCount: Math.max(entries.length - 1, 0),
    };
  }, [dbTransactions, linkedAccounts]);

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
  

  const autoFocusMode: FocusMode = currencySummary.totalCurrencies > 1 ? 'expat' : 'young_pro';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(focusStorageKey) as FocusMode | null;
    if (!stored) {
      setFocusMode(autoFocusMode);
    }
  }, [autoFocusMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(aiMapViewedKey) === 'true') return;
    window.localStorage.setItem(aiMapViewedKey, 'true');
    trackAppEvent('dashboard_ai_map_viewed', {
      focus: focusMode,
      currencyCount: currencySummary.totalCurrencies,
      transactionCount: dbTransactions.length,
    });
  }, [focusMode, currencySummary.totalCurrencies, dbTransactions.length]);
  
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

  const handleFocusChange = (value: string) => {
    if (!value) return;
    const next = value as FocusMode;
    setFocusMode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(focusStorageKey, next);
    }
    trackAppEvent('dashboard_focus_selected', { focus: next });
  };

  const markAiMapReviewed = (source: 'insight' | 'why') => {
    if (aiMapReviewed) return;
    setAiMapReviewed(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(aiMapReviewedKey, 'true');
    }
    trackAppEvent('dashboard_ai_map_reviewed', { source });
  };

  // Use calculated monthly income
  const combinedIncome = totalMonthlyIncome || 0;

  const { monthIncome, monthExpenses, topCategories } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const spendByCategory: Record<string, number> = {};

    const isSameMonth = (dateString: string) => {
      const date = new Date(dateString);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    };

    const income = dbTransactions
      .filter(t => t.type === 'income' && isSameMonth(t.transaction_date))
      .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);

    const expenses = dbTransactions
      .filter(t => t.type === 'expense' && isSameMonth(t.transaction_date))
      .reduce((sum, t) => {
        const converted = convertToAED(t.amount, t.currency || 'AED');
        spendByCategory[t.category] = (spendByCategory[t.category] || 0) + converted;
        return sum + converted;
      }, 0);

    const sortedCategories = Object.entries(spendByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category, amount]) => ({
        category,
        amount,
        share: expenses > 0 ? amount / expenses : 0,
      }));

    return { monthIncome: income, monthExpenses: expenses, topCategories: sortedCategories };
  }, [dbTransactions]);

  const budgetUsage = totalAllocated > 0 ? Math.min((monthExpenses / totalAllocated) * 100, 100) : 0;
  const budgetRemaining = Math.max(totalAllocated - monthExpenses, 0);
  const savingsRate = monthIncome > 0 ? Math.max(((monthIncome - monthExpenses) / monthIncome) * 100, 0) : 0;
  const topCategory = topCategories[0];
  const confidenceLevel = dbTransactions.length >= 20 ? 'High' : dbTransactions.length >= 8 ? 'Medium' : 'Low';
  const availableCash = monthIncome - monthExpenses;
  const hasCashflowData = monthIncome > 0 || monthExpenses > 0;
  const cashflowGap = Math.max(monthExpenses - monthIncome, 0);
  const savingsTargetRate = focusMode === 'expat' ? 0.25 : 0.2;
  const cushionRate = focusMode === 'expat' ? 0.35 : 0.3;
  const suggestedSave = availableCash > 0
    ? Math.min(
        availableCash,
        Math.max(monthIncome * savingsTargetRate, availableCash * cushionRate)
      )
    : 0;
  const goalMonthsTarget = focusMode === 'expat' ? 4 : 3;
  const goalTarget = monthExpenses > 0
    ? monthExpenses * goalMonthsTarget
    : monthIncome * Math.max(goalMonthsTarget - 1, 1);
  const monthsToGoal = suggestedSave > 0 ? Math.ceil(goalTarget / suggestedSave) : 0;
  const savingsRateTarget = Math.round(savingsTargetRate * 100);
  const hasDataSignal = transactions.length > 0 || linkedAccounts.length > 0;
  const goalCreated = goals.length > 0;
  const journeySteps = [
    { label: 'Add data', done: hasDataSignal },
    { label: 'Review AI map', done: aiMapReviewed },
    { label: 'Lock your first goal', done: goalCreated },
  ];
  const journeyProgress = Math.round((journeySteps.filter(step => step.done).length / journeySteps.length) * 100);
  const focusTitle = focusMode === 'expat' ? 'Expat focus' : 'Young professional focus';
  const focusDescription = focusMode === 'expat'
    ? 'Balance multi-currency cash flow and build a 4-month base-currency buffer.'
    : 'Build a cash buffer and keep monthly spending predictable.';
  const focusSignal = focusMode === 'expat'
    ? `Target ${savingsRateTarget}% savings + ${goalMonthsTarget}-month buffer`
    : monthExpenses > 0
      ? `Savings runway: ${Math.max(cashPosition / monthExpenses, 0).toFixed(1)} months (target ${savingsRateTarget}%)`
      : `Target savings rate: ${savingsRateTarget}% of income`;
  const surpriseInsight = (() => {
    if (monthIncome === 0 && monthExpenses === 0) {
      return 'Add a few transactions to unlock your AI money map.';
    }
    if (monthExpenses > monthIncome) {
      return `Spending is ${formatAmount(monthExpenses - monthIncome)} above income this month.`;
    }
    if (topCategory && topCategory.share > 0.35) {
      return `${topCategory.category} makes up ${(topCategory.share * 100).toFixed(0)}% of spending.`;
    }
    if (budgetUsage >= 85 && totalAllocated > 0) {
      return `You are at ${budgetUsage.toFixed(0)}% of your monthly budget.`;
    }
    return `Savings rate is ${savingsRate.toFixed(0)}% this month.`;
  })();
  const quickFix = (() => {
    if (monthExpenses > monthIncome && monthIncome > 0) {
      return `Trim ${formatAmount(monthExpenses - monthIncome)} to reach break-even.`;
    }
    if (topCategory) {
      const trimAmount = topCategory.amount * 0.1;
      return `Reduce ${topCategory.category} by ${formatAmount(trimAmount)} to move toward ${savingsRateTarget}% savings.`;
    }
    return focusMode === 'expat'
      ? `Set aside ${savingsRateTarget}% monthly for a base-currency buffer.`
      : `Aim for ${savingsRateTarget}% monthly savings to build consistency.`;
  })();

  const upcomingBills = useMemo(() => {
    const now = Date.now();
    return notifications.filter(n => {
      if (n.type !== 'bill_reminder') return false;
      if (!n.scheduled_for) return true;
      return new Date(n.scheduled_for).getTime() >= now;
    }).length;
  }, [notifications]);

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
      {/* Guided Workflow Overlay */}
      <GuidedWorkflow />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div className="space-y-1">
            <p className="wealth-label">Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Your Wealth Snapshot</h1>
            <p className="text-sm text-muted-foreground">
              Track net worth, cash flow, and goals in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add transaction
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/income" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Add income
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/expenses" className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Log expense
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/investments" className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Add asset
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/investments">
              <Button size="sm" variant="outline" className="gap-2">
                <Link2 className="w-4 h-4" />
                Connect accounts
              </Button>
            </Link>
          </div>
        </header>

        <div className="mb-6">
          <WelcomeBanner />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className={summaryCardClass}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">This month income</p>
              <div className="w-8 h-8 rounded-lg bg-wealth-positive/15 text-wealth-positive flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-semibold font-mono">{formatAmount(monthIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">Cash in from income sources</p>
          </div>
          <div className={summaryCardClass}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">This month spend</p>
              <div className="w-8 h-8 rounded-lg bg-wealth-negative/15 text-wealth-negative flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-semibold font-mono text-wealth-negative">{formatAmount(monthExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">Cash out from expenses</p>
          </div>
          <div className={summaryCardClass}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget status</p>
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            {totalAllocated > 0 ? (
              <>
                <p className="mt-2 text-xl font-semibold font-mono">{budgetUsage.toFixed(0)}% used</p>
                <div className="mt-2">
                  <Progress value={budgetUsage} className="h-1.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatAmount(budgetRemaining)} remaining
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-lg font-semibold">No budget yet</p>
                <Link to="/budget" className="text-xs text-primary hover:underline underline-offset-4">
                  Set your first budget
                </Link>
              </>
            )}
          </div>
          <div className={summaryCardClass}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Upcoming bills</p>
              <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-semibold">{upcomingBills}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingBills === 0 ? 'No bills due soon' : 'Bill reminders scheduled'}
            </p>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <p className="wealth-label">AI focus</p>
              <h2 className="text-base sm:text-lg font-semibold">Momentum plan</h2>
              <p className="text-sm text-muted-foreground">
                Personalized for {focusMode === 'expat' ? 'expats' : 'young professionals'}.
              </p>
            </div>
            <ToggleGroup
              type="single"
              value={focusMode}
              onValueChange={handleFocusChange}
              variant="outline"
              size="sm"
              className="justify-start md:justify-end"
            >
              <ToggleGroupItem value="young_pro">Young pros</ToggleGroupItem>
              <ToggleGroupItem value="expat">Expats</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="wealth-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="wealth-label">Focus plan</p>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    {focusMode === 'expat' ? (
                      <Globe className="w-4 h-4 text-primary" />
                    ) : (
                      <Target className="w-4 h-4 text-primary" />
                    )}
                    {focusTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{focusDescription}</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  AI guided
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Journey progress</span>
                  <span className="text-foreground font-medium">{journeyProgress}%</span>
                </div>
                <Progress value={journeyProgress} className="h-1.5" />
                <div className="space-y-2">
                  {journeySteps.map(step => (
                    <div key={step.label} className="flex items-center gap-2 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-wealth-positive" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/60" />
                      )}
                      <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  {focusSignal}
                </div>
              </div>
            </div>

            <div className="wealth-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="wealth-label">AI money map</p>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Signal highlights
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Top signals from recent activity.</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    confidenceLevel === 'High'
                      ? 'border-wealth-positive/40 text-wealth-positive'
                      : confidenceLevel === 'Medium'
                        ? 'border-accent/40 text-accent'
                        : 'border-muted-foreground/40 text-muted-foreground'
                  }
                >
                  {confidenceLevel} confidence
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                  <p className="text-sm font-medium">Surprise insight</p>
                  <p className="text-sm text-muted-foreground mt-1">{surpriseInsight}</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
                  <p className="text-sm font-medium">Quick fix</p>
                  <p className="text-sm text-muted-foreground mt-1">{quickFix}</p>
                </div>
                {topCategories.length > 0 ? (
                  <div className="space-y-2">
                    {topCategories.map(category => (
                      <div key={category.category} className="text-xs text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>{category.category}</span>
                          <span className="font-medium text-foreground">
                            {formatAmount(category.amount)}
                          </span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-muted">
                          <div
                            className="h-1 rounded-full bg-primary/60"
                            style={{ width: `${Math.min(category.share * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Add a few transactions to reveal your top categories.
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={() => markAiMapReviewed('insight')}>
                  Explore map
                </Button>
                <Dialog
                  onOpenChange={(open) => {
                    if (open) {
                      trackAppEvent('dashboard_ai_map_why_opened', { focus: focusMode });
                      markAiMapReviewed('why');
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground">
                      <Info className="w-4 h-4" />
                      Why this?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>How the AI money map works</DialogTitle>
                      <DialogDescription>
                        We analyze your last 30 days of transactions and linked accounts to surface top spending
                        categories and potential savings moves. You stay in control: edit categories or adjust the plan
                        anytime.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p>Data inputs: {dbTransactions.length} transactions, {linkedAccounts.length} accounts.</p>
                      <p>Focus mode: {focusMode === 'expat' ? 'Expat' : 'Young professional'}.</p>
                      <p>
                        Want to refine this?{' '}
                        <Link to="/expenses" className="text-primary hover:underline underline-offset-4">
                          Edit categories
                        </Link>
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="wealth-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="wealth-label">Goal draft</p>
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    {focusMode === 'expat' ? '4-month base-currency buffer' : '3-month cash buffer'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on your current cash flow and spending pattern.
                  </p>
                </div>
                <Badge variant="secondary">Auto plan</Badge>
              </div>
              <div className="mt-4 space-y-2">
                {suggestedSave > 0 ? (
                  <>
                    <p className="text-xl font-semibold font-mono">
                      {formatAmount(suggestedSave)} / month
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reach {formatAmount(goalTarget)} in {monthsToGoal} months.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current savings rate: {savingsRate.toFixed(0)}%.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Target savings rate: {savingsRateTarget}% of income.
                    </p>
                  </>
                ) : !hasCashflowData ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Add data to draft your plan
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Log income or expenses and we will build a personalized goal.
                    </p>
                  </>
                ) : cashflowGap > 0 ? (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Tight month detected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reduce expenses by {formatAmount(cashflowGap)} to unlock savings.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Break-even month
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trim 5% of spending to start a buffer this month.
                    </p>
                  </>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {suggestedSave > 0 ? (
                  <>
                    <Link to="/savings">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => trackAppEvent('dashboard_goal_locked', {
                          focus: focusMode,
                          monthlyTarget: Math.round(suggestedSave),
                          goalTarget: Math.round(goalTarget),
                        })}
                      >
                        Lock this plan
                      </Button>
                    </Link>
                    <Link to="/budget">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => trackAppEvent('dashboard_goal_adjusted', { focus: focusMode })}
                      >
                        Adjust numbers
                      </Button>
                    </Link>
                  </>
                ) : !hasCashflowData ? (
                  <>
                    <Link to="/income">
                      <Button size="sm" className="gap-2">
                        Add income
                      </Button>
                    </Link>
                    <Link to="/expenses">
                      <Button size="sm" variant="outline">
                        Log expense
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/expenses">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => trackAppEvent('dashboard_goal_adjusted', { focus: focusMode })}
                      >
                        Review spending
                      </Button>
                    </Link>
                    <Link to="/income">
                      <Button size="sm" variant="outline">
                        Add income
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {assets.length === 0 && transactions.length === 0 && (
          <div className="mb-6">
            <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-card/80 p-5 shadow-[0_16px_40px_-32px_rgba(16,185,129,0.35)] backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Add your first data point</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start with income or expenses, or connect accounts to sync automatically.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/income">
                    <Button size="sm" className="gap-2">
                      <DollarSign className="w-4 h-4" />
                      Add income
                    </Button>
                  </Link>
                  <Link to="/expenses">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Receipt className="w-4 h-4" />
                      Log expense
                    </Button>
                  </Link>
                  <Link to="/investments">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Link2 className="w-4 h-4" />
                      Connect accounts
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Getting Started Checklist, Progress & Notifications */}
        <div className="mb-6">
          <Collapsible open={gettingStartedOpen} onOpenChange={setGettingStartedOpen}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <p className="wealth-label">Getting started</p>
                <h2 className="text-base sm:text-lg font-semibold">Progress & alerts</h2>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <span>{gettingStartedOpen ? 'Hide' : 'Show'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${gettingStartedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="space-y-4 mb-4">
                <FeatureDiscovery />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <GettingStartedChecklist />
                  <ProgressDashboard compact />
                </div>
                <div>
                  <NotificationWidget 
                    notifications={notifications} 
                    unreadCount={unreadCount} 
                    onMarkRead={markAsRead} 
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
        {/* Hero Section - Net Worth & Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-end justify-between mb-3 sm:mb-4">
            <div>
              <p className="wealth-label">Overview</p>
              <h2 className="text-base sm:text-lg font-semibold">Net worth & quick actions</h2>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
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
            <div className="wealth-card flex-1 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-accent/60 to-primary/60" />
              <p className="wealth-label mb-3">Quick Add</p>
              <div className="space-y-3" data-tour="add-transaction">
                <QuickTransactionInput />
                <Collapsible open={showFullTransactionForm} onOpenChange={setShowFullTransactionForm}>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Need more details?</span>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1">
                        {showFullTransactionForm ? 'Hide details' : 'Expand details'}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullTransactionForm ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="pt-3">
                    <TransactionForm onAddTransaction={handleAddTransaction} />
                  </CollapsibleContent>
                </Collapsible>
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
          <div className="mt-6">
            <QuickStats assets={assets} linkedAccountsBalance={linkedAccountsBalance} period={selectedPeriod} />
          </div>
        </div>

        <div className="border-t border-border/60 my-6 sm:my-8" />
        
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
          <div className="flex items-end justify-between mb-3 sm:mb-4">
            <div>
              <p className="wealth-label">Portfolio</p>
              <h2 className="text-base sm:text-lg font-semibold">Investment overview</h2>
            </div>
          </div>
          <PortfolioAggregation connectedAccounts={connectedAccounts} period={selectedPeriod} />
        </div>
        
        {/* Income Liquidity & Emergency Fund */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-end justify-between mb-3 sm:mb-4">
            <div>
              <p className="wealth-label">Plan ahead</p>
              <h2 className="text-base sm:text-lg font-semibold">Liquidity, safety net & forecast</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <IncomeLiquidityChart />
            <EmergencyFundCalculator />
          </div>
          <div className="mt-4 sm:mt-6">
            <CashFlowForecast />
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="mt-6 sm:mt-8">
          <div className="flex items-end justify-between mb-3 sm:mb-4">
            <div>
              <p className="wealth-label">Portfolio breakdown</p>
              <h2 className="text-base sm:text-lg font-semibold">Allocation & recent activity</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Allocation Chart */}
          <AllocationChart assets={assets} linkedAccountsBalance={linkedAccountsBalance} />
          
          {/* Liquidity Breakdown */}
          <LiquidityBreakdown assets={assets} linkedAccountsBalance={linkedAccountsBalance} />
          
          {/* Recent Transactions */}
          <RecentTransactions transactions={transactions} period={selectedPeriod} />
          </div>
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
