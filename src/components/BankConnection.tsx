import { useState } from 'react';
import { Building2, Link, Shield, CheckCircle2, Loader2, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DEMO_BANKS, Bank, simulateApiCall, DEMO_ACCOUNTS, BankAccount } from '@/lib/mockBankingData';
import { toast } from '@/hooks/use-toast';

interface BankConnectionProps {
  onConnectionSuccess: (accounts: BankAccount[]) => void;
  connectedAccounts: BankAccount[];
}

type ConnectionStep = 'select-bank' | 'consent' | 'otp' | 'success';

export function BankConnection({ onConnectionSuccess, connectedAccounts }: BankConnectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ConnectionStep>('select-bank');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
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
      description: 'A verification code has been sent to your registered mobile number.',
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
    
    // Simulate OTP verification (any 6-digit code works in demo)
    await simulateApiCall(null, 2000);
    
    // Filter accounts for selected bank
    const bankAccounts = DEMO_ACCOUNTS.filter(
      acc => acc.bankName === selectedBank?.name
    );
    
    // If no accounts for this bank, use first 2 demo accounts with modified bank name
    const accountsToAdd = bankAccounts.length > 0 
      ? bankAccounts 
      : DEMO_ACCOUNTS.slice(0, 2).map(acc => ({
          ...acc,
          id: `${acc.id}-${selectedBank?.id}`,
          bankName: selectedBank?.name || acc.bankName,
          bankLogo: selectedBank?.logo || acc.bankLogo,
        }));

    setIsLoading(false);
    setStep('success');
    
    setTimeout(() => {
      onConnectionSuccess(accountsToAdd);
      handleClose();
      toast({
        title: 'Bank Connected!',
        description: `${accountsToAdd.length} account(s) from ${selectedBank?.name} have been linked.`,
      });
    }, 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('select-bank');
    setSelectedBank(null);
    setOtpValue('');
    setOtpSent(false);
  };

  const renderStep = () => {
    switch (step) {
      case 'select-bank':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select your bank to securely connect your account. This is a demo mode - no real bank connection will be made.
            </p>
            <Alert className="bg-primary/10 border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm">
                <strong>Demo Mode:</strong> Use any 6-digit OTP to test the connection flow.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {DEMO_BANKS.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <span className="text-2xl">{bank.logo}</span>
                  <div>
                    <p className="font-medium text-sm">{bank.name}</p>
                    <p className="text-xs text-muted-foreground">{bank.country}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <span className="text-3xl">{selectedBank?.logo}</span>
              <div>
                <p className="font-semibold">{selectedBank?.name}</p>
                <p className="text-sm text-muted-foreground">Open Banking Connection</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">WealthTrack will access:</h4>
              <div className="space-y-2">
                {[
                  'Account balances',
                  'Transaction history (last 12 months)',
                  'Account holder name',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">WealthTrack will NOT:</h4>
                {[
                  'Store your bank credentials',
                  'Make any transactions',
                  'Share data with third parties',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-red-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('select-bank')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleConsent} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Continue'
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
                {selectedBank?.name} has sent a 6-digit OTP to your registered mobile number.
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

      case 'success':
        return (
          <div className="text-center space-y-4 py-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Bank Connected Successfully!</h3>
              <p className="text-sm text-muted-foreground">
                Your {selectedBank?.name} accounts are now linked. Transactions will be imported automatically.
              </p>
            </div>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Importing transactions...</p>
          </div>
        );
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Link className="w-4 h-4" />
        Connect Bank Account
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {step === 'select-bank' && 'Connect Bank Account'}
              {step === 'consent' && 'Authorize Access'}
              {step === 'otp' && 'Verify Identity'}
              {step === 'success' && 'Connection Complete'}
            </DialogTitle>
            {step === 'select-bank' && (
              <DialogDescription>
                Securely link your bank for automatic transaction imports
              </DialogDescription>
            )}
          </DialogHeader>
          {renderStep()}
        </DialogContent>
      </Dialog>
    </>
  );
}
