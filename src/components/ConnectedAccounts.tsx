import { useState } from 'react';
import { RefreshCw, Trash2, CreditCard, Wallet, PiggyBank, AlertCircle, CheckCircle, TrendingUp, Coins, Zap, Building, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { EditBalanceDialog } from '@/components/EditBalanceDialog';
import { useLinkedAccounts, LinkedAccount } from '@/hooks/useLinkedAccounts';

export function ConnectedAccounts() {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<LinkedAccount | null>(null);

  const { 
    accounts, 
    isLoading, 
    refreshAccount, 
    deleteAccount, 
    updateAccount 
  } = useLinkedAccounts();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'current':
        return <Wallet className="w-5 h-5" />;
      case 'savings':
        return <PiggyBank className="w-5 h-5" />;
      case 'credit_card':
        return <CreditCard className="w-5 h-5" />;
      case 'investment':
        return <TrendingUp className="w-5 h-5" />;
      case 'crypto':
        return <Coins className="w-5 h-5" />;
      case 'utility':
        return <Zap className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'current':
        return 'Current Account';
      case 'savings':
        return 'Savings Account';
      case 'credit_card':
        return 'Credit Card';
      case 'investment':
        return 'Investment Portfolio';
      case 'crypto':
        return 'Crypto Wallet';
      case 'utility':
        return 'Utility Account';
      default:
        return type;
    }
  };

  const handleRefresh = async (accountId: string) => {
    await refreshAccount.mutateAsync(accountId);
  };

  const handleRemoveClick = (accountId: string) => {
    setAccountToRemove(accountId);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (accountToRemove) {
      await deleteAccount.mutateAsync(accountToRemove);
    }
    setRemoveDialogOpen(false);
    setAccountToRemove(null);
  };

  const handleEditClick = (account: LinkedAccount) => {
    setAccountToEdit(account);
    setEditDialogOpen(true);
  };

  const handleSaveBalance = async (id: string, newBalance: number) => {
    await updateAccount.mutateAsync({ id, opening_balance: newBalance });
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

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin opacity-50" />
        <p className="text-sm">Loading accounts...</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No accounts connected</p>
        <p className="text-sm">Connect banks, investments, or utilities to sync data</p>
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
                {account.platform_logo || '🏦'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{account.platform_name}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{account.account_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getAccountIcon(account.account_type)}
                  <span>{getAccountTypeLabel(account.account_type)}</span>
                  <span>•</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="truncate">
                    {account.last_synced 
                      ? `Synced ${formatDistanceToNow(new Date(account.last_synced), { addSuffix: true })}`
                      : 'Just connected'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`font-semibold ${account.opening_balance < 0 ? 'text-destructive' : ''}`}>
                  {formatBalance(account.opening_balance, account.currency)}
                </p>
                <p className="text-xs text-muted-foreground">Opening Balance</p>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(account)}
                  title="Edit opening balance"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRefresh(account.id)}
                  disabled={refreshAccount.isPending}
                  title="Sync account"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshAccount.isPending ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleRemoveClick(account.id)}
                  title="Disconnect account"
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

      <EditBalanceDialog
        account={accountToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveBalance}
      />
    </>
  );
}
