import { useState } from 'react';
import { Building2, Shield, CheckCircle2, Loader2, Smartphone, X, TrendingUp, Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface SetupWizardBankConnectionProps {
  connectedAccounts: BankAccount[];
  onConnectionSuccess: (accounts: BankAccount[]) => void;
}

type ConnectionStep = 'select-platform' | 'consent' | 'otp' | 'success';

export function SetupWizardBankConnection({ connectedAccounts, onConnectionSuccess }: SetupWizardBankConnectionProps) {
  const [step, setStep] = useState<ConnectionStep>('select-platform');
  const [selectedPlatform, setSelectedPlatform] = useState<Bank | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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
    await simulateApiCall(null, 2000);
    
    const accountsToAdd = getDemoAccountsForPlatform(selectedPlatform?.id || '');
    setIsLoading(false);
    setStep('success');
    
    setTimeout(() => {
      onConnectionSuccess(accountsToAdd);
      // Reset for next connection
      setStep('select-platform');
      setSelectedPlatform(null);
      setOtpValue('');
      setOtpSent(false);
      toast({
        title: 'Connected Successfully!',
        description: `${selectedPlatform?.name} has been linked to your account.`,
      });
    }, 1500);
  };

  const handleBack = () => {
    if (step === 'consent') {
      setStep('select-platform');
      setSelectedPlatform(null);
    } else if (step === 'otp') {
      setStep('consent');
    }
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

  const renderPlatformGrid = (platforms: Bank[]) => (
    <div className="grid grid-cols-2 gap-2">
      {platforms.map((platform) => {
        const isConnected = connectedAccounts.some(acc => 
          acc.bankName.toLowerCase() === platform.name.toLowerCase()
        );
        return (
          <button
            key={platform.id}
            onClick={() => !isConnected && handlePlatformSelect(platform)}
            disabled={isConnected}
            className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
              isConnected 
                ? 'border-wealth-positive/30 bg-wealth-positive/5 cursor-not-allowed' 
                : 'border-border hover:border-primary hover:bg-primary/5'
            }`}
          >
            <span className="text-xl">{platform.logo}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">{platform.name}</p>
            </div>
            {isConnected && (
              <CheckCircle2 className="w-3 h-3 text-wealth-positive flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );

  if (step === 'consent') {
    const consentItems = getConsentItems();
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <span className="text-2xl">{selectedPlatform?.logo}</span>
          <div>
            <p className="font-semibold text-sm">{selectedPlatform?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {selectedPlatform?.category === 'real-estate' ? 'Real Estate' : selectedPlatform?.category}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            {consentItems.access.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-3 h-3 text-wealth-positive" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-1">
            {consentItems.notAccess.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <X className="w-3 h-3 text-destructive" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack} size="sm" className="flex-1">
            Back
          </Button>
          <Button onClick={handleConsent} disabled={isLoading} size="sm" className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Connecting...
              </>
            ) : (
              'Authorize'
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-sm mb-1">Enter Verification Code</h3>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit OTP sent to your registered {selectedPlatform?.category === 'utility' ? 'email' : 'mobile'}.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">OTP Code</Label>
          <Input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
            className="text-center text-lg tracking-widest"
          />
          <p className="text-xs text-muted-foreground text-center">
            Demo: Enter any 6 digits (e.g., 123456)
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBack} size="sm" className="flex-1">
            Back
          </Button>
          <Button onClick={handleOtpVerify} disabled={isLoading || otpValue.length !== 6} size="sm" className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="w-14 h-14 bg-wealth-positive/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-wealth-positive" />
        </div>
        <div>
          <h3 className="font-semibold text-sm mb-1">Connected!</h3>
          <p className="text-xs text-muted-foreground">
            {selectedPlatform?.name} linked successfully
          </p>
        </div>
        <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  // Default: select-platform
  return (
    <div className="space-y-3">
      <Alert className="bg-primary/10 border-primary/20 py-2">
        <Shield className="h-3 w-3 text-primary" />
        <AlertDescription className="text-xs">
          <strong>Demo Mode:</strong> Use any 6-digit OTP to test.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="banks" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-8">
          <TabsTrigger value="banks" className="text-xs py-1 px-1">
            <Building2 className="w-3 h-3 mr-1" />
            Banks
          </TabsTrigger>
          <TabsTrigger value="investments" className="text-xs py-1 px-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            Invest
          </TabsTrigger>
          <TabsTrigger value="crypto" className="text-xs py-1 px-1">
            <Coins className="w-3 h-3 mr-1" />
            Crypto
          </TabsTrigger>
          <TabsTrigger value="utilities" className="text-xs py-1 px-1">
            <Zap className="w-3 h-3 mr-1" />
            Bills
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="banks" className="mt-3 max-h-[200px] overflow-y-auto">
          {renderPlatformGrid(DEMO_BANKS)}
        </TabsContent>
        
        <TabsContent value="investments" className="mt-3 max-h-[200px] overflow-y-auto">
          {renderPlatformGrid(DEMO_INVESTMENT_PLATFORMS)}
        </TabsContent>
        
        <TabsContent value="crypto" className="mt-3 max-h-[200px] overflow-y-auto">
          {renderPlatformGrid(DEMO_CRYPTO_PLATFORMS)}
        </TabsContent>
        
        <TabsContent value="utilities" className="mt-3 max-h-[200px] overflow-y-auto">
          {renderPlatformGrid(DEMO_UTILITY_PLATFORMS)}
        </TabsContent>
      </Tabs>

      {connectedAccounts.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-wealth-positive pt-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{connectedAccounts.length} account{connectedAccounts.length > 1 ? 's' : ''} connected</span>
        </div>
      )}
    </div>
  );
}