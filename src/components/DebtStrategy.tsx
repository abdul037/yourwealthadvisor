import { useState } from 'react';
import { Snowflake, Flame, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Debt, getSnowballOrder, getAvalancheOrder, calculatePayoffProjection, calculateTotalInterest, getMonthsToPayoff, getDebtTypeInfo } from '@/lib/debtData';
import { formatCurrency } from '@/lib/portfolioData';

interface DebtStrategyProps {
  debts: Debt[];
}

export function DebtStrategy({ debts }: DebtStrategyProps) {
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  
  const orderedDebts = strategy === 'snowball' ? getSnowballOrder(debts) : getAvalancheOrder(debts);
  
  // Calculate total stats for each strategy
  const calculateStrategyStats = (orderedDebts: Debt[]) => {
    let totalInterest = 0;
    let maxMonths = 0;
    
    orderedDebts.forEach(debt => {
      const projection = calculatePayoffProjection(debt);
      totalInterest += calculateTotalInterest(projection);
      const months = getMonthsToPayoff(projection);
      if (months > maxMonths) maxMonths = months;
    });
    
    return { totalInterest, maxMonths };
  };
  
  const snowballStats = calculateStrategyStats(getSnowballOrder(debts));
  const avalancheStats = calculateStrategyStats(getAvalancheOrder(debts));

  return (
    <div className="wealth-card">
      <h3 className="font-semibold mb-4">Payoff Strategy</h3>
      
      {/* Strategy Selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setStrategy('avalanche')}
          className={`p-4 rounded-lg border-2 transition-colors text-left ${
            strategy === 'avalanche' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-muted-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className={`w-5 h-5 ${strategy === 'avalanche' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Avalanche</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Pay highest interest first. Saves the most money.
          </p>
          <div className="text-sm">
            <span className="text-muted-foreground">Interest: </span>
            <span className="font-mono text-destructive">{formatCurrency(avalancheStats.totalInterest)}</span>
          </div>
        </button>
        
        <button
          onClick={() => setStrategy('snowball')}
          className={`p-4 rounded-lg border-2 transition-colors text-left ${
            strategy === 'snowball' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-muted-foreground'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Snowflake className={`w-5 h-5 ${strategy === 'snowball' ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-medium">Snowball</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Pay smallest balance first. Quick wins for motivation.
          </p>
          <div className="text-sm">
            <span className="text-muted-foreground">Interest: </span>
            <span className="font-mono text-destructive">{formatCurrency(snowballStats.totalInterest)}</span>
          </div>
        </button>
      </div>
      
      {/* Recommended Order */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground mb-3">
          {strategy === 'avalanche' 
            ? 'Attack highest interest debts first to minimize total interest paid:'
            : 'Pay off smallest balances first for quick wins:'}
        </p>
        
        {orderedDebts.map((debt, index) => {
          const typeInfo = getDebtTypeInfo(debt.type);
          const isFirst = index === 0;
          
          return (
            <div 
              key={debt.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isFirst ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isFirst ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className={`font-medium text-sm ${isFirst ? '' : 'text-muted-foreground'}`}>
                    {debt.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {strategy === 'avalanche' 
                      ? `${debt.interestRate}% APR`
                      : formatCurrency(debt.currentBalance, debt.currency)}
                  </p>
                </div>
              </div>
              
              {isFirst ? (
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <ArrowRight className="w-4 h-4" />
                  Focus Here
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {strategy === 'avalanche' 
                    ? formatCurrency(debt.currentBalance, debt.currency)
                    : `${debt.interestRate}% APR`}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Savings Comparison */}
      {avalancheStats.totalInterest < snowballStats.totalInterest && (
        <div className="mt-4 p-3 rounded-lg bg-wealth-positive/10 border border-wealth-positive/30">
          <div className="flex items-center gap-2 text-wealth-positive text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>
              Avalanche saves {formatCurrency(snowballStats.totalInterest - avalancheStats.totalInterest)} in interest
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
