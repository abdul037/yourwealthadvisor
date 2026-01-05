import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { IncomeSource, getIncomeByType, INCOME_TYPES } from '@/lib/incomeData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface IncomeBreakdownProps {
  incomeSources: IncomeSource[];
  month: number;
  year: number;
}

export function IncomeBreakdown({ incomeSources, month, year }: IncomeBreakdownProps) {
  const { formatAmount } = useFormattedCurrency();
  const incomeByType = getIncomeByType(incomeSources, month, year);
  
  const data = Object.entries(incomeByType)
    .map(([name, value]) => ({
      name,
      value,
      color: INCOME_TYPES.find(t => t.label === name)?.color || 'hsl(215, 20%, 55%)',
    }))
    .sort((a, b) => b.value - a.value);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className="text-muted-foreground text-sm">
            {formatAmount(item.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="wealth-card">
      <h3 className="font-semibold mb-4">Income by Type</h3>
      <div className="h-[280px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No income data for this month
          </div>
        )}
      </div>
    </div>
  );
}
