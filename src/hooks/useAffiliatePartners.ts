import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export interface AffiliatePartner {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  referral_url: string;
  bonus_description: string | null;
  bonus_coins: number | null;
  min_deposit: number | null;
  features: string[];
  is_featured: boolean | null;
  display_order: number | null;
}

export function useAffiliatePartners() {
  const { user } = useUserProfile();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ['affiliate-partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('affiliate_partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data.map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features as string || '[]'),
      })) as AffiliatePartner[];
    },
  });

  const featuredPartners = partners.filter(p => p.is_featured);

  const getPartnersByCategory = (category: string) => {
    if (category === 'all') return partners;
    return partners.filter(p => p.category === category);
  };

  const trackClick = useMutation({
    mutationFn: async ({ partnerId, source }: { partnerId: string; source: string }) => {
      const { data, error } = await supabase.functions.invoke('track-referral', {
        body: { partnerId, source },
      });

      if (error) throw error;
      return data as { redirectUrl: string; trackingCode: string; bonusCoins: number };
    },
  });

  return {
    partners,
    featuredPartners,
    getPartnersByCategory,
    trackClick,
    isLoading,
  };
}
