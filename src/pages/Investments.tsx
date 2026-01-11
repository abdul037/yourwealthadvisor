import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIncomes } from '@/hooks/useIncomes';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useAssets, Asset } from '@/hooks/useAssets';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { EditTransactionDialog } from '@/components/EditTransactionDialog';
import { EditAssetDialog } from '@/components/EditAssetDialog';
import { AddAssetDialog } from '@/components/AddAssetDialog';
import { 
  TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3, Pencil, Trash2, Plus,
  Banknote, Bitcoin, Gem, Building2, Car, Shield, Landmark, Coins
} from 'lucide-react';
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

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Cash': Banknote,
  'Stocks': TrendingUp,
  'Bonds': Landmark,
  'Crypto': Bitcoin,
  'Gold': Coins,
  'DigiGold': Coins,
  'Land Asset': Building2,
  'Car': Car,
  'Insurance': Shield,
  'PF': PiggyBank,
  'TokenRE': Building2,
};

const LIQUIDITY_LABELS: Record<string, string> = {
  'L1': 'Highly Liquid',
  'L2': 'Moderate',
  'L3': 'Illiquid',
  'NL': 'Locked',
};

const Investments = () => {
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const { transactions, isLoading: transactionsLoading, updateTransaction, deleteTransaction } = useTransactions();
  const { assets, isLoading: assetsLoading, totalNetWorth, deleteAsset } = useAssets();
  const { formatAmount } = useFormattedCurrency();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  
  const isLoading = incomesLoading || transactionsLoading || assetsLoading;
  
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
  
  const hasInvestments = assets.length > 0 || investmentIncomes.length > 0 || investmentTransactions.length > 0;

  // Group assets by category
  const assetsByCategory = assets.reduce((acc, asset) => {
    const category = asset.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  const handleSaveTransaction = async (id: string, updates: Partial<Transaction>) => {
    await updateTransaction.mutateAsync({ id, ...updates });
  };

  const handleDeleteTransaction = async () => {
    if (deletingTransaction) {
      await deleteTransaction.mutateAsync(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

  const handleDeleteAsset = async () => {
    if (deletingAsset) {
      await deleteAsset.mutateAsync(deletingAsset.id);
      setDeletingAsset(null);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <PageHeader 
            title="Investments"
            description="Track your investment portfolio and returns"
            breadcrumb={[{ label: 'Investments', path: '/investments' }]}
          />
          <AddAssetDialog 
            trigger={
              <Button className="gap-2" data-add-asset-trigger>
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            }
          />
        </div>
        
        {!hasInvestments ? (
          <EmptyState
            icon={BarChart3}
            title="No investments yet"
            description="Add your first asset to start tracking your investment portfolio."
            actionLabel="Add Your First Asset"
            onAction={() => {
              // Trigger the AddAssetDialog by clicking the hidden button
              const addButton = document.querySelector('[data-add-asset-trigger]') as HTMLButtonElement;
              addButton?.click();
            }}
          />
        ) : (
          <>
            {/* Investment Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Portfolio</p>
                      <p className="text-2xl font-bold font-mono text-primary">
                        {formatAmount(totalNetWorth)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                    <div className="p-3 rounded-full bg-muted">
                      <Wallet className="h-6 w-6 text-muted-foreground" />
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

            {/* Your Assets Section */}
            {assets.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gem className="h-5 w-5" />
                    Your Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(assetsByCategory).map(([category, categoryAssets]) => {
                      const CategoryIcon = CATEGORY_ICONS[category] || Wallet;
                      const categoryTotal = categoryAssets.reduce(
                        (sum, a) => sum + convertToAED(a.amount, a.currency),
                        0
                      );
                      
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-full bg-muted">
                                <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <h4 className="font-semibold">{category}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {categoryAssets.length} {categoryAssets.length === 1 ? 'asset' : 'assets'}
                              </Badge>
                            </div>
                            <p className="font-bold font-mono">
                              {formatAmount(categoryTotal)}
                            </p>
                          </div>
                          
                          <div className="space-y-2 ml-10">
                            {categoryAssets.map(asset => (
                              <div 
                                key={asset.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group hover:bg-muted transition-colors"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{asset.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {LIQUIDITY_LABELS[asset.liquidity_level || 'L2']}
                                    </Badge>
                                    {asset.appreciation_rate && (
                                      <span className={asset.appreciation_rate >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}>
                                        {asset.appreciation_rate > 0 ? '+' : ''}{asset.appreciation_rate}% p.a.
                                      </span>
                                    )}
                                    {asset.purchase_date && (
                                      <span>
                                        Purchased {format(new Date(asset.purchase_date), 'MMM yyyy')}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <p className="font-bold font-mono">
                                      {formatAmount(asset.amount, asset.currency)}
                                    </p>
                                    {asset.currency !== 'AED' && (
                                      <p className="text-xs text-muted-foreground">
                                        ≈ {formatAmount(convertToAED(asset.amount, asset.currency))}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => setEditingAsset(asset)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => setDeletingAsset(asset)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            
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

      {/* Edit Asset Dialog */}
      <EditAssetDialog
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
        asset={editingAsset}
      />

      {/* Delete Transaction Confirmation Dialog */}
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

      {/* Delete Asset Confirmation Dialog */}
      <AlertDialog open={!!deletingAsset} onOpenChange={(open) => !open && setDeletingAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAsset?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAsset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Investments;
