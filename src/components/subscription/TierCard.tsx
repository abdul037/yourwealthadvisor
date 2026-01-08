import { Check, Crown, Star, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@/hooks/useSubscription';

interface TierCardProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  billingCycle: 'monthly' | 'yearly';
  onSelect: () => void;
  isLoading?: boolean;
}

const tierIcons = {
  free: Zap,
  plus: Star,
  premium: Crown,
  family: Users,
};

const tierStyles = {
  free: {
    border: 'border-border',
    badge: '',
    button: 'default',
  },
  plus: {
    border: 'border-blue-500/50',
    badge: 'bg-blue-500',
    button: 'default',
  },
  premium: {
    border: 'border-amber-500/50 ring-2 ring-amber-500/20',
    badge: 'bg-amber-500',
    button: 'default',
  },
  family: {
    border: 'border-purple-500/50',
    badge: 'bg-purple-500',
    button: 'default',
  },
};

export function TierCard({ 
  tier, 
  isCurrentPlan, 
  billingCycle, 
  onSelect,
  isLoading 
}: TierCardProps) {
  const Icon = tierIcons[tier.name as keyof typeof tierIcons] || Zap;
  const styles = tierStyles[tier.name as keyof typeof tierStyles] || tierStyles.free;
  const price = billingCycle === 'yearly' ? tier.price_yearly : tier.price_monthly;
  const monthlyEquivalent = billingCycle === 'yearly' ? (tier.price_yearly / 12).toFixed(2) : null;
  const savings = billingCycle === 'yearly' && tier.price_monthly > 0 
    ? Math.round((1 - tier.price_yearly / (tier.price_monthly * 12)) * 100)
    : 0;

  const features = Array.isArray(tier.features) ? tier.features : [];

  return (
    <Card className={cn(
      'relative flex flex-col transition-all hover:shadow-lg',
      styles.border,
      isCurrentPlan && 'bg-muted/50'
    )}>
      {tier.name === 'premium' && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white">
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
          Current Plan
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <div className={cn(
          'mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2',
          tier.name === 'free' && 'bg-muted',
          tier.name === 'plus' && 'bg-blue-500/20',
          tier.name === 'premium' && 'bg-amber-500/20',
          tier.name === 'family' && 'bg-purple-500/20'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            tier.name === 'free' && 'text-muted-foreground',
            tier.name === 'plus' && 'text-blue-400',
            tier.name === 'premium' && 'text-amber-400',
            tier.name === 'family' && 'text-purple-400'
          )} />
        </div>
        <CardTitle>{tier.display_name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              ${billingCycle === 'yearly' ? monthlyEquivalent : price.toFixed(2)}
            </span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          {billingCycle === 'yearly' && tier.price_yearly > 0 && (
            <div className="mt-1 space-y-1">
              <p className="text-sm text-muted-foreground">
                ${price.toFixed(2)} billed yearly
              </p>
              {savings > 0 && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  Save {savings}%
                </Badge>
              )}
            </div>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? 'secondary' : tier.name === 'premium' ? 'default' : 'outline'}
          disabled={isCurrentPlan || tier.name === 'free' || isLoading}
          onClick={onSelect}
        >
          {isLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : tier.name === 'free' ? 'Free' : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
}
