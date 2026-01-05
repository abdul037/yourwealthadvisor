import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Budget = Tables<'budgets'>;
export type BudgetInsert = TablesInsert<'budgets'>;
export type BudgetUpdate = TablesUpdate<'budgets'>;

export function useBudgets() {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading, error, refetch } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user?.id,
  });

  const addBudget = useMutation({
    mutationFn: async (budget: Omit<BudgetInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({ ...budget, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Budget added', description: 'Your budget has been created successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updates }: BudgetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Budget updated', description: 'Your budget has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({ title: 'Budget deleted', description: 'Your budget has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate totals
  const totalAllocated = budgets.reduce((sum, budget) => sum + (budget.allocated_amount || 0), 0);

  return {
    budgets,
    isLoading,
    error,
    refetch,
    addBudget,
    updateBudget,
    deleteBudget,
    totalAllocated,
  };
}
