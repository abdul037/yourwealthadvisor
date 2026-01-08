import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { achievements, Achievement, calculateLevel } from '@/lib/achievementsData';

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export function useAchievements() {
  const { user, profile, refetchProfile } = useUserProfile();
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    if (profile) {
      const profileAchievements = (profile as any).achievements || [];
      setUnlockedAchievements(profileAchievements);
      setTotalPoints((profile as any).total_points || 0);
      setStreakDays((profile as any).streak_days || 0);
    }
  }, [profile]);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    if (!user) return;
    
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    // Check if already unlocked
    if (unlockedAchievements.some(a => a.id === achievementId)) return;

    const newUnlocked: UnlockedAchievement = {
      id: achievementId,
      unlockedAt: new Date().toISOString()
    };

    const updatedAchievements = [...unlockedAchievements, newUnlocked];
    const newTotalPoints = totalPoints + achievement.points;

    const { error } = await supabase
      .from('profiles')
      .update({
        achievements: updatedAchievements as any,
        total_points: newTotalPoints
      })
      .eq('id', user.id);

    if (!error) {
      setUnlockedAchievements(updatedAchievements);
      setTotalPoints(newTotalPoints);
      setNewlyUnlocked(achievement);
      refetchProfile();
    }

    return { error, achievement };
  }, [user, unlockedAchievements, totalPoints, refetchProfile]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = (profile as any)?.last_activity_date;
    
    let newStreak = streakDays;
    
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        newStreak = streakDays + 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // diffDays === 0 means same day, don't change streak
    } else {
      newStreak = 1;
    }

    if (newStreak !== streakDays || lastActivity !== today) {
      const { error } = await supabase
        .from('profiles')
        .update({
          streak_days: newStreak,
          last_activity_date: today
        })
        .eq('id', user.id);

      if (!error) {
        setStreakDays(newStreak);
        refetchProfile();

        // Check streak achievements
        if (newStreak >= 7) {
          await unlockAchievement('week_warrior');
        }
        if (newStreak >= 30) {
          await unlockAchievement('month_master');
        }
      }
    }
  }, [user, profile, streakDays, refetchProfile, unlockAchievement]);

  const checkTransactionAchievements = useCallback(async (transactionCount: number) => {
    if (transactionCount >= 1) {
      await unlockAchievement('first_steps');
    }
    if (transactionCount >= 10) {
      await unlockAchievement('ten_tracker');
    }
    if (transactionCount >= 50) {
      await unlockAchievement('fifty_fanatic');
    }
    if (transactionCount >= 100) {
      await unlockAchievement('century_champion');
    }
  }, [unlockAchievement]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  const isUnlocked = useCallback((achievementId: string): boolean => {
    return unlockedAchievements.some(a => a.id === achievementId);
  }, [unlockedAchievements]);

  const levelInfo = calculateLevel(totalPoints);

  return {
    achievements,
    unlockedAchievements,
    totalPoints,
    streakDays,
    levelInfo,
    newlyUnlocked,
    unlockAchievement,
    updateStreak,
    checkTransactionAchievements,
    clearNewlyUnlocked,
    isUnlocked
  };
}
