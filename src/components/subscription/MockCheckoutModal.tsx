import { useState } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubscriptionTier } from '@/hooks/useSubscription';

interface MockCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: SubscriptionTier | null;
  billingCycle: 'monthly' | 'yearly';
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function MockCheckoutModal({
  open,
  onOpenChange,
  tier,
  billingCycle,
  onConfirm,
  isLoading,
}: MockCheckoutModalProps) {
  const [success, setSuccess] = useState(false);

  if (!tier) return null;

  const price = billingCycle === 'yearly' ? tier.price_yearly : tier.price_monthly;
  const period = billingCycle === 'yearly' ? 'year' : 'month';

  const handleConfirm = async () => {
    await onConfirm();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onOpenChange(false);
    }, 2000);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to {tier.display_name}!</h2>
            <p className="text-muted-foreground text-center">
              Your subscription is now active. Enjoy your premium features!
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscribe to {tier.display_name}
          </DialogTitle>
          <DialogDescription>
            Complete your mock payment to activate your subscription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Summary */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <span>{tier.display_name} ({billingCycle})</span>
              <span>${price.toFixed(2)}/{period}</span>
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-medium">
              <span>Total</span>
              <span>${price.toFixed(2)}</span>
            </div>
          </div>

          {/* Mock Card Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                defaultValue="4242 4242 4242 4242"
                placeholder="Card number"
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input
                  id="expiry"
                  defaultValue="12/28"
                  placeholder="MM/YY"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  defaultValue="123"
                  placeholder="CVC"
                  disabled
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" />
              This is a mock payment form for testing purposes
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : `Pay $${price.toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
