import { AlertTriangle, TrendingDown, Calendar, Percent } from 'lucide-react';
import { Debt, calculatePayoffProjection, calculateTotalInterest, getMonthsToPayoff } from '@/lib/debtData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface DebtOverviewProps {
  debts: Debt[];
}

export function DebtOverview({ debts }: DebtOverviewProps) {
  const { formatAmount } = useFormattedCurrency();
  const totalDebt = debts.reduce((sum, d) => sum + d.currentBalance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalMonthlyPayment = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  
  // Calculate weighted average interest rate
  const weightedInterest = debts.reduce((sum, d) => sum + (d.interestRate * d.currentBalance), 0) / totalDebt || 0;
  
  // Calculate total interest if paying minimum
  let totalInterest = 0;
  let maxMonths = 0;
  debts.forEach(debt => {
    const projection = calculatePayoffProjection(debt);
    totalInterest += calculateTotalInterest(projection);
    const months = getMonthsToPayoff(projection);
    if (months > maxMonths) maxMonths = months;
  });
  
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + maxMonths);

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-3xl font-bold font-mono text-destructive">
              {formatAmount(totalDebt)}
            </p>
          </div>
        </div>
        {debts.some(d => d.interestRate > 20) && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">
            <AlertTriangle className="w-4 h-4" />
            High Interest Debt
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Debt-Free Date</span>
          </div>
          <p className="font-bold font-mono">
            {debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
          <p className="text-xs text-muted-foreground">{maxMonths} months</p>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg Interest Rate</span>
          </div>
          <p className={`font-bold font-mono ${weightedInterest > 15 ? 'text-destructive' : ''}`}>
            {weightedInterest.toFixed(2)}%
          </p>
          <p className="text-xs text-muted-foreground">Weighted average</p>
        </div>
        
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Monthly Payments</span>
          </div>
          <p className="font-bold font-mono">{formatAmount(totalMonthlyPayment)}</p>
          <p className="text-xs text-muted-foreground">Min: {formatAmount(totalMinPayment)}</p>
        </div>
        
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-destructive">Total Interest</span>
          </div>
          <p className="font-bold font-mono text-destructive">{formatAmount(totalInterest)}</p>
          <p className="text-xs text-muted-foreground">If current payments</p>
        </div>
      </div>
    </div>
  );
}
