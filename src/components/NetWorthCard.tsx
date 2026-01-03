import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Asset, formatCurrency, Currency } from '@/lib/portfolioData';
import { useState } from 'react';

interface NetWorthCardProps {
  assets: Asset[];
}

export function NetWorthCard({ assets }: NetWorthCardProps) {
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('AED');
  
  const totalWealth = assets.reduce((sum, asset) => {
    switch (displayCurrency) {
      case 'USD': return sum + asset.usdValue;
      case 'INR': return sum + asset.inrValue;
      default: return sum + asset.aedValue;
    }
  }, 0);
  
  const cashAmount = assets
    .filter(a => a.isCash)
    .reduce((sum, asset) => {
      switch (displayCurrency) {
        case 'USD': return sum + asset.usdValue;
        case 'INR': return sum + asset.inrValue;
        default: return sum + asset.aedValue;
      }
    }, 0);
  
  const investedAmount = totalWealth - cashAmount;
  
  // Simulated change for demo
  const changePercent = 2.4;
  const isPositive = changePercent > 0;
  
  const currencies: Currency[] = ['AED', 'USD', 'INR'];
  
  return (
    <div className="wealth-card relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="wealth-label mb-1">Total Net Worth</p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl md:text-5xl font-bold font-mono tracking-tight">
                {formatCurrency(totalWealth, displayCurrency)}
              </h2>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                isPositive ? 'bg-wealth-positive/20 text-wealth-positive' : 'bg-wealth-negative/20 text-wealth-negative'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(changePercent)}%
              </div>
            </div>
          </div>
          
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {currencies.map(curr => (
              <button
                key={curr}
                onClick={() => setDisplayCurrency(curr)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  displayCurrency === curr 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="wealth-label mb-1">Invested Assets</p>
            <p className="text-xl font-bold font-mono">{formatCurrency(investedAmount, displayCurrency)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((investedAmount / totalWealth) * 100).toFixed(1)}% of portfolio
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <p className="wealth-label mb-1">Cash & Equivalents</p>
            <p className="text-xl font-bold font-mono text-wealth-positive">{formatCurrency(cashAmount, displayCurrency)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {((cashAmount / totalWealth) * 100).toFixed(1)}% of portfolio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
