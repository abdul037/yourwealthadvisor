import { TrendingUp, TrendingDown, Users } from 'lucide-react';
import { IncomeSource, getMonthlyIncomeData } from '@/lib/incomeData';
import { formatCurrency } from '@/lib/portfolioData';

interface IncomeOverviewProps {
  incomeSources: IncomeSource[];
}

export function IncomeOverview({ incomeSources }: IncomeOverviewProps) {
  const monthlyData = getMonthlyIncomeData(incomeSources);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  const monthChange = currentMonth && previousMonth 
    ? ((currentMonth.total - previousMonth.total) / previousMonth.total) * 100 
    : 0;
  
  const avgMonthlyIncome = monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length;
  
  const partner1Total = currentMonth?.partner1 || 0;
  const partner2Total = currentMonth?.partner2 || 0;
  const bonusTotal = currentMonth?.bonus || 0;
  const otherTotal = currentMonth?.other || 0;

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="wealth-label">Combined Monthly Income</p>
          <p className="text-3xl font-bold font-mono mt-1">
            {formatCurrency(currentMonth?.total || 0)}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
          monthChange >= 0 
            ? 'bg-wealth-positive/20 text-wealth-positive' 
            : 'bg-wealth-negative/20 text-wealth-negative'
        }`}>
          {monthChange >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {Math.abs(monthChange).toFixed(1)}%
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Partner 1</span>
          </div>
          <p className="text-xl font-bold font-mono">{formatCurrency(partner1Total)}</p>
          <p className="text-xs text-muted-foreground mt-1">Tech Lead</p>
        </div>
        
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">Partner 2</span>
          </div>
          <p className="text-xl font-bold font-mono">{formatCurrency(partner2Total)}</p>
          <p className="text-xs text-muted-foreground mt-1">Marketing Manager</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Bonuses</p>
          <p className="font-bold font-mono text-wealth-positive">{formatCurrency(bonusTotal)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Other Income</p>
          <p className="font-bold font-mono">{formatCurrency(otherTotal)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">6-mo Average</p>
          <p className="font-bold font-mono">{formatCurrency(avgMonthlyIncome)}</p>
        </div>
      </div>
    </div>
  );
}
