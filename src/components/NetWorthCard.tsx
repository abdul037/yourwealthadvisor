import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { Asset } from '@/lib/portfolioData';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface NetWorthCardProps {
  assets: Asset[];
}

export function NetWorthCard({ assets }: NetWorthCardProps) {
  const { formatAmount, displayCurrency, symbol } = useFormattedCurrency();
  
  const totalWealth = assets.reduce((sum, asset) => sum + asset.aedValue, 0);
  
  const cashAmount = assets
    .filter(a => a.isCash)
    .reduce((sum, asset) => sum + asset.aedValue, 0);
  
  const investedAmount = totalWealth - cashAmount;
  
  // Simulated change for demo
  const changePercent = 2.4;
  const isPositive = changePercent > 0;
  
  return (
    <div className="wealth-card relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="wealth-label mb-1">Total Net Worth</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono tracking-tight">
                {formatAmount(totalWealth)}
              </h2>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                isPositive ? 'bg-wealth-positive/20 text-wealth-positive' : 'bg-wealth-negative/20 text-wealth-negative'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(changePercent)}%
              </div>
            </div>
          </div>
          
          <Link to="/trends">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              <span className="hidden sm:inline">View Trends</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="wealth-label mb-1">Invested Assets</p>
            <p className="text-lg sm:text-xl font-bold font-mono">{formatAmount(investedAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((investedAmount / totalWealth) * 100).toFixed(1)}% of portfolio
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="wealth-label mb-1">Cash & Equivalents</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-wealth-positive">{formatAmount(cashAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((cashAmount / totalWealth) * 100).toFixed(1)}% of portfolio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
