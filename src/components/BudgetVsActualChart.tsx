import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Budget, Expense, getCategoryColor } from '@/lib/expenseData';
import { formatCurrency } from '@/lib/portfolioData';

interface BudgetVsActualChartProps {
  budgets: Budget[];
  expenses: Expense[];
}

export function BudgetVsActualChart({ budgets, expenses }: BudgetVsActualChartProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Calculate spending for current month per category
  const monthlySpending = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const data = budgets.map(budget => {
    const spent = monthlySpending[budget.category] || 0;
    const percentage = (spent / budget.limit) * 100;
    
    return {
      category: budget.category.length > 12 ? budget.category.slice(0, 12) + '...' : budget.category,
      fullCategory: budget.category,
      budget: budget.limit,
      spent,
      remaining: Math.max(budget.limit - spent, 0),
      overBudget: Math.max(spent - budget.limit, 0),
      percentage,
      color: getCategoryColor(budget.category),
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isOver = item.spent > item.budget;
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{item.fullCategory}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-mono">{formatCurrency(item.budget)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Spent:</span>
              <span className={`font-mono ${isOver ? 'text-destructive' : ''}`}>
                {formatCurrency(item.spent)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-1 mt-1">
              <span className="text-muted-foreground">{isOver ? 'Over:' : 'Left:'}</span>
              <span className={`font-mono font-medium ${isOver ? 'text-destructive' : 'text-wealth-positive'}`}>
                {formatCurrency(isOver ? item.overBudget : item.remaining)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Budget vs Actual Spending</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-muted-foreground">Spent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted" />
            <span className="text-muted-foreground">Budget</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <YAxis 
              type="category"
              dataKey="category"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="budget" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={20} />
            <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <rect
                  key={`bar-${index}`}
                  fill={entry.percentage >= 100 ? 'hsl(var(--destructive))' : entry.percentage >= 75 ? 'hsl(45, 93%, 50%)' : 'hsl(var(--primary))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
