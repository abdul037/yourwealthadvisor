import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  priority: 'low' | 'medium' | 'high';
  is_achieved: boolean;
  achieved_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateSavingsGoal {
  name: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGoals([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedGoals: SavingsGoal[] = (data || []).map(m => ({
        id: m.id,
        name: m.name,
        target_amount: m.target_amount,
        current_amount: m.current_amount || 0,
        target_date: m.target_date,
        category: m.category,
        priority: (m.priority as 'low' | 'medium' | 'high') || 'medium',
        is_achieved: m.is_achieved || false,
        achieved_date: m.achieved_date,
        notes: m.notes,
        created_at: m.created_at || new Date().toISOString(),
      }));

      setGoals(mappedGoals);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      toast({
        title: "Error",
        description: "Failed to load savings goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal: CreateSavingsGoal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to add savings goals",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('milestones')
        .insert({
          user_id: user.id,
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount || 0,
          target_date: goal.target_date || null,
          category: goal.category || null,
          priority: goal.priority || 'medium',
          notes: goal.notes || null,
          is_achieved: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Savings goal created!",
      });

      await fetchGoals();
      return data;
    } catch (error) {
      console.error('Error adding savings goal:', error);
      toast({
        title: "Error",
        description: "Failed to create savings goal",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<CreateSavingsGoal & { is_achieved?: boolean }>) => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.target_amount !== undefined) updateData.target_amount = updates.target_amount;
      if (updates.current_amount !== undefined) updateData.current_amount = updates.current_amount;
      if (updates.target_date !== undefined) updateData.target_date = updates.target_date;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.is_achieved !== undefined) {
        updateData.is_achieved = updates.is_achieved;
        updateData.achieved_date = updates.is_achieved ? new Date().toISOString().split('T')[0] : null;
      }

      const { error } = await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal updated!",
      });

      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Goal deleted",
      });

      await fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const addToGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newAmount = goal.current_amount + amount;
    const isAchieved = newAmount >= goal.target_amount;

    await updateGoal(id, { 
      current_amount: newAmount,
      is_achieved: isAchieved,
    });
  };

  // Calculate totals
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSavedAmount = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const activeGoals = goals.filter(g => !g.is_achieved);
  const achievedGoals = goals.filter(g => g.is_achieved);
  const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    refetch: fetchGoals,
    totalTargetAmount,
    totalSavedAmount,
    activeGoals,
    achievedGoals,
    overallProgress,
  };
}
