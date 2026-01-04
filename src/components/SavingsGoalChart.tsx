import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavingsGoal } from '@/hooks/useSavingsGoals';
import { formatCurrency } from '@/lib/portfolioData';

interface SavingsGoalChartProps {
  goals: SavingsGoal[];
}

const COLORS = [
  'hsl(221, 83%, 53%)', // blue
  'hsl(142, 76%, 36%)', // green
  'hsl(45, 93%, 47%)',  // yellow
  'hsl(262, 83%, 58%)', // purple
  'hsl(25, 95%, 53%)',  // orange
  'hsl(339, 90%, 51%)', // pink
  'hsl(199, 89%, 48%)', // cyan
  'hsl(0, 84%, 60%)',   // red
];

export function SavingsGoalChart({ goals }: SavingsGoalChartProps) {
  const activeGoals = goals.filter(g => !g.is_achieved);

  const barChartData = useMemo(() => {
    return activeGoals.map(goal => ({
      name: goal.name.length > 15 ? goal.name.substring(0, 15) + '...' : goal.name,
      fullName: goal.name,
      saved: goal.current_amount,
      remaining: Math.max(goal.target_amount - goal.current_amount, 0),
      target: goal.target_amount,
      progress: (goal.current_amount / goal.target_amount) * 100,
    }));
  }, [activeGoals]);

  const pieChartData = useMemo(() => {
    return activeGoals.map((goal, index) => ({
      name: goal.name,
      value: goal.target_amount,
      saved: goal.current_amount,
      color: COLORS[index % COLORS.length],
    }));
  }, [activeGoals]);

  const categoryData = useMemo(() => {
    const categories: Record<string, { saved: number; target: number }> = {};
    goals.forEach(goal => {
      const cat = goal.category || 'Uncategorized';
      if (!categories[cat]) {
        categories[cat] = { saved: 0, target: 0 };
      }
      categories[cat].saved += goal.current_amount;
      categories[cat].target += goal.target_amount;
    });
    return Object.entries(categories).map(([name, data], index) => ({
      name,
      saved: data.saved,
      target: data.target,
      color: COLORS[index % COLORS.length],
    }));
  }, [goals]);

  if (goals.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.fullName || data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Saved:</span>
              <span className="font-mono text-wealth-positive">{formatCurrency(data.saved)}</span>
            </div>
            {data.remaining !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-mono">{formatCurrency(data.remaining)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Target:</span>
              <span className="font-mono">{formatCurrency(data.target)}</span>
            </div>
            {data.progress !== undefined && (
              <div className="flex justify-between gap-4 pt-1 border-t border-border">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-semibold">{data.progress.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Target:</span>
              <span className="font-mono">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Saved:</span>
              <span className="font-mono text-wealth-positive">{formatCurrency(data.saved)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="font-semibold text-lg mb-4">Goal Visualization</h3>
      
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          {barChartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active goals to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="saved" stackId="a" fill="hsl(142, 76%, 36%)" name="Saved" radius={[0, 0, 0, 0]} />
                <Bar dataKey="remaining" stackId="a" fill="hsl(var(--muted))" name="Remaining" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="distribution">
          {pieChartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active goals to display
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name.substring(0, 10)}${name.length > 10 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="saved" fill="hsl(142, 76%, 36%)" name="Saved" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                ))}
              </Bar>
              <Bar dataKey="target" fill="hsl(var(--muted))" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}
