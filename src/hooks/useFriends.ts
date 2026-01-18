import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackSocialEvent } from '@/lib/socialAnalytics';

export interface UserConnection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  connection_type: 'friend' | 'accountability_partner';
  created_at: string;
  updated_at: string;
}

export interface FriendWithProfile {
  connection: UserConnection;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    streak_days: number | null;
    total_points: number | null;
  };
  isRequester: boolean;
}

export function useFriends() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all connections (friends and pending requests)
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['user-connections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;
      return data as UserConnection[];
    },
  });

  // Fetch profiles for all connections
  const { data: friendsWithProfiles = [] } = useQuery({
    queryKey: ['friends-with-profiles', connections],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || connections.length === 0) return [];

      const friendIds = connections.map(conn => 
        conn.requester_id === user.id ? conn.addressee_id : conn.requester_id
      );

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, streak_days, total_points')
        .in('id', friendIds);

      if (error) throw error;

      return connections.map(conn => {
        const friendId = conn.requester_id === user.id ? conn.addressee_id : conn.requester_id;
        const profile = profiles?.find(p => p.id === friendId);
        return {
          connection: conn,
          profile: profile || { id: friendId, full_name: null, avatar_url: null, streak_days: 0, total_points: 0 },
          isRequester: conn.requester_id === user.id,
        };
      }) as FriendWithProfile[];
    },
    enabled: connections.length > 0,
  });

  // Send friend request
  const sendRequest = useMutation({
    mutationFn: async (addresseeEmail: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find user by email in profiles (we need to search differently)
      // For now, we'll use a simplified approach - in production you'd want an edge function
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', addresseeEmail) // This assumes we're passing user ID directly
        .single();

      if (profileError || !targetProfile) {
        throw new Error('User not found');
      }

      const { error } = await supabase
        .from('user_connections')
        .insert({
          requester_id: user.id,
          addressee_id: targetProfile.id,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
      trackSocialEvent('friend_request_sent');
      toast({ title: 'Friend request sent!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Accept friend request
  const acceptRequest = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('user_connections')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
      toast({ title: 'Friend request accepted!' });
    },
    onError: () => {
      toast({ title: 'Error accepting request', variant: 'destructive' });
    },
  });

  // Decline/Remove connection
  const removeConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-connections'] });
      toast({ title: 'Connection removed' });
    },
    onError: () => {
      toast({ title: 'Error removing connection', variant: 'destructive' });
    },
  });

  // Filter helpers
  const acceptedFriends = friendsWithProfiles.filter(f => f.connection.status === 'accepted');
  const pendingReceived = friendsWithProfiles.filter(f => f.connection.status === 'pending' && !f.isRequester);
  const pendingSent = friendsWithProfiles.filter(f => f.connection.status === 'pending' && f.isRequester);

  return {
    connections,
    friendsWithProfiles,
    acceptedFriends,
    pendingReceived,
    pendingSent,
    isLoading,
    sendRequest,
    acceptRequest,
    removeConnection,
  };
}
