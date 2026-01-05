import { ArrowDownRight, ArrowUpRight, Wallet, Target } from 'lucide-react';
import { Expense, Budget } from '@/lib/expenseData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { format } from 'date-fns';

interface MonthlyOverviewProps {
  expenses: Expense[];
  budgets: Budget[];
}

export function MonthlyOverview({ expenses, budgets }: MonthlyOverviewProps) {
  const { formatAmount } = useFormattedCurrency();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const thisMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const lastMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  });
  
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const budgetRemaining = totalBudget - thisMonthTotal;
  const budgetPercentUsed = totalBudget > 0 ? (thisMonthTotal / totalBudget) * 100 : 0;
  
  const changePercent = lastMonthTotal > 0 
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
    : 0;
  const isIncrease = changePercent > 0;
  
  const dailyAverage = thisMonthExpenses.length > 0 
    ? thisMonthTotal / new Date().getDate() 
    : 0;
  
  return (
    <div className="wealth-card relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-destructive/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="wealth-label mb-1">{format(new Date(), 'MMMM yyyy')} Spending</p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-destructive">
                {formatAmount(thisMonthTotal)}
              </h2>
              {lastMonthTotal > 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  isIncrease ? 'bg-destructive/20 text-destructive' : 'bg-wealth-positive/20 text-wealth-positive'
                }`}>
                  {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(changePercent).toFixed(1)}% vs last month
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <p className="wealth-label">Daily Avg</p>
            </div>
            <p className="text-xl font-bold font-mono">{formatAmount(dailyAverage)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <p className="wealth-label">Total Budget</p>
            </div>
            <p className="text-xl font-bold font-mono">{formatAmount(totalBudget)}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <p className="wealth-label">Budget Left</p>
            </div>
            <p className={`text-xl font-bold font-mono ${budgetRemaining < 0 ? 'text-destructive' : 'text-wealth-positive'}`}>
              {formatAmount(Math.abs(budgetRemaining))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {budgetPercentUsed.toFixed(0)}% used
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
