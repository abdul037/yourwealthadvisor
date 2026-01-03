import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Expense, EXPENSE_CATEGORIES, getCategoryColor } from '@/lib/expenseData';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface SpendingChartProps {
  expenses: Expense[];
}

export function SpendingChart({ expenses }: SpendingChartProps) {
  // Get last 6 months of data
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      date,
      label: format(date, 'MMM'),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });
  
  const topCategories = ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Entertainment'];
  
  const chartData = months.map(month => {
    const monthExpenses = expenses.filter(e => 
      isWithinInterval(new Date(e.date), { start: month.start, end: month.end })
    );
    
    const data: Record<string, any> = { name: month.label };
    
    topCategories.forEach(cat => {
      data[cat] = monthExpenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0);
    });
    
    data.total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return data;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-mono">AED {entry.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between text-xs font-medium">
            <span>Total</span>
            <span className="font-mono">AED {total.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-card">
      <h3 className="text-lg font-semibold mb-4">Spending Over Time</h3>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
            {topCategories.map((cat) => (
              <Bar 
                key={cat}
                dataKey={cat}
                stackId="spending"
                fill={getCategoryColor(cat)}
                radius={[0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {topCategories.map(cat => (
          <div key={cat} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: getCategoryColor(cat) }}
            />
            <span className="text-xs text-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
