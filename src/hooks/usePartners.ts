import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from '@/hooks/use-toast';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Partner = Tables<'partners'>;
export type PartnerInsert = TablesInsert<'partners'>;
export type PartnerUpdate = TablesUpdate<'partners'>;

export function usePartners() {
  const { user } = useUserProfile();
  const queryClient = useQueryClient();

  const { data: partners = [], isLoading, error, refetch } = useQuery({
    queryKey: ['partners', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Partner[];
    },
    enabled: !!user?.id,
  });

  const addPartner = useMutation({
    mutationFn: async (partner: Omit<PartnerInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('partners')
        .insert({ ...partner, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Partner added', description: 'Partner has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updatePartner = useMutation({
    mutationFn: async ({ id, ...updates }: PartnerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Partner updated', description: 'Partner has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deletePartner = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('partners')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Partner removed', description: 'Partner has been deactivated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    partners,
    isLoading,
    error,
    refetch,
    addPartner,
    updatePartner,
    deletePartner,
  };
}
