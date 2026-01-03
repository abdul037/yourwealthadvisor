import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { IncomeSource, getIncomeByType, INCOME_TYPES } from '@/lib/incomeData';

interface IncomeSourcesChartProps {
  incomeSources: IncomeSource[];
  selectedSources: string[];
  onToggleSource: (source: string) => void;
}

export function IncomeSourcesChart({ incomeSources, selectedSources, onToggleSource }: IncomeSourcesChartProps) {
  const allIncome = getIncomeByType(incomeSources);
  
  const data = Object.entries(allIncome)
    .map(([name, value]) => ({
      name,
      value,
      color: INCOME_TYPES.find(t => t.label === name)?.color || 'hsl(215, 20%, 55%)',
      selected: selectedSources.includes(name),
    }))
    .sort((a, b) => b.value - a.value);
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const selectedTotal = data.filter(d => d.selected).reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.name}</p>
          <p className="text-muted-foreground text-sm">
            AED {item.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Income Sources</h3>
        <p className="text-sm text-muted-foreground">
          Selected: AED {selectedTotal.toLocaleString()}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={entry.selected ? 1 : 0.3}
                    cursor="pointer"
                    onClick={() => onToggleSource(entry.name)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Click to include in projections
          </p>
          {data.map((item, index) => (
            <button
              key={index}
              onClick={() => onToggleSource(item.name)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                item.selected 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-muted/50 border border-transparent hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color, opacity: item.selected ? 1 : 0.3 }}
                />
                <span className="text-sm">{item.name}</span>
              </div>
              <span className="text-sm font-mono">
                AED {item.value.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
