import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Users, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCircles } from '@/hooks/useCircles';
import { useFriends } from '@/hooks/useFriends';
import { supabase } from '@/integrations/supabase/client';
import { trackSocialEvent } from '@/lib/socialAnalytics';

interface SocialFeedProps {
  onSelectTab?: (tab: 'circles' | 'friends' | 'challenges') => void;
}

interface FeedPost {
  id: string;
  circle_id: string;
  title: string | null;
  content: string;
  post_type: string;
  created_at: string;
  author: { full_name: string | null } | null;
  circle: { name: string; icon: string } | null;
}

export function SocialFeed({ onSelectTab }: SocialFeedProps) {
  const { joinedCircles } = useCircles();
  const { acceptedFriends } = useFriends();

  const circleIds = useMemo(() => joinedCircles.map(c => c.id).sort(), [joinedCircles]);
  const circleMap = useMemo(() => {
    return new Map(joinedCircles.map(c => [c.id, { name: c.name, icon: c.icon }]));
  }, [joinedCircles]);

  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['social-feed-posts', circleIds],
    queryFn: async () => {
      if (circleIds.length === 0) return [];
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, circle_id, author_id, title, content, post_type, created_at')
        .in('circle_id', circleIds)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      const authorIds = [...new Set(posts.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);

      return posts.map(post => ({
        ...post,
        author: profiles?.find(p => p.id === post.author_id) || null,
        circle: circleMap.get(post.circle_id) || null,
      })) as FeedPost[];
    },
    enabled: circleIds.length > 0,
  });

  const friendHighlights = useMemo(() => {
    return [...acceptedFriends]
      .sort((a, b) => (b.profile.streak_days || 0) - (a.profile.streak_days || 0))
      .slice(0, 4);
  }, [acceptedFriends]);

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4 text-primary" />
            For You: Latest from your circles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
              ))}
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              No posts yet. Join circles to see updates here.
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => {
                    trackSocialEvent('discover_circles_clicked');
                    onSelectTab?.('circles');
                  }}
                >
                  Discover circles
                </Button>
              </div>
            </div>
          ) : (
            feedPosts.map(post => (
              <div key={post.id} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="text-base">{post.circle?.icon || '💬'}</span>
                    {post.circle?.name || 'Circle'}
                  </span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
                <div className="mt-2">
                  {post.title && <p className="text-sm font-semibold">{post.title}</p>}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  By {post.author?.full_name || 'Community member'}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-primary" />
            Friend activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friendHighlights.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              Add friends to see streaks and progress updates.
              <div className="mt-3">
                <Button size="sm" onClick={() => onSelectTab?.('friends')}>
                  Invite friends
                </Button>
              </div>
            </div>
          ) : (
            friendHighlights.map(friend => (
              <div key={friend.connection.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                <div>
                  <p className="text-sm font-medium">{friend.profile.full_name || 'Friend'}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.profile.streak_days ? `${friend.profile.streak_days} day streak` : 'New activity'}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {friend.profile.total_points ? `${friend.profile.total_points} pts` : '—'}
                </div>
              </div>
            ))
          )}
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>Stay motivated with your circle</span>
            <Link to="/social" className="flex items-center gap-1 text-primary hover:underline">
              <Sparkles className="w-3.5 h-3.5" />
              View all
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
