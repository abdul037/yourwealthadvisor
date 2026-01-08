import { useState } from 'react';
import { Sparkles, Target, Flame, TrendingDown, Wallet, Calendar, RefreshCw, ChevronRight, Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useChallenges } from '@/hooks/useChallenges';

interface ChallengeRecommendation {
  name: string;
  description: string;
  type: 'savings' | 'no_spend' | 'budget' | 'reduce' | 'streak';
  target_value: number;
  duration_days: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  reasoning: string;
  potential_savings?: number;
}

interface RecommendationsResponse {
  summary: string;
  challenges: ChallengeRecommendation[];
}

const typeConfig = {
  savings: { icon: Target, color: 'text-green-400', bg: 'bg-green-500/20' },
  no_spend: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  budget: { icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  reduce: { icon: TrendingDown, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  streak: { icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

const difficultyConfig = {
  easy: { label: 'Easy', className: 'bg-green-500/20 text-green-400' },
  medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400' },
  hard: { label: 'Hard', className: 'bg-red-500/20 text-red-400' },
};

export function ChallengeRecommendations() {
  const { toast } = useToast();
  const { createAndJoinChallenge } = useChallenges();
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [startingChallenges, setStartingChallenges] = useState<Set<number>>(new Set());
  const [startedChallenges, setStartedChallenges] = useState<Set<number>>(new Set());

  const handleStartChallenge = async (challenge: ChallengeRecommendation, index: number) => {
    setStartingChallenges(prev => new Set([...prev, index]));
    try {
      await createAndJoinChallenge.mutateAsync({
        name: challenge.name,
        description: challenge.description,
        type: challenge.type,
        target_value: challenge.target_value,
        duration_days: challenge.duration_days,
        category: challenge.category,
      });
      setStartedChallenges(prev => new Set([...prev, index]));
    } finally {
      setStartingChallenges(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-challenges');

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to get recommendations');

      setRecommendations(data.recommendations);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Failed to get recommendations',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasLoaded && !isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Challenge Recommendations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get personalized challenges based on your spending patterns
              </p>
            </div>
            <Button onClick={fetchRecommendations} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Analyze My Spending
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <CardTitle className="text-lg">Analyzing your spending...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-lg">Recommended for You</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchRecommendations} className="gap-1">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        <CardDescription>{recommendations.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.challenges.map((challenge, index) => {
          const config = typeConfig[challenge.type];
          const Icon = config.icon;
          const difficulty = difficultyConfig[challenge.difficulty];

          return (
            <div
              key={index}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium">{challenge.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {challenge.description}
                      </p>
                    </div>
                    <Badge className={cn('shrink-0', difficulty.className)}>
                      {difficulty.label}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      {challenge.duration_days} days
                    </Badge>
                    {challenge.category && (
                      <Badge variant="outline" className="text-xs">
                        {challenge.category}
                      </Badge>
                    )}
                    {challenge.potential_savings && challenge.potential_savings > 0 && (
                      <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                        Save ~${challenge.potential_savings.toFixed(0)}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 italic">
                    💡 {challenge.reasoning}
                  </p>

                  <Button 
                    variant={startedChallenges.has(index) ? "default" : "outline"} 
                    size="sm" 
                    className={cn(
                      "mt-3 gap-1",
                      startedChallenges.has(index) && "bg-green-600 hover:bg-green-600"
                    )}
                    onClick={() => handleStartChallenge(challenge, index)}
                    disabled={startingChallenges.has(index) || startedChallenges.has(index)}
                  >
                    {startingChallenges.has(index) ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : startedChallenges.has(index) ? (
                      <>
                        <Check className="w-4 h-4" />
                        Joined
                      </>
                    ) : (
                      <>
                        Start Challenge
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
