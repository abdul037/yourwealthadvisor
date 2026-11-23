import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BankConnection } from '@/components/BankConnection';
import { ConnectedAccounts } from '@/components/ConnectedAccounts';
import { ImportedTransactions } from '@/components/ImportedTransactions';
import { BankAccount, BankTransaction, DEMO_TRANSACTIONS } from '@/lib/mockBankingData';

/**
 * Settings → Banking. DEMO ONLY: the connection is simulated and the "imported"
 * transactions are generated. Rendered only when DEMO_FLOWS is on.
 */
export function BankingSettings() {
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([]);
  const [importedTransactions, setImportedTransactions] = useState<BankTransaction[]>([]);

  const handleBankConnectionSuccess = (accounts: BankAccount[]) => {
    setConnectedAccounts(prev => [...prev, ...accounts]);
    // Import transactions for the connected accounts
    const newTransactions = DEMO_TRANSACTIONS.filter(t =>
      accounts.some(acc => acc.id === t.accountId || acc.id.includes('acc-'))
    );
    setImportedTransactions(prev => [...prev, ...newTransactions]);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connected Banks */}
        <div className="wealth-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Connected Bank Accounts</h3>
              <p className="text-sm text-muted-foreground">
                Link your bank for automatic transaction imports
              </p>
            </div>
            <BankConnection
              onConnectionSuccess={handleBankConnectionSuccess}
              connectedAccounts={connectedAccounts}
            />
          </div>
          <ConnectedAccounts />
        </div>

        {/* Imported Transactions */}
        <div className="wealth-card">
          <div className="mb-4">
            <h3 className="font-semibold">Imported Transactions</h3>
            <p className="text-sm text-muted-foreground">
              Transactions synced from your connected banks
            </p>
          </div>
          <ImportedTransactions transactions={importedTransactions} />
        </div>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <Building2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Demo Mode Active:</strong> This is a simulated Open Banking integration.
          Connect any bank and use any 6-digit OTP to test the flow. Real Lean Technologies
          integration requires API credentials.
        </AlertDescription>
      </Alert>
    </>
  );
}
