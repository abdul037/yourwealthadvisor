import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useFriends, FriendWithProfile } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Check, 
  X, 
  Flame, 
  Trophy,
  Clock,
  Send,
  Link as LinkIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackSocialEvent } from '@/lib/socialAnalytics';
import { useUserProfile } from '@/hooks/useUserProfile';

export function FriendsTab() {
  const { 
    acceptedFriends, 
    pendingReceived, 
    pendingSent, 
    isLoading,
    sendRequest,
    acceptRequest,
    removeConnection 
  } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUserProfile();

  const filteredFriends = acceptedFriends.filter(friend =>
    friend.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingFriendIds = useMemo(() => {
    return new Set([
      ...acceptedFriends.map(f => f.profile.id),
      ...pendingReceived.map(f => f.profile.id),
      ...pendingSent.map(f => f.profile.id),
    ]);
  }, [acceptedFriends, pendingReceived, pendingSent]);

  const { data: suggestedFriends = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['friend-suggestions', acceptedFriends, pendingReceived, pendingSent],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, streak_days, total_points')
        .neq('id', user.id)
        .limit(8);

      if (error) throw error;
      return (data || []).filter(profile => !existingFriendIds.has(profile.id));
    },
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${baseUrl}/auth?mode=signup&redirect=/social${user?.id ? `&ref=${user.id}` : ''}`;

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({ title: 'Invite link copied', description: 'Share it with your friends.' });
      trackSocialEvent('invite_link_copied');
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleCopyInvite} className="gap-2">
            <LinkIcon className="w-4 h-4" />
            Share invite link
          </Button>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Friend</DialogTitle>
                <DialogDescription>
                  Invite friends to connect and compare progress
                </DialogDescription>
              </DialogHeader>
              <InviteFriendForm onSuccess={() => setInviteDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pending Requests Received */}
      {pendingReceived.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Friend Requests ({pendingReceived.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReceived.map(friend => (
              <div key={friend.connection.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{friend.profile.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.profile.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">Wants to connect</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeConnection.mutate(friend.connection.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => acceptRequest.mutate(friend.connection.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Requests Sent */}
      {pendingSent.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-500" />
              Sent Requests ({pendingSent.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingSent.map(friend => (
              <div key={friend.connection.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{friend.profile.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{friend.profile.full_name || 'User'}</p>
                    <p className="text-sm text-muted-foreground">Pending acceptance</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => removeConnection.mutate(friend.connection.id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          My Friends ({acceptedFriends.length})
        </h3>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredFriends.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">
              {acceptedFriends.length === 0 ? 'No friends yet' : 'No friends match your search'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {acceptedFriends.length === 0 
                ? 'Connect with friends to compare progress and stay motivated'
                : 'Try a different search term'}
            </p>
            {acceptedFriends.length === 0 && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Your First Friend
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFriends.map(friend => (
              <FriendCard 
                key={friend.connection.id} 
                friend={friend} 
                onRemove={() => removeConnection.mutate(friend.connection.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* People You May Know */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          People you may know
        </h3>
        {suggestionsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : suggestedFriends.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No suggestions right now. Invite friends to grow your network.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedFriends.map((profile: any) => (
              <Card key={profile.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{profile.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{profile.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.streak_days ? `${profile.streak_days} day streak` : 'New member'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => sendRequest.mutate(profile.id)}
                  >
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FriendCard({ friend, onRemove }: { friend: FriendWithProfile; onRemove: () => void }) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="text-lg">
              {friend.profile.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">{friend.profile.full_name || 'User'}</h4>
            <div className="flex items-center gap-3 mt-2">
              {friend.profile.streak_days && friend.profile.streak_days > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {friend.profile.streak_days}d
                </Badge>
              )}
              {friend.profile.total_points && friend.profile.total_points > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  {friend.profile.total_points}pts
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Streak {friend.profile.streak_days || 0}d • {friend.profile.total_points || 0} pts
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/trends?friend=${friend.profile.id}`}>
                Compare
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InviteFriendForm({ onSuccess }: { onSuccess: () => void }) {
  const [inviteValue, setInviteValue] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { sendRequest } = useFriends();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inviteValue.trim();
    if (!trimmed) return;

    if (trimmed.includes('@')) {
      try {
        setIsSendingEmail(true);
        const { error } = await supabase.functions.invoke('social-invite-email', {
          body: {
            recipientEmail: trimmed,
          },
        });
        if (error) throw error;
        toast({ title: 'Invite email sent', description: 'Your friend will receive a link to join.' });
        setInviteValue('');
        onSuccess();
      } catch (error: any) {
        toast({
          title: 'Invite failed',
          description: error?.message || 'Could not send invite email.',
          variant: 'destructive',
        });
      } finally {
        setIsSendingEmail(false);
      }
      return;
    }

    sendRequest.mutate(trimmed, {
      onSuccess: () => {
        setInviteValue('');
        onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Input
          placeholder="Enter friend's email or user ID"
          value={inviteValue}
          onChange={(e) => setInviteValue(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          We'll email an invite or send a connection request if you enter a user ID
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!inviteValue.trim() || sendRequest.isPending || isSendingEmail}>
          {inviteValue.includes('@') ? 'Send Invite' : 'Send Request'}
        </Button>
      </div>
    </form>
  );
}
