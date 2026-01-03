import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, TrendingUp, Calendar, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, LIQUIDITY_LABELS, initialPortfolio, Asset } from '@/lib/portfolioData';
import { sampleExpenses } from '@/lib/expenseData';

interface LiquiditySetting {
  category_name: string;
  category_type: string;
  liquidity_level: 'L1' | 'L2' | 'L3' | 'NL';
  liquidity_percentage: number;
}

const USD_TO_AED = 3.67;

export function EmergencyFundCalculator() {
  const [liquiditySettings, setLiquiditySettings] = useState<LiquiditySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetMonths, setTargetMonths] = useState(6);

  useEffect(() => {
    fetchLiquiditySettings();
  }, []);

  const fetchLiquiditySettings = async () => {
    const { data } = await supabase
      .from('category_liquidity_settings')
      .select('*')
      .eq('category_type', 'asset');
    
    if (data) setLiquiditySettings(data as LiquiditySetting[]);
    setLoading(false);
  };

  // Calculate monthly expenses from sample data
  const calculateMonthlyExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthExpenses = sampleExpenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const total = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    // If current month is incomplete, estimate based on average
    return total > 0 ? total : 38000; // Default Dubai family monthly expenses
  };

  // Calculate liquid assets based on portfolio and liquidity settings
  const calculateLiquidAssets = () => {
    let instantlyLiquid = 0; // L1 - same day
    let shortTermLiquid = 0; // L2 - within 7 days
    let mediumTermLiquid = 0; // L3 - within 30 days
    let totalAssets = 0;

    initialPortfolio.forEach(asset => {
      const valueAED = asset.aedValue;
      totalAssets += valueAED;

      // Find liquidity setting for this asset category
      const setting = liquiditySettings.find(s => s.category_name === asset.category);
      const percentage = setting?.liquidity_percentage ?? 80;
      const level = setting?.liquidity_level ?? asset.liquidityLevel;
      const effectiveValue = valueAED * (percentage / 100);

      switch (level) {
        case 'L1':
          instantlyLiquid += effectiveValue;
          break;
        case 'L2':
          shortTermLiquid += effectiveValue;
          break;
        case 'L3':
          mediumTermLiquid += effectiveValue;
          break;
        // NL assets are not counted
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

  const monthlyExpenses = calculateMonthlyExpenses();
  const liquidAssets = calculateLiquidAssets();
  
  // Calculate months covered by different liquidity tiers
  const monthsCoveredInstant = liquidAssets.instantlyLiquid / monthlyExpenses;
  const monthsCoveredShort = (liquidAssets.instantlyLiquid + liquidAssets.shortTermLiquid) / monthlyExpenses;
  const monthsCoveredTotal = liquidAssets.totalLiquid / monthlyExpenses;
  
  const targetAmount = monthlyExpenses * targetMonths;
  const progressToTarget = Math.min((liquidAssets.totalLiquid / targetAmount) * 100, 100);
  const shortfall = Math.max(targetAmount - liquidAssets.totalLiquid, 0);

  // Determine status
  const getStatus = () => {
    if (monthsCoveredTotal >= 6) return { icon: CheckCircle2, color: 'text-wealth-positive', bg: 'bg-wealth-positive', label: 'Excellent' };
    if (monthsCoveredTotal >= 3) return { icon: TrendingUp, color: 'text-chart-2', bg: 'bg-chart-2', label: 'Good' };
    return { icon: AlertTriangle, color: 'text-accent', bg: 'bg-accent', label: 'Needs Attention' };
  };

  const status = getStatus();

  if (loading) {
    return (
      <div className="wealth-card animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Emergency Fund Status</h3>
            <p className="text-sm text-muted-foreground">Based on liquid assets & monthly expenses</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}/20`}>
          <status.icon className={`w-4 h-4 ${status.color}`} />
          <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
        </div>
      </div>

      {/* Main Metric */}
      <div className="text-center mb-6">
        <p className="text-5xl font-bold font-mono">
          {monthsCoveredTotal.toFixed(1)}
          <span className="text-2xl text-muted-foreground ml-2">months</span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">of expenses covered by liquid assets</p>
      </div>

      {/* Progress to Target */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Progress to {targetMonths}-month target</span>
          <span className="text-sm font-mono">{progressToTarget.toFixed(0)}%</span>
        </div>
        <Progress value={progressToTarget} className="h-3" />
        {shortfall > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            <span className="text-accent font-medium">{formatCurrency(shortfall)}</span> more needed to reach target
          </p>
        )}
      </div>

      {/* Liquidity Breakdown */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-wealth-positive/10 border border-wealth-positive/20 text-center">
          <p className="text-xs text-muted-foreground mb-1">Instant (L1)</p>
          <p className="text-lg font-bold font-mono">{monthsCoveredInstant.toFixed(1)}</p>
          <p className="text-xs text-wealth-positive">months</p>
        </div>
        <div className="p-3 rounded-lg bg-chart-2/10 border border-chart-2/20 text-center">
          <p className="text-xs text-muted-foreground mb-1">+ Short-term (L2)</p>
          <p className="text-lg font-bold font-mono">{monthsCoveredShort.toFixed(1)}</p>
          <p className="text-xs text-chart-2">months</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
          <p className="text-xs text-muted-foreground mb-1">+ Medium (L3)</p>
          <p className="text-lg font-bold font-mono">{monthsCoveredTotal.toFixed(1)}</p>
          <p className="text-xs text-accent">months</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-muted-foreground">Monthly Expenses</span>
          <span className="font-mono font-medium">{formatCurrency(monthlyExpenses)}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-muted-foreground">Total Liquid Assets</span>
          <span className="font-mono font-medium text-primary">{formatCurrency(liquidAssets.totalLiquid)}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <span className="text-muted-foreground">Target ({targetMonths} months)</span>
          <span className="font-mono font-medium">{formatCurrency(targetAmount)}</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">Total Portfolio Value</span>
          <span className="font-mono">{formatCurrency(liquidAssets.totalAssets)}</span>
        </div>
      </div>

      {/* Target Selector */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Adjust target months:</p>
        <div className="flex gap-2">
          {[3, 6, 9, 12].map(months => (
            <button
              key={months}
              onClick={() => setTargetMonths(months)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
