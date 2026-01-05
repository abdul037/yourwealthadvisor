import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Transaction } from '@/lib/portfolioData';
import { format } from 'date-fns';
import { Period, filterByPeriod, getPeriodLabel } from '@/lib/periodUtils';
import { useMemo } from 'react';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface RecentTransactionsProps {
  transactions: Transaction[];
  period?: Period;
}

export function RecentTransactions({ transactions, period = 'ALL' }: RecentTransactionsProps) {
  const { formatAmount } = useFormattedCurrency();
  const filteredTransactions = useMemo(() => {
    const filtered = period === 'ALL' ? transactions : filterByPeriod(transactions, period);
    return [...filtered]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions, period]);
  
  const periodLabel = getPeriodLabel(period);
  
  const getIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'expense': return <ArrowDownLeft className="w-4 h-4" />;
      case 'income': return <ArrowUpRight className="w-4 h-4" />;
      case 'investment': return <TrendingUp className="w-4 h-4" />;
    }
  };
  
  const getColor = (type: Transaction['type']) => {
    switch (type) {
      case 'expense': return 'bg-destructive/20 text-destructive';
      case 'income': return 'bg-wealth-positive/20 text-wealth-positive';
      case 'investment': return 'bg-chart-2/20 text-chart-2';
    }
  };
  
  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          {period !== 'ALL' && (
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          )}
        </div>
        <button className="text-xs text-primary hover:underline">View all</button>
      </div>
      
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No transactions {period !== 'ALL' ? periodLabel : 'yet'}</p>
          <p className="text-xs mt-1">Add your first transaction above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColor(transaction.type)}`}>
                {getIcon(transaction.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{transaction.category}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {transaction.description || format(new Date(transaction.date), 'MMM d, yyyy')}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`text-sm font-mono font-medium ${
                  transaction.type === 'expense' ? 'text-destructive' : 
                  transaction.type === 'income' ? 'text-wealth-positive' : ''
                }`}>
                  {transaction.type === 'expense' ? '-' : transaction.type === 'income' ? '+' : ''}
                  {formatAmount(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
