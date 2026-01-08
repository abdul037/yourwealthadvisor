import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  challenge_type: 'savings' | 'no_spend' | 'streak' | 'budget';
  target_metric: string;
  target_value: number | null;
  start_date: string;
  end_date: string;
  entry_fee_coins: number;
  prize_pool_coins: number;
  max_participants: number | null;
  is_sponsored: boolean;
  sponsor_name: string | null;
  icon: string;
  is_active: boolean;
  created_by: string | null;
  circle_id: string | null;
  created_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  rank: number | null;
  completed_at: string | null;
  joined_at: string;
}

export interface ChallengeWithParticipation extends Challenge {
  participantCount: number;
  isParticipating: boolean;
  myProgress?: number;
  daysRemaining: number;
}

export function useChallenges() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active challenges
  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('end_date', { ascending: true });

      if (error) throw error;

      // Get participant counts
      const challengeIds = data.map(c => c.id);
      const { data: participants } = await supabase
        .from('challenge_participants')
        .select('challenge_id, user_id, progress')
        .in('challenge_id', challengeIds);

      return data.map(challenge => {
        const challengeParticipants = participants?.filter(p => p.challenge_id === challenge.id) || [];
        const userParticipation = user ? challengeParticipants.find(p => p.user_id === user.id) : null;
        const endDate = new Date(challenge.end_date);
        const today = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

        return {
          ...challenge,
          participantCount: challengeParticipants.length,
          isParticipating: !!userParticipation,
          myProgress: userParticipation?.progress || 0,
          daysRemaining,
        };
      }) as ChallengeWithParticipation[];
    },
  });

  // Join a challenge
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: 'Joined challenge! Good luck! 🎯' });
    },
    onError: () => {
      toast({ title: 'Error joining challenge', variant: 'destructive' });
    },
  });

  // Leave a challenge
  const leaveChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast({ title: 'Left challenge' });
    },
    onError: () => {
      toast({ title: 'Error leaving challenge', variant: 'destructive' });
    },
  });

  // Update progress
  const updateProgress = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .update({ progress })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: () => {
      toast({ title: 'Error updating progress', variant: 'destructive' });
    },
  });

  // Filter helpers
  const activeChallenges = challenges.filter(c => c.daysRemaining > 0);
  const myChallenges = challenges.filter(c => c.isParticipating);

  return {
    challenges,
    activeChallenges,
    myChallenges,
    isLoading,
    joinChallenge,
    leaveChallenge,
    updateProgress,
  };
}
