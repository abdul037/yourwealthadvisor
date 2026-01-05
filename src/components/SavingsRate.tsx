import { PiggyBank, TrendingUp } from 'lucide-react';
import { IncomeSource, getMonthlyIncomeData } from '@/lib/incomeData';
import { Expense, getMonthlySpending } from '@/lib/expenseData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface SavingsRateProps {
  incomeSources: IncomeSource[];
  expenses: Expense[];
}

export function SavingsRate({ incomeSources, expenses }: SavingsRateProps) {
  const { formatAmount } = useFormattedCurrency();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyData = getMonthlyIncomeData(incomeSources);
  const currentMonthIncome = monthlyData[monthlyData.length - 1]?.total || 0;
  const currentMonthExpenses = getMonthlySpending(expenses, currentMonth, currentYear);
  
  const savings = currentMonthIncome - currentMonthExpenses;
  const savingsRate = currentMonthIncome > 0 ? (savings / currentMonthIncome) * 100 : 0;
  
  // Calculate 6-month average savings
  const avgSavings = monthlyData.reduce((sum, month, index) => {
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - (5 - index));
    const monthExpenses = getMonthlySpending(expenses, prevMonth.getMonth(), prevMonth.getFullYear());
    return sum + (month.total - monthExpenses);
  }, 0) / 6;

  const getSavingsColor = (rate: number) => {
    if (rate >= 30) return 'text-wealth-positive';
    if (rate >= 15) return 'text-yellow-500';
    return 'text-wealth-negative';
  };

  return (
    <div className="wealth-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-wealth-positive/20 flex items-center justify-center">
          <PiggyBank className="w-5 h-5 text-wealth-positive" />
        </div>
        <div>
          <p className="wealth-label">Monthly Savings Rate</p>
          <p className={`text-2xl font-bold font-mono ${getSavingsColor(savingsRate)}`}>
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Income</span>
          <span className="font-mono font-medium text-wealth-positive">
            {formatAmount(currentMonthIncome)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Expenses</span>
          <span className="font-mono font-medium text-wealth-negative">
            {formatAmount(currentMonthExpenses)}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-wealth-positive/10 border border-wealth-positive/20">
          <span className="text-sm font-medium">Net Savings</span>
          <span className={`font-mono font-bold ${savings >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
            {savings >= 0 ? '+' : ''}{formatAmount(savings)}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>6-month avg savings: </span>
          <span className={`font-mono font-medium ${avgSavings >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
            {formatAmount(avgSavings)}/mo
          </span>
        </div>
      </div>
    </div>
  );
}
