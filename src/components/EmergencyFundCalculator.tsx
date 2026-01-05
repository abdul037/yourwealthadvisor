import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssets } from '@/hooks/useAssets';
import { useExpenses } from '@/hooks/useTransactions';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Link } from 'react-router-dom';

export function EmergencyFundCalculator() {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { transactions: expenses, isLoading: expensesLoading } = useExpenses();
  const [targetMonths, setTargetMonths] = useState(6);
  const { formatAmount } = useFormattedCurrency();

  const isLoading = assetsLoading || expensesLoading;

  // Calculate monthly expenses from real transactions
  const calculateMonthlyExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthExpenses = expenses.filter(e => {
      const date = new Date(e.transaction_date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const total = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // If no current month data, calculate average from all expenses
    if (total === 0 && expenses.length > 0) {
      const avgTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
      // Rough monthly average
      return avgTotal / Math.max(1, Math.ceil(expenses.length / 10));
    }
    
    return total;
  };

  // Calculate liquid assets based on real portfolio
  const calculateLiquidAssets = () => {
    let instantlyLiquid = 0;
    let shortTermLiquid = 0;
    let mediumTermLiquid = 0;
    let totalAssets = 0;

    assets.forEach(asset => {
      const valueAED = asset.amount;
      totalAssets += valueAED;

      const level = asset.liquidity_level || 'L2';

      switch (level) {
        case 'L1':
          instantlyLiquid += valueAED;
          break;
        case 'L2':
          shortTermLiquid += valueAED;
          break;
        case 'L3':
          mediumTermLiquid += valueAED;
          break;
      }
    });

    return {
      instantlyLiquid,
      shortTermLiquid,
      mediumTermLiquid,
      totalLiquid: instantlyLiquid + shortTermLiquid + mediumTermLiquid,
      totalAssets,
    };
  };

  if (isLoading) {
    return (
      <div className="wealth-card">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const monthlyExpenses = calculateMonthlyExpenses();
  const liquidAssets = calculateLiquidAssets();

  // Handle case when no data
  if (monthlyExpenses === 0 && liquidAssets.totalAssets === 0) {
    return (
      <div className="wealth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Emergency Fund Status</h3>
              <p className="text-xs text-muted-foreground">Add expenses and assets to calculate</p>
            </div>
          </div>
          <Link to="/expenses">
            <Button variant="outline" size="sm" className="gap-1">
              Add Data <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>Add expenses and assets to see your emergency fund status</p>
        </div>
      </div>
    );
  }

  // Use a reasonable default if no expenses yet
  const effectiveMonthlyExpenses = monthlyExpenses > 0 ? monthlyExpenses : 1;
  
  const monthsCoveredInstant = liquidAssets.instantlyLiquid / effectiveMonthlyExpenses;
  const monthsCoveredShort = (liquidAssets.instantlyLiquid + liquidAssets.shortTermLiquid) / effectiveMonthlyExpenses;
  const monthsCoveredTotal = liquidAssets.totalLiquid / effectiveMonthlyExpenses;
  
  const targetAmount = effectiveMonthlyExpenses * targetMonths;
  const progressToTarget = Math.min((liquidAssets.totalLiquid / targetAmount) * 100, 100);
  const shortfall = Math.max(targetAmount - liquidAssets.totalLiquid, 0);

  const getStatus = () => {
    if (monthsCoveredTotal >= 6) return { icon: CheckCircle2, color: 'text-wealth-positive', bg: 'bg-wealth-positive', label: 'Excellent' };
    if (monthsCoveredTotal >= 3) return { icon: TrendingUp, color: 'text-chart-2', bg: 'bg-chart-2', label: 'Good' };
    return { icon: AlertTriangle, color: 'text-accent', bg: 'bg-accent', label: 'Needs Attention' };
  };

  const status = getStatus();

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Emergency Fund Status</h3>
            <p className="text-xs text-muted-foreground">Based on liquid assets & monthly expenses</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg}/20`}>
            <status.icon className={`w-3 h-3 ${status.color}`} />
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
          <Link to="/budget">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Metric */}
      <div className="text-center mb-4">
        <p className="text-4xl font-bold font-mono">
          {monthsCoveredTotal.toFixed(1)}
          <span className="text-xl text-muted-foreground ml-2">months</span>
        </p>
        <p className="text-xs text-muted-foreground">of expenses covered</p>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs">Progress to {targetMonths}-month target</span>
          <span className="text-xs font-mono">{progressToTarget.toFixed(0)}%</span>
        </div>
        <Progress value={progressToTarget} className="h-2" />
        {shortfall > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-accent font-medium">{formatAmount(shortfall)}</span> more needed
          </p>
        )}
      </div>

      {/* Liquidity Breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-wealth-positive/10 border border-wealth-positive/20 text-center">
          <p className="text-[10px] text-muted-foreground">Instant</p>
          <p className="text-sm font-bold font-mono">{monthsCoveredInstant.toFixed(1)}</p>
        </div>
        <div className="p-2 rounded-lg bg-chart-2/10 border border-chart-2/20 text-center">
          <p className="text-[10px] text-muted-foreground">+ Short</p>
          <p className="text-sm font-bold font-mono">{monthsCoveredShort.toFixed(1)}</p>
        </div>
        <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-center">
          <p className="text-[10px] text-muted-foreground">+ Medium</p>
          <p className="text-sm font-bold font-mono">{monthsCoveredTotal.toFixed(1)}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Monthly Expenses</span>
          <span className="font-mono">{formatAmount(monthlyExpenses)}</span>
        </div>
        <div className="flex items-center justify-between py-1 border-b border-border/50">
          <span className="text-muted-foreground">Liquid Assets</span>
          <span className="font-mono text-primary">{formatAmount(liquidAssets.totalLiquid)}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">Target ({targetMonths} mo)</span>
          <span className="font-mono">{formatAmount(targetAmount)}</span>
        </div>
      </div>

      {/* Target Selector */}
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex gap-1">
          {[3, 6, 9, 12].map(months => (
            <button
              key={months}
              onClick={() => setTargetMonths(months)}
              className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                targetMonths === months
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {months}mo
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}