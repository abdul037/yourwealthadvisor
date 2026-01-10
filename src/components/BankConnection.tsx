import { useState } from 'react';
import { Building2, Link, Shield, CheckCircle2, Loader2, Smartphone, X, TrendingUp, Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DEMO_BANKS, 
  DEMO_INVESTMENT_PLATFORMS,
  DEMO_CRYPTO_PLATFORMS,
  DEMO_UTILITY_PLATFORMS,
  Bank, 
  simulateApiCall, 
  getDemoAccountsForPlatform,
  BankAccount 
} from '@/lib/mockBankingData';
import { toast } from '@/hooks/use-toast';
import { useLinkedAccounts, CreateLinkedAccountInput } from '@/hooks/useLinkedAccounts';

interface BankConnectionProps {
  onConnectionSuccess: (accounts: BankAccount[]) => void;
  connectedAccounts: BankAccount[];
}

type ConnectionStep = 'select-platform' | 'consent' | 'otp' | 'opening-balance' | 'success';

interface AccountBalance {
  accountNumber: string;
  accountType: string;
  balance: string;
}

export function BankConnection({ onConnectionSuccess, connectedAccounts }: BankConnectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('select-platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Bank | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingAccounts, setPendingAccounts] = useState<BankAccount[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);

  const { createAccount, accounts: linkedAccounts } = useLinkedAccounts();

  const handlePlatformSelect = (platform: Bank) => {
    setSelectedPlatform(platform);
    setStep('consent');
  };

  const handleConsent = async () => {
    setIsLoading(true);
    await simulateApiCall(null, 1000);
    setIsLoading(false);
    setStep('otp');
    setOtpSent(true);
    toast({
      title: 'OTP Sent',
      description: `A verification code has been sent to your registered ${selectedPlatform?.category === 'utility' ? 'email' : 'mobile number'}.`,
    });
  };

  const handleOtpVerify = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit OTP.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await simulateApiCall(null, 1500);
    
    // Get demo accounts for the selected platform
    const accountsToAdd = getDemoAccountsForPlatform(selectedPlatform?.id || '');
    setPendingAccounts(accountsToAdd);
    
    // Initialize balances for each account
    setAccountBalances(accountsToAdd.map(acc => ({
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      balance: acc.balance.toString(),
    })));

    setIsLoading(false);
    setStep('opening-balance');
  };

  const handleBalanceChange = (accountNumber: string, value: string) => {
    setAccountBalances(prev => 
      prev.map(acc => 
        acc.accountNumber === accountNumber 
          ? { ...acc, balance: value }
          : acc
      )
    );
  };

  const handleSaveBalances = async () => {
    setIsLoading(true);

    try {
      // Save each account to the database
      for (const acc of pendingAccounts) {
        const balanceEntry = accountBalances.find(b => b.accountNumber === acc.accountNumber);
        const openingBalance = parseFloat(balanceEntry?.balance || '0');

        const input: CreateLinkedAccountInput = {
          platform_id: selectedPlatform?.id || '',
          platform_name: acc.bankName,
          platform_logo: acc.bankLogo,
          account_number: acc.accountNumber,
          account_type: acc.accountType,
          opening_balance: openingBalance,
          currency: acc.currency,
        };

        await createAccount.mutateAsync(input);
      }

      setStep('success');
      
      setTimeout(() => {
        onConnectionSuccess(pendingAccounts);
        handleClose();
        toast({
          title: 'Connected Successfully!',
          description: `${selectedPlatform?.name} has been linked with opening balances saved.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save account balances. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('select-platform');
    setSelectedPlatform(null);
    setOtpValue('');
    setOtpSent(false);
    setPendingAccounts([]);
    setAccountBalances([]);
  };

  const getConsentItems = () => {
    switch (selectedPlatform?.category) {
      case 'investment':
      case 'real-estate':
        return {
          access: ['Portfolio holdings', 'Investment performance', 'Transaction history'],
          notAccess: ['Execute trades', 'Withdraw funds', 'Modify orders'],
        };
      case 'crypto':
        return {
          access: ['Wallet balances', 'Transaction history', 'Asset allocation'],
          notAccess: ['Execute trades', 'Transfer crypto', 'Access private keys'],
        };
      case 'utility':
        return {
          access: ['Bill amounts', 'Payment history', 'Account status'],
          notAccess: ['Make payments', 'Change settings', 'Access personal data'],
        };
      default:
        return {
          access: ['Account balances', 'Transaction history (last 12 months)', 'Account holder name'],
          notAccess: ['Store your credentials', 'Make any transactions', 'Share data with third parties'],
        };
    }
  };

  const isAccountConnected = (platform: Bank) => {
    // Check both local state and database
    const inLocalState = connectedAccounts.some(acc => 
      acc.bankName.toLowerCase() === platform.name.toLowerCase()
    );
    const inDatabase = linkedAccounts.some(acc => 
      acc.platform_id === platform.id && acc.is_active
    );
    return inLocalState || inDatabase;
  };

  const renderPlatformGrid = (platforms: Bank[]) => (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map((platform) => {
        const isConnected = isAccountConnected(platform);
        return (
          <button
            key={platform.id}
            onClick={() => !isConnected && handlePlatformSelect(platform)}
            disabled={isConnected}
            className={`flex items-center gap-3 p-4 rounded-lg border transition-all text-left ${
              isConnected 
                ? 'border-green-500/30 bg-green-500/5 cursor-not-allowed' 
                : 'border-border hover:border-primary hover:bg-primary/5'
            }`}
          >
            <span className="text-2xl">{platform.logo}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{platform.name}</p>
              <p className="text-xs text-muted-foreground">{platform.country}</p>
            </div>
            {isConnected && (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'current': return 'Current Account';
      case 'savings': return 'Savings Account';
      case 'credit_card': return 'Credit Card';
      case 'investment': return 'Investment Portfolio';
      case 'crypto': return 'Crypto Wallet';
      case 'utility': return 'Utility Account';
      default: return type;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'select-platform':
        return (
          <div className="space-y-4">
            <Alert className="bg-primary/10 border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Demo Mode:</strong> Use any 6-digit OTP to test the connection flow.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="banks" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="banks" className="text-xs py-2 px-1">
                  <Building2 className="w-3 h-3 mr-1" />
                  Banks
                </TabsTrigger>
                <TabsTrigger value="investments" className="text-xs py-2 px-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Invest
                </TabsTrigger>
                <TabsTrigger value="crypto" className="text-xs py-2 px-1">
                  <Coins className="w-3 h-3 mr-1" />
                  Crypto
                </TabsTrigger>
                <TabsTrigger value="utilities" className="text-xs py-2 px-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Utilities
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="banks" className="mt-4 max-h-[300px] overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-3">UAE Banks - Open Banking</p>
                {renderPlatformGrid(DEMO_BANKS)}
              </TabsContent>
              
              <TabsContent value="investments" className="mt-4 max-h-[300px] overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-3">Investment & Trading Platforms</p>
                {renderPlatformGrid(DEMO_INVESTMENT_PLATFORMS)}
              </TabsContent>
              
              <TabsContent value="crypto" className="mt-4 max-h-[300px] overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-3">Cryptocurrency Exchanges</p>
                {renderPlatformGrid(DEMO_CRYPTO_PLATFORMS)}
              </TabsContent>
              
              <TabsContent value="utilities" className="mt-4 max-h-[300px] overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-3">UAE Utility Services</p>
                {renderPlatformGrid(DEMO_UTILITY_PLATFORMS)}
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'consent':
        const consentItems = getConsentItems();
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <span className="text-3xl">{selectedPlatform?.logo}</span>
              <div>
                <p className="font-semibold">{selectedPlatform?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedPlatform?.category === 'real-estate' ? 'Real Estate Platform' : `${selectedPlatform?.category} Connection`}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Tharwa Net will access:</h4>
              <div className="space-y-2">
                {consentItems.access.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Tharwa Net will NOT:</h4>
                {consentItems.notAccess.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-red-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('select-platform')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConsent} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Authorize'
                )}
              </Button>
            </div>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Enter Verification Code</h3>
              <p className="text-sm text-muted-foreground">
                {selectedPlatform?.name} has sent a 6-digit OTP to your registered {selectedPlatform?.category === 'utility' ? 'email' : 'mobile'}.
              </p>
            </div>

            <div className="space-y-2">
              <Label>OTP Code</Label>
              <Input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">
                Demo mode: Enter any 6-digit code (e.g., 123456)
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('consent')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleOtpVerify} disabled={isLoading || otpValue.length !== 6} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Connect'
                )}
              </Button>
            </div>

            {otpSent && (
              <button 
                className="text-sm text-primary hover:underline w-full text-center"
                onClick={() => toast({ title: 'OTP Resent', description: 'A new verification code has been sent.' })}
              >
                Didn't receive the code? Resend OTP
              </button>
            )}
          </div>
        );

      case 'opening-balance':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">{selectedPlatform?.logo}</span>
              </div>
              <h3 className="font-semibold mb-2">Set Opening Balances</h3>
              <p className="text-sm text-muted-foreground">
                Enter the current balance for each account. This helps us track your finances accurately.
              </p>
            </div>

            <div className="space-y-4 max-h-[250px] overflow-y-auto">
              {pendingAccounts.map((account, index) => {
                const balanceEntry = accountBalances.find(b => b.accountNumber === account.accountNumber);
                return (
                  <div key={account.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{getAccountTypeLabel(account.accountType)}</p>
                        <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{account.currency}</span>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Opening Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={balanceEntry?.balance || ''}
                        onChange={(e) => handleBalanceChange(account.accountNumber, e.target.value)}
                        className="text-right"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('otp')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSaveBalances} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save & Complete'
                )}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4 py-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Connected Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your {selectedPlatform?.name} account is now linked with opening balances saved.
              </p>
            </div>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Finishing setup...</p>
          </div>
        );
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Link className="w-4 h-4" />
        Connect Platform
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {step === 'select-platform' && 'Connect Account'}
              {step === 'consent' && 'Authorize Access'}
              {step === 'otp' && 'Verify Identity'}
              {step === 'opening-balance' && 'Set Opening Balance'}
              {step === 'success' && 'Connection Complete'}
            </DialogTitle>
            {step === 'select-platform' && (
              <DialogDescription>
                Connect banks, investments, crypto, or utility accounts
              </DialogDescription>
            )}
          </DialogHeader>
          {renderStep()}
        </DialogContent>
      </Dialog>
    </>
  );
}
