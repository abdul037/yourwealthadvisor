import { useState } from 'react';
import { useCircles, Circle } from '@/hooks/useCircles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, MessageSquare, Search, Crown, Lock } from 'lucide-react';
import { CircleDetail } from './CircleDetail';

const categoryColors: Record<string, string> = {
  investing: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  crypto: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  'real-estate': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'debt-free': 'bg-red-500/10 text-red-600 border-red-500/30',
  saving: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  income: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  budgeting: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
};

export function CirclesTab() {
  const { circles, joinedCircles, isLoading, joinCircle, leaveCircle, isMember } = useCircles();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);

  const filteredCircles = circles.filter(circle =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circle.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circle.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search circles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
}: {
  circle: Circle;
  isMember: boolean;
  onSelect: () => void;
  onJoin: () => void;
  onLeave: () => void;
}) {
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="line-clamp-2">
          {circle.description}
        </CardDescription>
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
          </div>
          <Button
            size="sm"
            variant={isMember ? 'outline' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              isMember ? onLeave() : onJoin();
            }}
          >
            {isMember ? 'Joined' : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
