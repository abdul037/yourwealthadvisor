import { Calculator, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { formatCurrency } from '@/lib/portfolioData';

interface WealthStatsProps {
  currentNetWorth: number;
  monthlyChange: number;
  yearlyChange: number;
  monthlySavings: number;
  projectedNetWorth: number;
}

export function WealthStats({ 
  currentNetWorth, 
  monthlyChange, 
  yearlyChange, 
  monthlySavings,
  projectedNetWorth 
}: WealthStatsProps) {
  const stats = [
    {
      label: 'Current Net Worth',
      value: formatCurrency(currentNetWorth),
      icon: Calculator,
      color: 'bg-primary/20 text-primary',
    },
    {
      label: 'Monthly Change',
      value: `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`,
      icon: TrendingUp,
      color: monthlyChange >= 0 ? 'bg-wealth-positive/20 text-wealth-positive' : 'bg-wealth-negative/20 text-wealth-negative',
    },
    {
      label: 'Monthly Savings',
      value: formatCurrency(monthlySavings),
      icon: PiggyBank,
      color: 'bg-accent/20 text-accent',
    },
    {
      label: 'Projected (1 Year)',
      value: formatCurrency(projectedNetWorth),
      icon: Target,
      color: 'bg-purple-500/20 text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="wealth-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
          <p className="text-xl font-bold font-mono">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
