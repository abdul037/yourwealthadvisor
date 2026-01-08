import { useState } from 'react';
import { useFriends, FriendWithProfile } from '@/hooks/useFriends';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

  const filteredFriends = acceptedFriends.filter(friend =>
    friend.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InviteFriendForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const { sendRequest } = useFriends();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd search by email and get the user ID
    // For now, this is a placeholder
    sendRequest.mutate(email, {
      onSuccess: () => {
        setEmail('');
        onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Input
          placeholder="Enter friend's email or username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          They'll receive a notification to accept your connection
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!email.trim() || sendRequest.isPending}>
          Send Request
        </Button>
      </div>
    </form>
  );
}
