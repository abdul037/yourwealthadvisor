import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { TierCard } from '@/components/subscription/TierCard';
import { CurrentPlanCard } from '@/components/subscription/CurrentPlanCard';
import { MockCheckoutModal } from '@/components/subscription/MockCheckoutModal';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';

export default function Membership() {
  const {
    subscription,
    tiers,
    currentTier,
    isLoading,
    subscribe,
    cancelSubscription,
    isSubscribing,
    isCancelling,
  } = useSubscription();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setCheckoutOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedTier) return;
    await subscribe(selectedTier.id, billingCycle);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container max-w-6xl py-6 space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl py-6 space-y-8">
        <PageHeader
          title="Membership"
          description="Choose the plan that's right for your wealth building journey"
        />

        {/* Current Plan */}
        <CurrentPlanCard
          subscription={subscription}
          tier={currentTier}
          onCancel={() => cancelSubscription(false)}
          isCancelling={isCancelling}
        />

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 py-4">
          <Label 
            htmlFor="billing-toggle" 
            className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={billingCycle === 'yearly'}
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <Label 
            htmlFor="billing-toggle" 
            className={billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}
          >
            Yearly
            <span className="ml-2 text-xs text-green-500">(Save up to 17%)</span>
          </Label>
        </div>

        {/* Tier Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              isCurrentPlan={currentTier?.id === tier.id}
              billingCycle={billingCycle}
              onSelect={() => handleSelectTier(tier)}
              isLoading={isSubscribing && selectedTier?.id === tier.id}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">Can I switch plans?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! You can upgrade or downgrade at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-muted-foreground">
                We accept all major credit cards including Visa, Mastercard, and American Express.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h3 className="font-medium mb-2">Is there a free trial?</h3>
              <p className="text-sm text-muted-foreground">
                The free plan gives you access to basic features. Upgrade anytime to unlock premium features.
              </p>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <MockCheckoutModal
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          tier={selectedTier}
          billingCycle={billingCycle}
          onConfirm={handleConfirmSubscription}
          isLoading={isSubscribing}
        />
      </div>
    </AppLayout>
  );
}
