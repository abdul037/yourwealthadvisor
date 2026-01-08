import { useState } from 'react';
import { Trophy, Medal, Award, Coins, Clock, Users, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useChallengeLeaderboard } from '@/hooks/useChallengeLeaderboard';
import { differenceInDays } from 'date-fns';

interface ChallengeLeaderboardProps {
  challengeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="w-5 text-center text-muted-foreground font-medium">{rank}</span>;
  }
};

const getRankBadgeStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
    case 2:
      return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-600';
    case 3:
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700';
    default:
      return '';
  }
};

export function ChallengeLeaderboard({ challengeId, open, onOpenChange }: ChallengeLeaderboardProps) {
  const { challenge, participants, userRank, prizeDistribution, isLoading } = useChallengeLeaderboard(challengeId);

  const daysRemaining = challenge 
    ? Math.max(0, differenceInDays(new Date(challenge.end_date), new Date()))
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Challenge Leaderboard
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : challenge ? (
          <div className="space-y-6 pt-4">
            {/* Challenge Info */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
              <h3 className="font-semibold text-lg">{challenge.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
              
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{challenge.prize_pool_coins} coins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{daysRemaining} days left</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{participants.length} participants</span>
                </div>
              </div>
            </div>

            {/* Prize Distribution */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Prize Distribution</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {prizeDistribution.map((prize) => (
                  <div 
                    key={prize.rank}
                    className="bg-muted/50 rounded-lg p-2 text-center"
                  >
                    <div className="text-xs text-muted-foreground">{prize.label}</div>
                    <div className="font-semibold text-primary flex items-center justify-center gap-1">
                      <Coins className="h-3 w-3" />
                      {prize.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">{prize.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Position */}
            {userRank && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Position</span>
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Rank #{userRank}
                  </Badge>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">Rankings</h4>
              <div className="space-y-2">
                {participants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No participants yet. Be the first to join!
                  </p>
                ) : (
                  participants.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        entry.is_current_user 
                          ? 'bg-primary/10 border border-primary/20' 
                          : entry.rank <= 3 
                            ? getRankBadgeStyle(entry.rank)
                            : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {entry.display_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Name & Progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {entry.display_name}
                          </span>
                          {entry.is_current_user && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={entry.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {entry.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Challenge not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
