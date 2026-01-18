import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useCircles, Circle } from '@/hooks/useCircles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, MessageSquare, Search, Crown, Lock, Sparkles, Activity } from 'lucide-react';
import { CircleDetail } from './CircleDetail';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryColors: Record<string, string> = {
  investing: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  crypto: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  'real-estate': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'debt-free': 'bg-red-500/10 text-red-600 border-red-500/30',
  saving: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  income: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  budgeting: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
};

export function CirclesTab({ initialCircleSlug }: { initialCircleSlug?: string | null }) {
  const { circles, joinedCircles, isLoading, joinCircle, leaveCircle, isMember } = useCircles();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [sortBy, setSortBy] = useState<'active' | 'new' | 'recommended'>('active');
  const [filterBy, setFilterBy] = useState<'all' | 'public' | 'private' | 'premium'>('all');

  const preferredCategories = useMemo(() => {
    return new Set(joinedCircles.map(c => c.category));
  }, [joinedCircles]);

  const circleIds = useMemo(() => circles.map(c => c.id), [circles]);

  const { data: latestPosts = [] } = useQuery({
    queryKey: ['circle-latest-posts', circleIds],
    queryFn: async () => {
      if (circleIds.length === 0) return [];
      const { data, error } = await supabase
        .from('posts')
        .select('id, circle_id, title, content, created_at')
        .in('circle_id', circleIds)
        .order('created_at', { ascending: false })
        .limit(120);

      if (error) throw error;
      return data || [];
    },
    enabled: circleIds.length > 0,
  });

  const latestPostByCircle = useMemo(() => {
    const map = new Map<string, { title: string | null; content: string; created_at: string }>();
    latestPosts.forEach((post: any) => {
      if (!map.has(post.circle_id)) {
        map.set(post.circle_id, {
          title: post.title,
          content: post.content,
          created_at: post.created_at,
        });
      }
    });
    return map;
  }, [latestPosts]);

  const filteredCircles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = (circle: Circle) =>
      circle.name.toLowerCase().includes(query) ||
      circle.description?.toLowerCase().includes(query) ||
      circle.category.toLowerCase().includes(query);

    const matchesFilter = (circle: Circle) => {
      if (filterBy === 'private') return circle.is_private;
      if (filterBy === 'premium') return circle.is_premium;
      if (filterBy === 'public') return !circle.is_private;
      return true;
    };

    const getLastActive = (circle: Circle) => {
      const latest = latestPostByCircle.get(circle.id);
      return latest ? new Date(latest.created_at).getTime() : new Date(circle.created_at).getTime();
    };

    const filtered = circles.filter(c => matchesSearch(c) && matchesFilter(c));

    return filtered.sort((a, b) => {
      if (sortBy === 'new') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'recommended') {
        const aPref = preferredCategories.has(a.category) ? 1 : 0;
        const bPref = preferredCategories.has(b.category) ? 1 : 0;
        if (aPref !== bPref) return bPref - aPref;
        return b.post_count - a.post_count;
      }
      return getLastActive(b) - getLastActive(a);
    });
  }, [circles, searchQuery, filterBy, sortBy, preferredCategories, latestPostByCircle]);

  useEffect(() => {
    if (!initialCircleSlug || selectedCircle) return;
    const match = circles.find(circle => circle.slug === initialCircleSlug);
    if (match) {
      setSelectedCircle(match);
    }
  }, [initialCircleSlug, circles, selectedCircle]);

  if (selectedCircle) {
    return (
      <CircleDetail 
        circle={selectedCircle} 
        onBack={() => setSelectedCircle(null)}
        isMember={isMember(selectedCircle.id)}
        onJoin={() => joinCircle.mutate(selectedCircle.id)}
        onLeave={() => leaveCircle.mutate(selectedCircle.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* My Circles */}
      {joinedCircles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            My Circles
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {joinedCircles.map(circle => (
              <CircleCard
                key={circle.id}
                circle={circle}
                isMember={true}
                onSelect={() => setSelectedCircle(circle)}
                onJoin={() => {}}
                onLeave={() => leaveCircle.mutate(circle.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Discover Circles */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Discover Circles</h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search circles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Most active</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="recommended">Recommended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBy} onValueChange={(value) => setFilterBy(value as typeof filterBy)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCircles.map(circle => (
              <CircleCard
                key={circle.id}
                circle={circle}
                isMember={isMember(circle.id)}
                onSelect={() => setSelectedCircle(circle)}
                onJoin={() => joinCircle.mutate(circle.id)}
                onLeave={() => leaveCircle.mutate(circle.id)}
                latestPost={latestPostByCircle.get(circle.id)}
                preferred={preferredCategories.has(circle.category)}
              />
            ))}
          </div>
        )}

        {filteredCircles.length === 0 && !isLoading && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No circles found matching your search</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function CircleCard({
  circle,
  isMember,
  onSelect,
  onJoin,
  onLeave,
  latestPost,
  preferred,
}: {
  circle: Circle;
  isMember: boolean;
  onSelect: () => void;
  onJoin: () => void;
  onLeave: () => void;
  latestPost?: { title: string | null; content: string; created_at: string };
  preferred?: boolean;
}) {
  const lastActiveLabel = latestPost
    ? formatDistanceToNow(new Date(latestPost.created_at), { addSuffix: true })
    : formatDistanceToNow(new Date(circle.created_at), { addSuffix: true });
  const isNew = Date.now() - new Date(circle.created_at).getTime() < 1000 * 60 * 60 * 24 * 21;
  const isGrowing = circle.member_count > 50;
  const activityLabel = circle.post_count > 50 ? 'High activity' : circle.post_count > 10 ? 'Active' : 'New activity';
  const joinLabel = isMember ? 'Joined' : circle.is_private ? 'Request to join' : 'Join';

  return (
    <Card className="group hover:border-primary/50 transition-colors cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{circle.icon}</span>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {circle.name}
                {circle.is_private && <Lock className="w-3 h-3 text-muted-foreground" />}
                {circle.is_premium && <Crown className="w-3 h-3 text-amber-500" />}
              </CardTitle>
              <Badge variant="outline" className={categoryColors[circle.category] || 'bg-muted'}>
                {circle.category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {preferred && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recommended
              </Badge>
            )}
            {isNew && (
              <Badge variant="secondary">New</Badge>
            )}
            {isGrowing && (
              <Badge variant="secondary">Growing</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="line-clamp-2">
          {circle.description}
        </CardDescription>
        {latestPost && (
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground line-clamp-1">
              {latestPost.title || 'Latest update'}
            </p>
            <p className="line-clamp-1">{latestPost.content}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {circle.member_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {circle.post_count}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              {activityLabel}
            </span>
          </div>
          <Button
            size="sm"
            variant={isMember ? 'outline' : circle.is_private ? 'secondary' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              isMember ? onLeave() : onJoin();
            }}
          >
            {joinLabel}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Last active {lastActiveLabel}
        </div>
      </CardContent>
    </Card>
  );
}
