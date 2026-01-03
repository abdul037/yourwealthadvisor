import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Asset, AssetCategory, CATEGORY_COLORS } from '@/lib/portfolioData';

interface AllocationChartProps {
  assets: Asset[];
}

const CHART_COLORS = [
  'hsl(38, 92%, 50%)',     // Land Asset - Gold
  'hsl(217, 91%, 60%)',    // Stocks - Blue
  'hsl(142, 71%, 45%)',    // Cash - Green
  'hsl(200, 70%, 50%)',    // Car - Cyan
  'hsl(280, 65%, 60%)',    // Bonds - Purple
  'hsl(173, 80%, 40%)',    // TokenRE - Teal
  'hsl(45, 93%, 50%)',     // Gold - Yellow
  'hsl(340, 75%, 55%)',    // Insurance - Pink
  'hsl(262, 83%, 58%)',    // PF - Violet
  'hsl(32, 95%, 55%)',     // Crypto - Orange
  'hsl(50, 90%, 45%)',     // DigiGold
];

export function AllocationChart({ assets }: AllocationChartProps) {
  const categoryTotals = assets.reduce((acc, asset) => {
    const existing = acc.find(item => item.category === asset.category);
    if (existing) {
      existing.value += asset.aedValue;
    } else {
      acc.push({ category: asset.category, value: asset.aedValue });
    }
    return acc;
  }, [] as { category: AssetCategory; value: number }[]);
  
  const totalValue = categoryTotals.reduce((sum, item) => sum + item.value, 0);
  
  const chartData = categoryTotals
    .map((item, index) => ({
      name: item.category,
      value: item.value,
      percentage: ((item.value / totalValue) * 100).toFixed(1),
      color: CHART_COLORS[index % CHART_COLORS.length],
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
    <div className="wealth-card h-full">
      <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
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
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground truncate">{item.name}</span>
            <span className="text-xs font-medium ml-auto">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
