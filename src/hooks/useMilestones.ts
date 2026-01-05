import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Milestone = Tables<'milestones'>;
export type MilestoneInsert = TablesInsert<'milestones'>;
export type MilestoneUpdate = TablesUpdate<'milestones'>;

export function useMilestones() {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading, error, refetch } = useQuery({
    queryKey: ['milestones', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .order('target_date', { ascending: true });
      
      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!user?.id,
  });

  const addMilestone = useMutation({
    mutationFn: async (milestone: Omit<MilestoneInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('milestones')
        .insert({ ...milestone, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({ title: 'Milestone added', description: 'Your milestone has been created.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMilestone = useMutation({
    mutationFn: async ({ id, ...updates }: MilestoneUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({ title: 'Milestone updated', description: 'Your milestone has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({ title: 'Milestone deleted', description: 'Your milestone has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const toggleAchieved = useMutation({
    mutationFn: async (id: string) => {
      const milestone = milestones.find(m => m.id === id);
      if (!milestone) throw new Error('Milestone not found');
      
      const { data, error } = await supabase
        .from('milestones')
        .update({ 
          is_achieved: !milestone.is_achieved,
          achieved_date: !milestone.is_achieved ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast({ 
        title: data.is_achieved ? 'Milestone achieved!' : 'Milestone unmarked',
        description: data.is_achieved ? 'Congratulations on reaching your goal!' : 'Milestone marked as not achieved.'
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Filter by status
  const achievedMilestones = milestones.filter(m => m.is_achieved);
  const pendingMilestones = milestones.filter(m => !m.is_achieved);

  return {
    milestones,
    achievedMilestones,
    pendingMilestones,
    isLoading,
    error,
    refetch,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    toggleAchieved,
  };
}
