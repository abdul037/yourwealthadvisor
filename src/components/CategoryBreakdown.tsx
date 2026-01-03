import { Expense, EXPENSE_CATEGORIES, getCategoryColor, getSpendingByCategory } from '@/lib/expenseData';
import { formatCurrency } from '@/lib/portfolioData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { UtensilsCrossed, Car, Zap, Gamepad2, ShoppingBag, Heart, GraduationCap, CreditCard, MoreHorizontal } from 'lucide-react';

interface CategoryBreakdownProps {
  expenses: Expense[];
  month?: number;
  year?: number;
}

const ICONS: Record<string, React.ReactNode> = {
  'Food & Dining': <UtensilsCrossed className="w-4 h-4" />,
  'Transport': <Car className="w-4 h-4" />,
  'Utilities': <Zap className="w-4 h-4" />,
  'Entertainment': <Gamepad2 className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Healthcare': <Heart className="w-4 h-4" />,
  'Education': <GraduationCap className="w-4 h-4" />,
  'Subscriptions': <CreditCard className="w-4 h-4" />,
  'Other': <MoreHorizontal className="w-4 h-4" />,
};

export function CategoryBreakdown({ expenses, month, year }: CategoryBreakdownProps) {
  const spending = getSpendingByCategory(expenses, month, year);
  const total = Object.values(spending).reduce((sum, val) => sum + val, 0);
  
  const chartData = Object.entries(spending)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category),
      percentage: ((amount / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-muted-foreground text-xs">
            AED {data.value.toLocaleString()} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-card">
      <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category List */}
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {chartData.map(item => (
            <div 
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {ICONS[item.name]}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
              <p className="text-sm font-mono">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Spending</span>
          <span className="text-lg font-bold font-mono">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
