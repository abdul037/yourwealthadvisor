import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Globe, MapPin, Building, Eye, EyeOff, RefreshCw, TrendingUp, Coins, Home, PiggyBank } from 'lucide-react';
import { useLeaderboard, LeaderboardCategory, LeaderboardScope } from '@/hooks/useLeaderboard';
import { FormattedCurrency } from '@/components/FormattedCurrency';
import { cn } from '@/lib/utils';

const categoryIcons: Record<LeaderboardCategory, React.ElementType> = {
  overall: Trophy,
  stocks: TrendingUp,
  crypto: Coins,
  real_estate: Home,
  savings_rate: PiggyBank,
};

const categoryLabels: Record<LeaderboardCategory, string> = {
  overall: 'Overall',
  stocks: 'Stocks',
  crypto: 'Crypto',
  real_estate: 'Real Estate',
  savings_rate: 'Savings Rate',
};

const scopeIcons: Record<LeaderboardScope, React.ElementType> = {
  global: Globe,
  country: MapPin,
  city: Building,
};

const scopeLabels: Record<LeaderboardScope, string> = {
  global: 'Global',
  country: 'My Country',
  city: 'My City',
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
};

export function Leaderboard() {
  const [category, setCategory] = useState<LeaderboardCategory>('overall');
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const { 
    entries, 
    userEntry, 
    isLoading, 
    updateEntry, 
    togglePublic,
    userInTopEntries,
    userCountry,
    userCity,
  } = useLeaderboard({ category, scope });

  const handleJoinLeaderboard = () => {
    updateEntry.mutate({ category, isPublic: true, displayName: displayName || undefined });
  };

  const handleUpdateScore = () => {
    updateEntry.mutate({ category });
  };

  const handleTogglePublic = () => {
    togglePublic.mutate(!userEntry?.is_public);
  };

  const handleSaveName = () => {
    if (displayName.trim()) {
      updateEntry.mutate({ category, displayName: displayName.trim() });
    }
    setEditingName(false);
  };

  const formatScore = (score: number, cat: LeaderboardCategory) => {
    if (cat === 'savings_rate') {
      return `${score}%`;
    }
    return <FormattedCurrency amount={score} compact />;
  };

  const ScopeIcon = scopeIcons[scope];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Community Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank against others in your community
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={scope} onValueChange={(v) => setScope(v as LeaderboardScope)}>
              <SelectTrigger className="w-[140px]">
                <ScopeIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Global
                  </div>
                </SelectItem>
                <SelectItem value="country" disabled={!userCountry}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    My Country
                  </div>
                </SelectItem>
                <SelectItem value="city" disabled={!userCity}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    My City
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Tabs */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as LeaderboardCategory)}>
          <TabsList className="grid grid-cols-5 w-full">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key as LeaderboardCategory];
              return (
                <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                  <Icon className="h-4 w-4 mr-1 hidden sm:inline" />
                  {label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Rankings List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading rankings...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">No rankings yet in this category</p>
              <p className="text-sm text-muted-foreground">Be the first to join the leaderboard!</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const isCurrentUser = entry.user_id === userEntry?.user_id;
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    isCurrentUser 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar_url || undefined} />
                    <AvatarFallback>{entry.display_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {entry.display_name}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    {entry.city && (
                      <p className="text-xs text-muted-foreground truncate">
                        {entry.city}{entry.country ? `, ${entry.country}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatScore(Number(entry.score) || 0, category)}</p>
                    {entry.percentile && (
                      <p className="text-xs text-muted-foreground">Top {Math.round(Number(entry.percentile))}%</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* User's Entry (if not in top 10) */}
        {userEntry && !userInTopEntries && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Your Ranking</p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center w-8">
                <span className="text-sm font-medium text-muted-foreground">
                  {userEntry.rank || '—'}
                </span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={userEntry.avatar_url || undefined} />
                <AvatarFallback>{userEntry.display_name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {userEntry.display_name}
                  <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatScore(Number(userEntry.score) || 0, category)}</p>
                {userEntry.percentile && (
                  <p className="text-xs text-muted-foreground">Top {Math.round(Number(userEntry.percentile))}%</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Controls */}
        <div className="border-t pt-4 space-y-4">
          {userEntry ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {userEntry.is_public ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">
                    {userEntry.is_public ? 'Visible on leaderboard' : 'Hidden from leaderboard'}
                  </span>
                </div>
                <Switch
                  checked={userEntry.is_public}
                  onCheckedChange={handleTogglePublic}
                />
              </div>
              
              <div className="flex items-center gap-2">
                {editingName ? (
                  <>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveName}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingName(false)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground flex-1">
                      Display name: <strong>{userEntry.display_name}</strong>
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setDisplayName(userEntry.display_name);
                        setEditingName(true);
                      }}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleUpdateScore}
                disabled={updateEntry.isPending}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", updateEntry.isPending && "animate-spin")} />
                Update My Score
              </Button>
            </>
          ) : (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Join the leaderboard to see how you rank against others
              </p>
              <div className="flex gap-2 justify-center">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Choose a display name"
                  className="max-w-[200px]"
                />
                <Button onClick={handleJoinLeaderboard} disabled={updateEntry.isPending}>
                  <Trophy className="h-4 w-4 mr-2" />
                  Join Leaderboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
