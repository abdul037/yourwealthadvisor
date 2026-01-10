import { TrendingUp, TrendingDown } from 'lucide-react';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface IncomeOverviewProps {
  totalMonthlyIncome: number;
  previousMonthIncome?: number;
  partner1Income?: number;
  partner2Income?: number;
  bonusIncome?: number;
  otherIncome?: number;
  avgMonthlyIncome?: number;
  partnerNames?: {
    partner1Name: string;
    partner2Name: string;
  };
}

export function IncomeOverview({ 
  totalMonthlyIncome, 
  previousMonthIncome = 0,
  partner1Income = 0,
  partner2Income = 0,
  bonusIncome = 0,
  otherIncome = 0,
  avgMonthlyIncome = 0,
  partnerNames,
}: IncomeOverviewProps) {
  const { formatAmount } = useFormattedCurrency();
  
  const monthChange = previousMonthIncome > 0 
    ? ((totalMonthlyIncome - previousMonthIncome) / previousMonthIncome) * 100 
    : 0;

  // Use provided partner names or fallback to defaults
  const partner1Name = partnerNames?.partner1Name || 'Partner 1';
  const partner2Name = partnerNames?.partner2Name || 'Partner 2';

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="wealth-label">Combined Monthly Income</p>
          <p className="text-3xl font-bold font-mono mt-1">
            {formatAmount(totalMonthlyIncome)}
          </p>
        </div>
        {previousMonthIncome > 0 && (
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
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">{partner1Name}</span>
          </div>
          <p className="text-xl font-bold font-mono">{formatAmount(partner1Income)}</p>
          <p className="text-xs text-muted-foreground mt-1">Salary & Income</p>
        </div>
        
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">{partner2Name}</span>
          </div>
          <p className="text-xl font-bold font-mono">{formatAmount(partner2Income)}</p>
          <p className="text-xs text-muted-foreground mt-1">Salary & Income</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Bonuses</p>
          <p className="font-bold font-mono text-wealth-positive">{formatAmount(bonusIncome)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Other Income</p>
          <p className="font-bold font-mono">{formatAmount(otherIncome)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Average</p>
          <p className="font-bold font-mono">{formatAmount(avgMonthlyIncome || totalMonthlyIncome)}</p>
        </div>
      </div>
    </div>
  );
}
