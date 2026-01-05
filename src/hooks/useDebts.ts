import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Debt = Tables<'debts'>;
export type DebtInsert = TablesInsert<'debts'>;
export type DebtUpdate = TablesUpdate<'debts'>;

export function useDebts() {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: debts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('is_active', true)
        .order('current_balance', { ascending: false });
      
      if (error) throw error;
      return data as Debt[];
    },
    enabled: !!user?.id,
  });

  const addDebt = useMutation({
    mutationFn: async (debt: Omit<DebtInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('debts')
        .insert({ ...debt, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({ title: 'Debt added', description: 'Your debt has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateDebt = useMutation({
    mutationFn: async ({ id, ...updates }: DebtUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({ title: 'Debt updated', description: 'Your debt has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteDebt = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast({ title: 'Debt deleted', description: 'Your debt has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Calculate totals
  const totalDebt = debts.reduce((sum, debt) => sum + (debt.current_balance || 0), 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
  const averageInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + (debt.interest_rate || 0), 0) / debts.length 
    : 0;

  return {
    debts,
    isLoading,
    error,
    refetch,
    addDebt,
    updateDebt,
    deleteDebt,
    totalDebt,
    totalMinimumPayments,
    averageInterestRate,
  };
}
