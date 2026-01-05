import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type IncomeSource = Tables<'income_sources'>;
export type IncomeSourceInsert = TablesInsert<'income_sources'>;
export type IncomeSourceUpdate = TablesUpdate<'income_sources'>;

export function useIncomes() {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: incomes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['incomes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as IncomeSource[];
    },
    enabled: !!user?.id,
  });

  const addIncome = useMutation({
    mutationFn: async (income: Omit<IncomeSourceInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('income_sources')
        .insert({ ...income, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({ title: 'Income added', description: 'Your income source has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...updates }: IncomeSourceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('income_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({ title: 'Income updated', description: 'Your income source has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({ title: 'Income deleted', description: 'Your income source has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate totals
  const totalMonthlyIncome = incomes.reduce((sum, income) => {
    const amount = income.amount || 0;
    switch (income.frequency) {
      case 'weekly': return sum + amount * 4;
      case 'bi-weekly': return sum + amount * 2;
      case 'monthly': return sum + amount;
      case 'quarterly': return sum + amount / 3;
      case 'annually': return sum + amount / 12;
      default: return sum + amount;
    }
  }, 0);

  return {
    incomes,
    isLoading,
    error,
    refetch,
    addIncome,
    updateIncome,
    deleteIncome,
    totalMonthlyIncome,
  };
}
