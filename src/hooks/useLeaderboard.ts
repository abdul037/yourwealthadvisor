import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { useAssets } from './useAssets';
import { useIncomes } from './useIncomes';
import { useExpenses } from '@/hooks/useTransactions';
import { toast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

export type LeaderboardEntry = Tables<'leaderboard_entries'>;
export type LeaderboardCategory = 'overall' | 'stocks' | 'crypto' | 'real_estate' | 'savings_rate';
export type LeaderboardScope = 'global' | 'country' | 'city';

interface LeaderboardFilters {
  category: LeaderboardCategory;
  scope: LeaderboardScope;
}

export function useLeaderboard(filters: LeaderboardFilters = { category: 'overall', scope: 'global' }) {
  const { user, profile } = useUserProfile();
  const { assets } = useAssets();
  const { totalMonthlyIncome } = useIncomes();
  const { transactions } = useExpenses();
  const queryClient = useQueryClient();

  // Fetch user preferences from profile table (includes preferences jsonb)
  const { data: profilePreferences } = useQuery({
    queryKey: ['profile-preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return (data?.preferences as Record<string, string>) || {};
    },
    enabled: !!user?.id,
  });

  const userCountry = profilePreferences?.country || null;
  const userCity = profilePreferences?.city || null;

  // Fetch leaderboard entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', filters.category, filters.scope, userCountry, userCity],
    queryFn: async () => {
      let query = supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('category', filters.category)
        .eq('is_public', true)
        .order('score', { ascending: false })
        .limit(10);

      if (filters.scope === 'country' && userCountry) {
        query = query.eq('country', userCountry);
      } else if (filters.scope === 'city' && userCity) {
        query = query.eq('city', userCity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
    enabled: !!user?.id,
  });

  // Fetch user's own entry
  const { data: userEntry } = useQuery({
    queryKey: ['leaderboard-user', filters.category, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('user_id', user!.id)
        .eq('category', filters.category)
        .maybeSingle();

      if (error) throw error;
      return data as LeaderboardEntry | null;
    },
    enabled: !!user?.id,
  });

  // Calculate score based on category
  const calculateScore = (category: LeaderboardCategory): number => {
    switch (category) {
      case 'stocks':
        return assets
          .filter(a => a.category?.toLowerCase().includes('stock') || a.category?.toLowerCase().includes('equity'))
          .reduce((sum, a) => sum + (a.amount || 0), 0);
      case 'crypto':
        return assets
          .filter(a => a.category?.toLowerCase().includes('crypto'))
          .reduce((sum, a) => sum + (a.amount || 0), 0);
      case 'real_estate':
        return assets
          .filter(a => a.category?.toLowerCase().includes('property') || a.category?.toLowerCase().includes('real estate'))
          .reduce((sum, a) => sum + (a.amount || 0), 0);
      case 'savings_rate':
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = transactions
          .filter(t => {
            const date = new Date(t.transaction_date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, t) => sum + t.amount, 0);
        const savings = (totalMonthlyIncome || 0) - monthlyExpenses;
        return totalMonthlyIncome ? Math.round((savings / totalMonthlyIncome) * 100) : 0;
      case 'overall':
      default:
        return assets.reduce((sum, a) => sum + (a.amount || 0), 0);
    }
  };

  // Update or create user's leaderboard entry
  const updateEntry = useMutation({
    mutationFn: async ({ category, isPublic, displayName }: { category: LeaderboardCategory; isPublic?: boolean; displayName?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const score = calculateScore(category);
      const entryData = {
        user_id: user.id,
        category,
        score,
        display_name: displayName || profile?.full_name || 'Anonymous',
        is_public: isPublic ?? userEntry?.is_public ?? false,
        country: userCountry,
        city: userCity,
        avatar_url: profile?.avatar_url,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('leaderboard_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('category', category)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('leaderboard_entries')
          .update(entryData)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('leaderboard_entries')
          .insert(entryData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-user'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle public visibility
  const togglePublic = useMutation({
    mutationFn: async (isPublic: boolean) => {
      if (!userEntry?.id) throw new Error('No entry to update');

      const { data, error } = await supabase
        .from('leaderboard_entries')
        .update({ is_public: isPublic })
        .eq('id', userEntry.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard-user'] });
      toast({ 
        title: data.is_public ? 'Now visible' : 'Now hidden',
        description: data.is_public ? 'Your ranking is now public' : 'Your ranking is now private'
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Check if user is in top entries
  const userInTopEntries = entries.some(e => e.user_id === user?.id);

  return {
    entries,
    userEntry,
    isLoading,
    updateEntry,
    togglePublic,
    calculateScore,
    userInTopEntries,
    userCountry,
    userCity,
  };
}
