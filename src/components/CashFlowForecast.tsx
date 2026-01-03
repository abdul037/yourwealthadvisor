import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { sampleIncomeSources } from '@/lib/incomeData';
import { sampleBudgets } from '@/lib/expenseData';
import { sampleDebts } from '@/lib/debtData';

interface ForecastMonth {
  month: string;
  income: number;
  expenses: number;
  debtPayments: number;
  netCashFlow: number;
  cumulativeLiquidity: number;
}

const INR_TO_AED = 0.044;

export const CashFlowForecast = () => {
  const forecastData = useMemo(() => {
    const months: ForecastMonth[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    let cumulativeLiquidity = 0;

    // Calculate monthly income from all sources
    const monthlyIncome = sampleIncomeSources.reduce((total, source) => {
      let amount = source.amount;
      if (source.currency === 'INR') {
        amount *= INR_TO_AED;
      }
      
      // Convert to monthly if needed
      if (source.frequency === 'annual') {
        amount /= 12;
      } else if (source.frequency === 'quarterly') {
        amount /= 3;
      }
      
      return total + amount;
    }, 0);

    // Calculate monthly expenses from budgets
    const monthlyExpenses = sampleBudgets.reduce((total, budget) => {
      return total + budget.limit;
    }, 0);

    // Calculate monthly debt payments
    const monthlyDebtPayments = sampleDebts.reduce((total, debt) => {
      return total + debt.minimumPayment;
    }, 0);

    // Generate 12 months forecast
    for (let i = 0; i < 12; i++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(currentDate.getMonth() + i);
      
      const monthName = monthNames[forecastDate.getMonth()];
      const year = forecastDate.getFullYear().toString().slice(-2);
      
      // Add some variance for realism (±5%)
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
  }, []);

  const chartConfig = {
    income: { label: 'Income', color: 'hsl(var(--wealth-positive))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--wealth-negative))' },
    netCashFlow: { label: 'Net Cash Flow', color: 'hsl(var(--primary))' },
    cumulativeLiquidity: { label: 'Cumulative', color: 'hsl(var(--accent))' },
  };

  const totalNetCashFlow = forecastData.reduce((sum, m) => sum + m.netCashFlow, 0);
  const avgMonthlyCashFlow = Math.round(totalNetCashFlow / 12);
  const endingLiquidity = forecastData[forecastData.length - 1]?.cumulativeLiquidity || 0;
  const isPositiveTrend = totalNetCashFlow > 0;

  return (
    <Card className="wealth-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">12-Month Cash Flow Forecast</CardTitle>
          <div className={`flex items-center gap-1 text-sm ${isPositiveTrend ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
            {isPositiveTrend ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="font-mono">AED {Math.abs(avgMonthlyCashFlow).toLocaleString()}/mo</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Monthly Income</p>
            <p className="text-sm font-mono font-semibold text-wealth-positive">
              AED {Math.round(forecastData.reduce((s, m) => s + m.income, 0) / 12).toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Monthly Outflow</p>
            <p className="text-sm font-mono font-semibold text-wealth-negative">
              AED {Math.round(forecastData.reduce((s, m) => s + m.expenses + m.debtPayments, 0) / 12).toLocaleString()}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">12-Month Projection</p>
            <p className={`text-sm font-mono font-semibold ${endingLiquidity >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
              AED {endingLiquidity.toLocaleString()}
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
                  `AED ${value.toLocaleString()}`,
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
                <th className="text-right py-1 text-muted-foreground font-medium">Debt</th>
                <th className="text-right py-1 text-muted-foreground font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {forecastData.map((month, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-1.5 font-medium">{month.month}</td>
                  <td className="text-right font-mono text-wealth-positive">{month.income.toLocaleString()}</td>
                  <td className="text-right font-mono text-wealth-negative">{month.expenses.toLocaleString()}</td>
                  <td className="text-right font-mono text-muted-foreground">{month.debtPayments.toLocaleString()}</td>
                  <td className={`text-right font-mono font-semibold ${month.netCashFlow >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
                    {month.netCashFlow >= 0 ? '+' : ''}{month.netCashFlow.toLocaleString()}
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
