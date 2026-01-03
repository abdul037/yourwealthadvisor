import { Asset, LiquidityLevel, LIQUIDITY_LABELS, formatCurrency } from '@/lib/portfolioData';

interface LiquidityBreakdownProps {
  assets: Asset[];
}

const LIQUIDITY_COLORS: Record<LiquidityLevel, string> = {
  'L1': 'bg-wealth-positive',
  'L2': 'bg-chart-2',
  'L3': 'bg-accent',
  'NL': 'bg-muted-foreground',
};

export function LiquidityBreakdown({ assets }: LiquidityBreakdownProps) {
  const liquidityTotals = assets.reduce((acc, asset) => {
    acc[asset.liquidityLevel] = (acc[asset.liquidityLevel] || 0) + asset.aedValue;
    return acc;
  }, {} as Record<LiquidityLevel, number>);
  
  const total = Object.values(liquidityTotals).reduce((sum, val) => sum + val, 0);
  
  const levels: LiquidityLevel[] = ['L1', 'L2', 'L3', 'NL'];
  
  return (
    <div className="wealth-card">
      <h3 className="text-lg font-semibold mb-4">Liquidity Analysis</h3>
      
      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex mb-6">
        {levels.map(level => {
          const value = liquidityTotals[level] || 0;
          const percentage = (value / total) * 100;
          if (percentage === 0) return null;
          return (
            <div
              key={level}
              className={`${LIQUIDITY_COLORS[level]} transition-all`}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>
      
      <div className="space-y-3">
        {levels.map(level => {
          const value = liquidityTotals[level] || 0;
          const percentage = ((value / total) * 100).toFixed(1);
          return (
            <div key={level} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${LIQUIDITY_COLORS[level]}`} />
                <div>
                  <p className="text-sm font-medium">{level}</p>
                  <p className="text-xs text-muted-foreground">{LIQUIDITY_LABELS[level]}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-medium">{formatCurrency(value)}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
