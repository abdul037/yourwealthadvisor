import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface LinkedAccount {
  id: string;
  user_id: string;
  platform_id: string;
  platform_name: string;
  platform_logo: string | null;
  account_number: string | null;
  account_type: string;
  opening_balance: number;
  currency: string;
  last_synced: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkedAccountInput {
  platform_id: string;
  platform_name: string;
  platform_logo?: string;
  account_number?: string;
  account_type: string;
  opening_balance: number;
  currency?: string;
}

export interface UpdateLinkedAccountInput {
  id: string;
  opening_balance?: number;
  is_active?: boolean;
  last_synced?: string;
}

export function useLinkedAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[useLinkedAccounts] Fetching for user:', user?.id);
      if (!user) return [];

      const { data, error } = await supabase
        .from('linked_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[useLinkedAccounts] Fetch error:', error);
        throw error;
      }
      console.log('[useLinkedAccounts] Fetched:', data?.length, 'linked accounts');
      return data as LinkedAccount[];
    },
  });

  const createAccount = useMutation({
    mutationFn: async (input: CreateLinkedAccountInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('linked_accounts')
        .insert({
          user_id: user.id,
          platform_id: input.platform_id,
          platform_name: input.platform_name,
          platform_logo: input.platform_logo || null,
          account_number: input.account_number || null,
          account_type: input.account_type,
          opening_balance: input.opening_balance,
          currency: input.currency || 'AED',
        })
        .select()
        .single();

      if (error) throw error;
      return data as LinkedAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: 'Account Connected',
        description: 'Bank account has been linked successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async (input: UpdateLinkedAccountInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('linked_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: 'Account Updated',
        description: 'Account balance has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('linked_accounts')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: 'Account Disconnected',
        description: 'Bank account has been unlinked.',
        variant: 'destructive',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const refreshAccount = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('linked_accounts')
        .update({ last_synced: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LinkedAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      toast({
        title: 'Account Synced',
        description: 'Account data has been refreshed.',
      });
    },
  });

  return {
    accounts,
    isLoading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccount,
  };
}
