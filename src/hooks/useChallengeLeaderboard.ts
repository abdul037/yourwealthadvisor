import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  progress: number;
  completed_at?: string;
  is_current_user: boolean;
}

export interface PrizeDistribution {
  rank: number;
  label: string;
  amount: number;
  percentage: number;
}

function calculatePrizeDistribution(prizePool: number, participantCount: number): PrizeDistribution[] {
  if (participantCount === 0 || prizePool === 0) return [];

  // Prize distribution based on participant count
  if (participantCount < 10) {
    // Small challenge: 60% 1st, 25% 2nd, 15% 3rd
    return [
      { rank: 1, label: '1st Place', amount: Math.floor(prizePool * 0.6), percentage: 60 },
      { rank: 2, label: '2nd Place', amount: Math.floor(prizePool * 0.25), percentage: 25 },
      { rank: 3, label: '3rd Place', amount: Math.floor(prizePool * 0.15), percentage: 15 },
    ];
  } else if (participantCount < 50) {
    // Medium challenge: 50% 1st, 20% 2nd, 15% 3rd, 15% top 10%
    return [
      { rank: 1, label: '1st Place', amount: Math.floor(prizePool * 0.5), percentage: 50 },
      { rank: 2, label: '2nd Place', amount: Math.floor(prizePool * 0.2), percentage: 20 },
      { rank: 3, label: '3rd Place', amount: Math.floor(prizePool * 0.15), percentage: 15 },
      { rank: 10, label: 'Top 10%', amount: Math.floor(prizePool * 0.15), percentage: 15 },
    ];
  } else {
    // Large challenge: 40% 1st, 15% 2nd, 10% 3rd, 35% top 10%
    return [
      { rank: 1, label: '1st Place', amount: Math.floor(prizePool * 0.4), percentage: 40 },
      { rank: 2, label: '2nd Place', amount: Math.floor(prizePool * 0.15), percentage: 15 },
      { rank: 3, label: '3rd Place', amount: Math.floor(prizePool * 0.1), percentage: 10 },
      { rank: 10, label: 'Top 10%', amount: Math.floor(prizePool * 0.35), percentage: 35 },
    ];
  }
}

export function useChallengeLeaderboard(challengeId: string | null) {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!challengeId,
  });

  const { data: participants, isLoading } = useQuery({
    queryKey: ['challenge-leaderboard', challengeId],
    queryFn: async () => {
      if (!challengeId) return [];
      
      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false });

      if (participantsError) throw participantsError;

      // Fetch profiles for display names
      const userIds = participantsData.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Build leaderboard entries with ranks
      const entries: LeaderboardEntry[] = participantsData.map((p, index) => {
        const profile = profileMap.get(p.user_id);
        return {
          rank: index + 1,
          user_id: p.user_id,
          display_name: profile?.full_name || 'Anonymous User',
          avatar_url: profile?.avatar_url || undefined,
          progress: p.progress || 0,
          completed_at: p.completed_at || undefined,
          is_current_user: p.user_id === currentUser?.id,
        };
      });

      return entries;
    },
    enabled: !!challengeId,
  });

  const userRank = participants?.find(p => p.is_current_user)?.rank || null;
  const prizeDistribution = calculatePrizeDistribution(
    challenge?.prize_pool_coins || 0,
    participants?.length || 0
  );

  return {
    challenge,
    participants: participants || [],
    userRank,
    prizeDistribution,
    isLoading,
  };
}
