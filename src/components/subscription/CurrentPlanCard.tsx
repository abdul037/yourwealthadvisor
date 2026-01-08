import { format } from 'date-fns';
import { Crown, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumBadge } from './PremiumBadge';
import { SubscriptionTier, UserSubscription } from '@/hooks/useSubscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CurrentPlanCardProps {
  subscription: UserSubscription | null;
  tier: SubscriptionTier | null;
  onCancel: () => void;
  isCancelling: boolean;
}

export function CurrentPlanCard({ 
  subscription, 
  tier, 
  onCancel,
  isCancelling 
}: CurrentPlanCardProps) {
  const isFreePlan = !subscription || tier?.name === 'free';
  const periodEnd = subscription?.current_period_end 
    ? format(new Date(subscription.current_period_end), 'MMMM d, yyyy')
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Your Current Plan
              {tier && <PremiumBadge tier={tier.name} size="md" />}
            </CardTitle>
            <CardDescription>
              {isFreePlan 
                ? 'Upgrade to unlock premium features' 
                : `Your subscription renews ${subscription?.billing_cycle}`}
            </CardDescription>
          </div>
          {tier && tier.name !== 'free' && (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium">{tier?.display_name || 'Free'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Billing</p>
            <p className="font-medium capitalize">
              {isFreePlan ? 'N/A' : subscription?.billing_cycle}
            </p>
          </div>
          {!isFreePlan && (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                  {subscription?.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Next billing date
                </p>
                <p className="font-medium">{periodEnd}</p>
              </div>
            </>
          )}
        </div>

        {subscription?.cancel_at_period_end && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-500">Cancellation scheduled</p>
              <p className="text-sm text-muted-foreground">
                Your subscription will end on {periodEnd}
              </p>
            </div>
          </div>
        )}

        {!isFreePlan && !subscription?.cancel_at_period_end && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Cancel Subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your subscription will remain active until {periodEnd}. After that, you'll be downgraded to the free plan and lose access to premium features.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
