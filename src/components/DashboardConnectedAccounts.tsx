import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  RefreshCw, CheckCircle, Link2, Wallet, PiggyBank, 
  CreditCard, TrendingUp, Coins, Zap, Building, 
  ExternalLink, Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BankAccount, simulateApiCall, DEMO_TRANSACTIONS, BankTransaction } from '@/lib/mockBankingData';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { BankConnection } from '@/components/BankConnection';
import { convertToAED } from '@/lib/currencyUtils';

interface DashboardConnectedAccountsProps {
  accounts: BankAccount[];
  onAccountsConnected: (accounts: BankAccount[]) => void;
  onTransactionsImported?: (transactions: BankTransaction[]) => void;
}

export function DashboardConnectedAccounts({ 
  accounts, 
  onAccountsConnected,
  onTransactionsImported 
}: DashboardConnectedAccountsProps) {
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const { formatAmount } = useFormattedCurrency();

  const getAccountIcon = (type: BankAccount['accountType']) => {
    switch (type) {
      case 'current':
        return <Wallet className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4" />;
      case 'crypto':
        return <Coins className="w-4 h-4" />;
      case 'utility':
        return <Zap className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const handleRefreshAll = async () => {
    setRefreshingId('all');
    await simulateApiCall(null, 2000);
    
    // Import transactions for all accounts
    if (onTransactionsImported) {
      const allTransactions = accounts.flatMap(acc => 
        DEMO_TRANSACTIONS.filter(t => t.accountId === acc.id)
      );
      onTransactionsImported(allTransactions);
    }
    
    setRefreshingId(null);
    toast({
      title: 'All Accounts Synced',
      description: 'Latest transactions imported successfully.',
    });
  };

  const handleRemove = (accountId: string) => {
    const updated = accounts.filter(a => a.id !== accountId);
    // We don't have direct remove callback, so just show toast
    toast({
      title: 'Account Disconnected',
      description: 'To reconnect, use the Admin Portal.',
    });
  };

  // Calculate total balance using centralized currency conversion
  const totalBalance = accounts.reduce((sum, acc) => {
    // Skip negative utility balances for total
    if (acc.accountType === 'utility' && acc.balance < 0) {
      return sum;
    }
    // Use centralized currency conversion
    return sum + convertToAED(acc.balance, acc.currency);
  }, 0);

  // Group accounts by type
  const bankAccounts = accounts.filter(a => ['current', 'savings', 'credit_card'].includes(a.accountType));
  const investmentAccounts = accounts.filter(a => a.accountType === 'investment');
  const cryptoAccounts = accounts.filter(a => a.accountType === 'crypto');
  const utilityAccounts = accounts.filter(a => a.accountType === 'utility');

  if (accounts.length === 0) {
    return (
      <div className="wealth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Connected Accounts</h3>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Link2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your banks, investments, and utilities for automatic tracking
          </p>
          <BankConnection 
            connectedAccounts={accounts}
            onConnectionSuccess={onAccountsConnected}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold">Connected Accounts</h3>
            <p className="text-xs text-muted-foreground">{accounts.length} account{accounts.length !== 1 ? 's' : ''} linked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefreshAll}
            disabled={refreshingId === 'all'}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshingId === 'all' ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Link to="/admin?tab=connections">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Total Balance */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-4">
        <p className="text-xs text-muted-foreground mb-1">Total Synced Balance</p>
        <p className="text-xl font-bold font-mono">{formatAmount(totalBalance)}</p>
      </div>

      {/* Account List - Compact */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {accounts.slice(0, 6).map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg flex-shrink-0">{account.bankLogo}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{account.bankName}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getAccountIcon(account.accountType)}
                  <span className="truncate">{account.accountNumber}</span>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-mono ${account.balance < 0 ? 'text-wealth-negative' : ''}`}>
                {account.currency === 'BTC' 
                  ? `${account.balance} BTC`
                  : formatAmount(Math.abs(account.balance))
                }
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                <CheckCircle className="w-3 h-3 text-wealth-positive" />
                <span>Synced</span>
              </div>
            </div>
          </div>
        ))}
        
        {accounts.length > 6 && (
          <Link to="/admin?tab=connections" className="block">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all {accounts.length} accounts
            </Button>
          </Link>
        )}
      </div>

      {/* Add More Button */}
      <div className="mt-4 pt-4 border-t border-border">
        <BankConnection 
          connectedAccounts={accounts}
          onConnectionSuccess={onAccountsConnected}
        />
      </div>
    </div>
  );
}