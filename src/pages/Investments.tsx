import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncomes } from '@/hooks/useIncomes';
import { useTransactions } from '@/hooks/useTransactions';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const Investments = () => {
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { formatAmount } = useFormattedCurrency();
  
  const isLoading = incomesLoading || transactionsLoading;
  
  // Filter investment-related income sources
  const investmentIncomes = incomes.filter(
    i => i.source_type?.toLowerCase() === 'investment' || 
         i.source_type?.toLowerCase() === 'dividend'
  );
  
  // Filter investment-related transactions
  const investmentTransactions = transactions.filter(
    t => t.category?.toLowerCase() === 'investment' ||
         t.category?.toLowerCase() === 'investments' ||
         t.description?.toLowerCase().includes('invest') ||
         t.description?.toLowerCase().includes('dividend') ||
         t.description?.toLowerCase().includes('stock') ||
         t.description?.toLowerCase().includes('etf') ||
         t.description?.toLowerCase().includes('mutual fund')
  );
  
  // Calculate totals
  const totalInvestmentIncome = investmentIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalInvestmentExpenses = investmentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDividends = investmentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const hasInvestments = investmentIncomes.length > 0 || investmentTransactions.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <PageHeader 
            title="Investments"
            description="Track your investment portfolio and returns"
            breadcrumb={[{ label: 'Investments', path: '/investments' }]}
          />
          <DashboardSkeleton variant="full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        <PageHeader 
          title="Investments"
          description="Track your investment portfolio and returns"
          breadcrumb={[{ label: 'Investments', path: '/investments' }]}
        />
        
        {!hasInvestments ? (
          <EmptyState
            icon={BarChart3}
            title="No investments yet"
            description="Add investments using Quick Add or connect your investment accounts to see your portfolio here."
            actionLabel="Go to Dashboard"
            onAction={() => window.location.href = '/'}
          />
        ) : (
          <>
            {/* Investment Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Income</p>
                      <p className="text-2xl font-bold font-mono text-wealth-positive">
                        {formatAmount(totalInvestmentIncome + totalDividends)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-wealth-positive/10">
                      <TrendingUp className="h-6 w-6 text-wealth-positive" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Invested (Purchases)</p>
                      <p className="text-2xl font-bold font-mono">
                        {formatAmount(totalInvestmentExpenses)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-primary/10">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Net Return</p>
                      <p className={`text-2xl font-bold font-mono ${
                        (totalInvestmentIncome + totalDividends - totalInvestmentExpenses) >= 0 
                          ? 'text-wealth-positive' 
                          : 'text-wealth-negative'
                      }`}>
                        {formatAmount(totalInvestmentIncome + totalDividends - totalInvestmentExpenses)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-muted">
                      <PiggyBank className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Investment Income Sources */}
            {investmentIncomes.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Recurring Investment Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investmentIncomes.map(income => (
                      <div 
                        key={income.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{income.source_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {income.frequency} • {income.source_type}
                          </p>
                        </div>
                        <p className="font-bold font-mono text-wealth-positive">
                          +{formatAmount(income.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Investment Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {investmentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No investment transactions found. Use Quick Add to log investment purchases or returns.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {investmentTransactions
                      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                      .map(transaction => (
                        <div 
                          key={transaction.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'income' 
                                ? 'bg-wealth-positive/10' 
                                : 'bg-wealth-negative/10'
                            }`}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-4 w-4 text-wealth-positive" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-wealth-negative" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description || transaction.category}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(transaction.transaction_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold font-mono ${
                              transaction.type === 'income' 
                                ? 'text-wealth-positive' 
                                : 'text-wealth-negative'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {transaction.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Investment Tracking
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Investments;
