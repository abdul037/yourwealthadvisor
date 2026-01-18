import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useChallenges, ChallengeWithParticipation } from '@/hooks/useChallenges';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChallengeLeaderboard } from './ChallengeLeaderboard';
import { ChallengeRecommendations } from './ChallengeRecommendations';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Coins, 
  Clock, 
  Target,
  Flame,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useBudgets } from '@/hooks/useBudgets';
import { useFriends } from '@/hooks/useFriends';

const challengeTypeConfig = {
  savings: { icon: Target, label: 'Savings', color: 'text-emerald-500 bg-emerald-500/10' },
  no_spend: { icon: Zap, label: 'No-Spend', color: 'text-red-500 bg-red-500/10' },
  streak: { icon: Flame, label: 'Streak', color: 'text-orange-500 bg-orange-500/10' },
  budget: { icon: Target, label: 'Budget', color: 'text-blue-500 bg-blue-500/10' },
};

export function ChallengesTab() {
  const { activeChallenges, myChallenges, isLoading, joinChallenge, leaveChallenge } = useChallenges();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const { budgets } = useBudgets();
  const { acceptedFriends } = useFriends();
  const hasBudgets = budgets.length > 0;
  const friendCount = acceptedFriends.length;

  const getReason = useMemo(() => {
    return (challenge: ChallengeWithParticipation) => {
      if (challenge.challenge_type === 'budget' && hasBudgets) {
        return 'Based on your active budgets';
      }
      if (challenge.challenge_type === 'savings') {
        return 'A solid step toward your savings goals';
      }
      if (challenge.challenge_type === 'streak') {
        return 'Great for building daily consistency';
      }
      if (friendCount > 0 && challenge.participantCount > 5) {
        return 'Popular in your community';
      }
      return 'Trending challenge right now';
    };
  }, [hasBudgets, friendCount]);

  return (
    <div className="space-y-6">
      {/* Leaderboard Sheet */}
      <ChallengeLeaderboard
        challengeId={selectedChallengeId}
        open={!!selectedChallengeId}
        onOpenChange={(open) => !open && setSelectedChallengeId(null)}
      />

      {/* AI Recommendations */}
      <ChallengeRecommendations />

      {/* Link to AI Tools */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-transparent">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium">AI Challenge Builder</p>
              <p className="text-sm text-muted-foreground">
                Get personalized challenges in the AI Tools hub
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/ai-tools" className="gap-2">
              Explore AI Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* My Active Challenges */}
      {myChallenges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            My Active Challenges
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myChallenges.map(challenge => (
              <MyChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onLeave={() => leaveChallenge.mutate(challenge.id)}
                onViewLeaderboard={() => setSelectedChallengeId(challenge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Challenges */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Available Challenges
        </h3>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : activeChallenges.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No active challenges</h3>
            <p className="text-muted-foreground">
              Check back soon for new challenges!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeChallenges.filter(c => !c.isParticipating).map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onJoin={() => joinChallenge.mutate(challenge.id)}
                onViewLeaderboard={() => setSelectedChallengeId(challenge.id)}
                reason={getReason(challenge)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChallengeCard({ 
  challenge, 
  onJoin,
  onViewLeaderboard,
  reason,
}: { 
  challenge: ChallengeWithParticipation; 
  onJoin: () => void;
  onViewLeaderboard: () => void;
  reason: string;
}) {
  const config = challengeTypeConfig[challenge.challenge_type] || challengeTypeConfig.savings;
  const Icon = config.icon;
  const totalDuration = new Date(challenge.end_date).getTime() - new Date(challenge.start_date).getTime();
  const elapsed = Math.max(0, Date.now() - new Date(challenge.start_date).getTime());
  const timeProgress = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{challenge.icon}</span>
            <div>
              <CardTitle className="text-base">{challenge.name}</CardTitle>
              <Badge variant="outline" className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>
          <Badge variant="secondary">{challenge.daysRemaining}d left</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2">
          {challenge.description}
        </CardDescription>
        <p className="text-xs text-muted-foreground">Why this fits you: {reason}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            {challenge.participantCount} joined
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            {challenge.daysRemaining}d left
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            Ends {format(new Date(challenge.end_date), 'MMM d')}
          </div>
          <div className="flex items-center gap-2 text-amber-500">
            <Coins className="w-4 h-4" />
            {challenge.prize_pool_coins} prize
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Challenge timeline</span>
            <span>{format(new Date(challenge.end_date), 'MMM d')}</span>
          </div>
          <Progress value={timeProgress} className="h-1.5" />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={onJoin}>
            Join & start
          </Button>
          <Button variant="outline" size="icon" onClick={onViewLeaderboard}>
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MyChallengeCard({ 
  challenge,
  onLeave,
  onViewLeaderboard
}: { 
  challenge: ChallengeWithParticipation;
  onLeave: () => void;
  onViewLeaderboard: () => void;
}) {
  const progressPercent = challenge.target_value 
    ? Math.min(100, (challenge.myProgress || 0) / challenge.target_value * 100)
    : 0;
  const nextStepLink = challenge.challenge_type === 'budget'
    ? '/budget'
    : challenge.challenge_type === 'savings'
      ? '/savings'
      : challenge.challenge_type === 'no_spend'
        ? '/expenses'
        : '/';

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{challenge.icon}</span>
            <div>
              <CardTitle className="text-base">{challenge.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary/20 text-primary border-0">
                  Participating
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {challenge.daysRemaining}d left
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-500">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{challenge.prize_pool_coins}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Your Progress</span>
            <span className="font-medium">
              {challenge.myProgress || 0} / {challenge.target_value || '∞'}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="w-4 h-4" />
            {challenge.participantCount} participants
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={nextStepLink}>
                Track progress
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={onViewLeaderboard}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Leaderboard
            </Button>
            <Button variant="ghost" size="sm" onClick={onLeave}>
              Leave
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
