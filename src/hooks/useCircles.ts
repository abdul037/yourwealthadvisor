import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  icon: string;
  cover_color: string;
  is_private: boolean;
  is_premium: boolean;
  member_count: number;
  post_count: number;
  created_by: string | null;
  created_at: string;
}

export interface CircleMembership {
  id: string;
  circle_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
}

export function useCircles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all public circles
  const { data: circles = [], isLoading } = useQuery({
    queryKey: ['circles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('circles')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) throw error;
      return data as Circle[];
    },
  });

  // Fetch user's memberships
  const { data: memberships = [] } = useQuery({
    queryKey: ['circle-memberships'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('circle_memberships')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as CircleMembership[];
    },
  });

  // Join a circle
  const joinCircle = useMutation({
    mutationFn: async (circleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_memberships')
        .insert({
          circle_id: circleId,
          user_id: user.id,
          role: 'member',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      toast({ title: 'Joined circle!' });
    },
    onError: () => {
      toast({ title: 'Error joining circle', variant: 'destructive' });
    },
  });

  // Leave a circle
  const leaveCircle = useMutation({
    mutationFn: async (circleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('circle_memberships')
        .delete()
        .eq('circle_id', circleId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      toast({ title: 'Left circle' });
    },
    onError: () => {
      toast({ title: 'Error leaving circle', variant: 'destructive' });
    },
  });

  // Check if user is a member of a circle
  const isMember = (circleId: string) => {
    return memberships.some(m => m.circle_id === circleId);
  };

  // Get circles user has joined
  const joinedCircles = circles.filter(c => isMember(c.id));

  return {
    circles,
    memberships,
    joinedCircles,
    isLoading,
    joinCircle,
    leaveCircle,
    isMember,
  };
}
