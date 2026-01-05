import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';

export interface OnboardingProgress {
  income_added: boolean;
  expense_added: boolean;
  budget_created: boolean;
  goal_created: boolean;
}

const DEFAULT_PROGRESS: OnboardingProgress = {
  income_added: false,
  expense_added: false,
  budget_created: false,
  goal_created: false,
};

export function useOnboardingProgress() {
  const { user, profile, refetchProfile } = useUserProfile();

  const getProgress = useCallback((): OnboardingProgress => {
    const progress = (profile as any)?.onboarding_progress;
    if (!progress) return DEFAULT_PROGRESS;
    return {
      ...DEFAULT_PROGRESS,
      ...progress,
    };
  }, [profile]);

  const updateProgress = useCallback(async (key: keyof OnboardingProgress, value: boolean = true) => {
    if (!user) return;

    const currentProgress = getProgress();
    const updatedProgress = {
      ...currentProgress,
      [key]: value,
    };

    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_progress: updatedProgress as any 
      })
      .eq('id', user.id);

    if (!error) {
      refetchProfile();
    }

    return { error };
  }, [user, getProgress, refetchProfile]);

  const markIncomeAdded = useCallback(() => updateProgress('income_added'), [updateProgress]);
  const markExpenseAdded = useCallback(() => updateProgress('expense_added'), [updateProgress]);
  const markBudgetCreated = useCallback(() => updateProgress('budget_created'), [updateProgress]);
  const markGoalCreated = useCallback(() => updateProgress('goal_created'), [updateProgress]);

  return {
    progress: getProgress(),
    updateProgress,
    markIncomeAdded,
    markExpenseAdded,
    markBudgetCreated,
    markGoalCreated,
  };
}