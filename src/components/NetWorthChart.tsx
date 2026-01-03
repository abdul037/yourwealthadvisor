import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';
import { NetWorthSnapshot, Milestone } from '@/lib/categoryData';
import { formatCurrency } from '@/lib/portfolioData';

interface NetWorthChartProps {
  history: NetWorthSnapshot[];
  projections: NetWorthSnapshot[];
  milestones: Milestone[];
}

export function NetWorthChart({ history, projections, milestones }: NetWorthChartProps) {
  // Combine history and projections
  const historicalData = history.map(h => ({
    ...h,
    month: new Date(h.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    type: 'historical',
  }));
  
  const projectionData = projections.slice(0, 12).map(p => ({
    ...p,
    month: new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    type: 'projection',
    projectedNetWorth: p.netWorth,
    netWorth: undefined,
  }));
  
  // Add last historical point to projections for continuity
  if (historicalData.length > 0 && projectionData.length > 0) {
    projectionData[0].projectedNetWorth = historicalData[historicalData.length - 1].netWorth;
  }
  
  const combinedData = [...historicalData, ...projectionData];
  
  // Find milestones that fall within chart range
  const upcomingMilestones = milestones.filter(m => !m.achieved && m.targetDate);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProjection = data.type === 'projection';
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {isProjection ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Projected:</span>
              <span className="font-mono font-medium">{formatCurrency(data.projectedNetWorth)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Net Worth:</span>
              <span className="font-mono font-medium">{formatCurrency(data.netWorth)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Net Worth Trend</h3>
            <p className="text-sm text-muted-foreground">12-month history + 12-month projection</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Projected</span>
          </div>
        </div>
      </div>
      
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(280, 65%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(280, 65%, 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              interval={1}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Milestone reference lines */}
            {upcomingMilestones.slice(0, 2).map((milestone, index) => (
              <ReferenceLine 
                key={milestone.id}
                y={milestone.targetAmount} 
                stroke={index === 0 ? 'hsl(45, 93%, 50%)' : 'hsl(38, 92%, 50%)'}
                strokeDasharray="5 5"
                label={{ 
                  value: milestone.name, 
                  position: 'right',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10,
                }}
              />
            ))}
            
            <Area 
              type="monotone" 
              dataKey="netWorth" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#netWorthGradient)" 
              connectNulls={false}
            />
            <Area 
              type="monotone" 
              dataKey="projectedNetWorth" 
              stroke="hsl(280, 65%, 60%)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#projectionGradient)" 
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
