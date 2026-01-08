import { Trophy, Flame, Star, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
  compact?: boolean;
  onViewAll?: () => void;
}

export function ProgressDashboard({ compact = false, onViewAll }: ProgressDashboardProps) {
  const { 
    achievements, 
    unlockedAchievements, 
    totalPoints, 
    streakDays, 
    levelInfo,
    isUnlocked 
  } = useAchievements();

  const progressToNextLevel = levelInfo.nextLevelPoints > 0 
    ? ((totalPoints - (levelInfo.nextLevelPoints - 150)) / 150) * 100 
    : 100;

  const recentAchievements = achievements
    .filter(a => isUnlocked(a.id))
    .slice(0, 3);

  const nextAchievements = achievements
    .filter(a => !isUnlocked(a.id))
    .slice(0, 2);

  if (compact) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Level {levelInfo.level}</p>
                <p className="text-xs text-muted-foreground">{levelInfo.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
              
              {streakDays > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-500">{streakDays}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Your Progress
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Level {levelInfo.level}
              </Badge>
              <span className="text-sm font-medium">{levelInfo.title}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalPoints} / {levelInfo.nextLevelPoints} pts
            </span>
          </div>
          <Progress value={Math.min(progressToNextLevel, 100)} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{unlockedAchievements.length}</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-500/10">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-2xl font-bold text-orange-500">{streakDays}</p>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Recent Achievements</p>
            <div className="flex gap-2 flex-wrap">
              {recentAchievements.map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{achievement.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Next Achievements */}
        {nextAchievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Up Next</p>
            <div className="space-y-2">
              {nextAchievements.map(achievement => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-dashed",
                      "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{achievement.name}</p>
                      <p className="text-xs">{achievement.description}</p>
                    </div>
                    <Badge variant="outline">+{achievement.points}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
