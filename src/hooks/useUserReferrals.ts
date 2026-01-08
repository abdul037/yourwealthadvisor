import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export interface ReferralClick {
  id: string;
  partner_id: string;
  tracking_code: string;
  source: string | null;
  clicked_at: string;
  partner?: {
    name: string;
    logo_url: string | null;
  };
}

export interface ReferralConversion {
  id: string;
  partner_id: string;
  status: string;
  coins_rewarded: number;
  converted_at: string;
  partner?: {
    name: string;
    logo_url: string | null;
  };
}

export interface ReferralReward {
  id: string;
  partner_id: string;
  reward_type: string;
  reward_value: number;
  status: string;
  created_at: string;
  partner?: {
    name: string;
  };
}

export function useUserReferrals() {
  const { user } = useUserProfile();

  const { data: clicks = [], isLoading: clicksLoading } = useQuery({
    queryKey: ['user-referral-clicks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_clicks')
        .select(`
          *,
          partner:affiliate_partners(name, logo_url)
        `)
        .eq('user_id', user!.id)
        .order('clicked_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ReferralClick[];
    },
    enabled: !!user?.id,
  });

  const { data: conversions = [], isLoading: conversionsLoading } = useQuery({
    queryKey: ['user-referral-conversions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_conversions')
        .select(`
          *,
          partner:affiliate_partners(name, logo_url)
        `)
        .eq('user_id', user!.id)
        .order('converted_at', { ascending: false });

      if (error) throw error;
      return data as ReferralConversion[];
    },
    enabled: !!user?.id,
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['user-referral-rewards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_referral_rewards')
        .select(`
          *,
          partner:affiliate_partners(name)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReferralReward[];
    },
    enabled: !!user?.id,
  });

  const pendingRewards = rewards
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.reward_value, 0);

  const totalCoinsEarned = rewards
    .filter(r => r.status === 'credited')
    .reduce((sum, r) => sum + r.reward_value, 0);

  return {
    clicks,
    conversions,
    rewards,
    pendingRewards,
    totalCoinsEarned,
    isLoading: clicksLoading || conversionsLoading || rewardsLoading,
  };
}
