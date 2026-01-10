import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIncomes } from '@/hooks/useIncomes';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { EditTransactionDialog } from '@/components/EditTransactionDialog';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { convertToAED } from '@/lib/currencyUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Investments = () => {
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const { transactions, isLoading: transactionsLoading, updateTransaction, deleteTransaction } = useTransactions();
  const { formatAmount } = useFormattedCurrency();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  
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
  
  // Calculate totals with currency conversion
  const totalInvestmentIncome = investmentIncomes.reduce((sum, i) => {
    return sum + convertToAED(i.amount, i.currency || 'AED');
  }, 0);
  const totalInvestmentExpenses = investmentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);
  const totalDividends = investmentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);
  
  const hasInvestments = investmentIncomes.length > 0 || investmentTransactions.length > 0;

  const handleSaveTransaction = async (id: string, updates: Partial<Transaction>) => {
    await updateTransaction.mutateAsync({ id, ...updates });
  };

  const handleDeleteTransaction = async () => {
    if (deletingTransaction) {
      await deleteTransaction.mutateAsync(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

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
                          +{formatAmount(income.amount, income.currency || 'AED')}
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
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
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
                                {transaction.currency && transaction.currency !== 'AED' && (
                                  <span className="ml-2 text-xs">({transaction.currency})</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className={`font-bold font-mono ${
                                transaction.type === 'income' 
                                  ? 'text-wealth-positive' 
                                  : 'text-wealth-negative'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency || 'AED')}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.type}
                              </Badge>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingTransaction(transaction)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeletingTransaction(transaction)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
        transaction={editingTransaction}
        onSave={handleSaveTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Investments;
