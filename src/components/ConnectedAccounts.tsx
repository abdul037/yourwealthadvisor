import { useState } from 'react';
import { RefreshCw, Trash2, CreditCard, Wallet, PiggyBank, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BankAccount, simulateApiCall, DEMO_TRANSACTIONS, BankTransaction } from '@/lib/mockBankingData';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
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

interface ConnectedAccountsProps {
  accounts: BankAccount[];
  onRefresh: (accountId: string) => void;
  onRemove: (accountId: string) => void;
  onTransactionsImported: (transactions: BankTransaction[]) => void;
}

export function ConnectedAccounts({ 
  accounts, 
  onRefresh, 
  onRemove,
  onTransactionsImported 
}: ConnectedAccountsProps) {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);

  const getAccountIcon = (type: BankAccount['accountType']) => {
    switch (type) {
      case 'current':
        return <Wallet className="w-5 h-5" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const handleRefresh = async (accountId: string) => {
    setRefreshingId(accountId);
    
    // Simulate fetching new transactions
    await simulateApiCall(null, 2000);
    
    // Get transactions for this account
    const accountTransactions = DEMO_TRANSACTIONS.filter(t => t.accountId === accountId);
    onTransactionsImported(accountTransactions);
    
    onRefresh(accountId);
    setRefreshingId(null);
    
    toast({
      title: 'Transactions Synced',
      description: `${accountTransactions.length} transactions imported successfully.`,
    });
  };

  const handleRemoveClick = (accountId: string) => {
    setAccountToRemove(accountId);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    if (accountToRemove) {
      onRemove(accountToRemove);
      toast({
        title: 'Account Disconnected',
        description: 'Bank account has been unlinked.',
        variant: 'destructive',
      });
    }
    setRemoveDialogOpen(false);
    setAccountToRemove(null);
  };

  const formatBalance = (balance: number, currency: string) => {
    const absBalance = Math.abs(balance);
    const formatted = new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(absBalance);
    
    return balance < 0 ? `-${formatted}` : formatted;
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No bank accounts connected</p>
        <p className="text-sm">Connect your bank to automatically import transactions</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-2xl">
                {account.bankLogo}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{account.bankName}</p>
                  <span className="text-xs text-muted-foreground">{account.accountNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getAccountIcon(account.accountType)}
                  <span className="capitalize">{account.accountType.replace('_', ' ')}</span>
                  <span>•</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>
                    Synced {formatDistanceToNow(new Date(account.lastSynced), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`font-semibold ${account.balance < 0 ? 'text-red-500' : ''}`}>
                  {formatBalance(account.balance, account.currency)}
                </p>
                <p className="text-xs text-muted-foreground">{account.currency}</p>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRefresh(account.id)}
                  disabled={refreshingId === account.id}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshingId === account.id ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveClick(account.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Bank Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the bank connection. Previously imported transactions will remain, but no new transactions will be synced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive hover:bg-destructive/90">
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
