import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useIncomes } from '@/hooks/useIncomes';
import { useBudgets } from '@/hooks/useBudgets';
import { useDebts } from '@/hooks/useDebts';
import { useExpenses } from '@/hooks/useTransactions';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Skeleton } from '@/components/ui/skeleton';

interface ForecastMonth {
  month: string;
  income: number;
  expenses: number;
  debtPayments: number;
  netCashFlow: number;
  cumulativeLiquidity: number;
}

export const CashFlowForecast = () => {
  const { formatAmount } = useFormattedCurrency();
  const { totalMonthlyIncome, isLoading: incomesLoading } = useIncomes();
  const { budgets, isLoading: budgetsLoading } = useBudgets();
  const { debts, isLoading: debtsLoading } = useDebts();
  const { transactions: expenses, isLoading: expensesLoading } = useExpenses();

  const isLoading = incomesLoading || budgetsLoading || debtsLoading || expensesLoading;

  const forecastData = useMemo(() => {
    const months: ForecastMonth[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    let cumulativeLiquidity = 0;

    // Use real data from hooks
    const monthlyIncome = totalMonthlyIncome || 0;

    // Calculate average monthly expenses from actual transactions (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentExpenses = expenses.filter(e => new Date(e.transaction_date) >= sixMonthsAgo);
    const actualExpensesTotal = recentExpenses.reduce((total, e) => total + e.amount, 0);
    const monthsWithData = Math.min(6, Math.ceil((Date.now() - sixMonthsAgo.getTime()) / (30 * 24 * 60 * 60 * 1000)));
    const avgMonthlyExpenses = monthsWithData > 0 ? actualExpensesTotal / monthsWithData : 0;
    
    // Fallback to budget if no expense data
    const monthlyExpenses = avgMonthlyExpenses > 0 
      ? avgMonthlyExpenses 
      : budgets.reduce((total, budget) => total + budget.allocated_amount, 0);

    const monthlyDebtPayments = debts.reduce((total, debt) => {
      return total + (debt.minimum_payment || 0);
    }, 0);

    // Only generate forecast if we have data
    if (monthlyIncome === 0 && monthlyExpenses === 0 && monthlyDebtPayments === 0) {
      return [];
    }

    for (let i = 0; i < 12; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(currentDate.getMonth() + i);
      
      const monthName = monthNames[forecastDate.getMonth()];
      const year = forecastDate.getFullYear().toString().slice(-2);
      
      const variance = 0.95 + Math.random() * 0.1;
      const incomeWithVariance = monthlyIncome * variance;
      const expensesWithVariance = monthlyExpenses * (1.1 - Math.random() * 0.2);
      
      const netCashFlow = incomeWithVariance - expensesWithVariance - monthlyDebtPayments;
      cumulativeLiquidity += netCashFlow;

      months.push({
        month: `${monthName} '${year}`,
        income: Math.round(incomeWithVariance),
        expenses: Math.round(expensesWithVariance),
        debtPayments: Math.round(monthlyDebtPayments),
        netCashFlow: Math.round(netCashFlow),
        cumulativeLiquidity: Math.round(cumulativeLiquidity),
      });
    }

    return months;
  }, [totalMonthlyIncome, budgets, debts, expenses]);

  const chartConfig = {
    income: { label: 'Income', color: 'hsl(var(--wealth-positive))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--wealth-negative))' },
    netCashFlow: { label: 'Net Cash Flow', color: 'hsl(var(--primary))' },
    cumulativeLiquidity: { label: 'Cumulative', color: 'hsl(var(--accent))' },
  };

  if (isLoading) {
    return (
      <Card className="wealth-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">12-Month Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (forecastData.length === 0) {
    return (
      <Card className="wealth-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">12-Month Cash Flow Forecast</CardTitle>
            <Link to="/income">
              <Button variant="outline" size="sm" className="gap-1">
                Add Data <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No Data Available</p>
            <p className="text-sm">Add income sources and budgets to see your cash flow forecast</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalNetCashFlow = forecastData.reduce((sum, m) => sum + m.netCashFlow, 0);
  const avgMonthlyCashFlow = Math.round(totalNetCashFlow / 12);
  const endingLiquidity = forecastData[forecastData.length - 1]?.cumulativeLiquidity || 0;
  const isPositiveTrend = totalNetCashFlow > 0;

  return (
    <Card className="wealth-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">12-Month Cash Flow Forecast</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${isPositiveTrend ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
              {isPositiveTrend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-mono">{formatAmount(Math.abs(avgMonthlyCashFlow))}/mo</span>
            </div>
            <Link to="/budget">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Monthly Income</p>
            <p className="text-sm font-mono font-semibold text-wealth-positive">
              {formatAmount(Math.round(forecastData.reduce((s, m) => s + m.income, 0) / 12))}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Monthly Outflow</p>
            <p className="text-sm font-mono font-semibold text-wealth-negative">
              {formatAmount(Math.round(forecastData.reduce((s, m) => s + m.expenses + m.debtPayments, 0) / 12))}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">12-Month Projection</p>
            <p className={`text-sm font-mono font-semibold ${endingLiquidity >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
              {formatAmount(endingLiquidity)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cashFlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  formatAmount(value),
                  chartConfig[name as keyof typeof chartConfig]?.label || name
                ]}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="cumulativeLiquidity"
                stroke="hsl(var(--accent))"
                fill="url(#cumulativeGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netCashFlow"
                stroke="hsl(var(--primary))"
                fill="url(#cashFlowGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Monthly Breakdown Table */}
        <div className="max-h-[150px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border">
                <th className="text-left py-1 text-muted-foreground font-medium">Month</th>
                <th className="text-right py-1 text-muted-foreground font-medium">Income</th>
                <th className="text-right py-1 text-muted-foreground font-medium">Expenses</th>
                <th className="text-right py-1 text-muted-foreground font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((month, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-1.5 font-medium">{month.month}</td>
                  <td className="text-right font-mono text-wealth-positive">{formatAmount(month.income)}</td>
                  <td className="text-right font-mono text-wealth-negative">{formatAmount(month.expenses)}</td>
                  <td className={`text-right font-mono font-semibold ${month.netCashFlow >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
                    {month.netCashFlow >= 0 ? '+' : ''}{formatAmount(month.netCashFlow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};