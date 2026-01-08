import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_circles: number;
  max_challenges: number;
  ai_insights: boolean;
  ad_free: boolean;
  priority_support: boolean;
  badge_style: string;
  is_active: boolean;
  display_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trialing' | 'pending';
  payment_provider: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available tiers
  const { data: tiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as SubscriptionTier[];
    },
  });

  // Fetch user's current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserSubscription | null;
    },
  });

  // Get current tier info
  const currentTier = tiers.find(t => t.id === subscription?.tier_id) || 
    tiers.find(t => t.name === 'free') || null;

  // Feature checks
  const features = {
    maxCircles: currentTier?.max_circles ?? 1,
    maxChallenges: currentTier?.max_challenges ?? 1,
    aiInsights: currentTier?.ai_insights ?? false,
    adFree: currentTier?.ad_free ?? false,
    prioritySupport: currentTier?.priority_support ?? false,
    isUnlimited: (limit: number) => limit === -1,
  };

  const isPremium = currentTier?.name !== 'free';
  const isPlus = currentTier?.name === 'plus';
  const isPremiumTier = currentTier?.name === 'premium';
  const isFamily = currentTier?.name === 'family';

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ tierId, billingCycle }: { tierId: string; billingCycle: 'monthly' | 'yearly' }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('mock-checkout', {
        body: { tierId, billingCycle },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast({
        title: 'Subscription activated!',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (cancelImmediately: boolean = false) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('cancel-subscription', {
        body: { cancelImmediately },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-subscription'] });
      toast({
        title: 'Subscription cancelled',
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // State
    subscription,
    tiers,
    currentTier,
    isLoading: tiersLoading || subscriptionLoading,

    // Tier checks
    isPremium,
    isPlus,
    isPremiumTier,
    isFamily,

    // Feature limits
    features,

    // Actions
    subscribe: (tierId: string, billingCycle: 'monthly' | 'yearly') => 
      subscribeMutation.mutateAsync({ tierId, billingCycle }),
    cancelSubscription: (cancelImmediately?: boolean) => 
      cancelMutation.mutateAsync(cancelImmediately),
    isSubscribing: subscribeMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
