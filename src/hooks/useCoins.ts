import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CoinBalance {
  user_id: string;
  balance: number;
  lifetime_earned: number;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent' | 'purchased' | 'gifted';
  source: string | null;
  description: string | null;
  created_at: string;
}

export function useCoins() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's coin balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['coin-balance'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('coin_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create initial balance via secure RPC
        await supabase.rpc('ensure_coin_balance');
        const { data: created, error: refetchErr } = await supabase
          .from('coin_balances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (refetchErr) throw refetchErr;
        return created as CoinBalance | null;
      }

      return data as CoinBalance;
    },
  });

  // Fetch transaction history
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['coin-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CoinTransaction[];
    },
  });

  // Add coins (server-side via SECURITY DEFINER RPC)
  const addCoins = useMutation({
    mutationFn: async ({
      amount,
      source,
      description,
    }: {
      amount: number;
      source: string;
      description: string;
    }) => {
      const { error } = await supabase.rpc('award_coins', {
        p_amount: amount,
        p_source: source,
        p_description: description,
      });
      if (error) throw error;
    },
    onSuccess: (_, { amount, description }) => {
      queryClient.invalidateQueries({ queryKey: ['coin-balance'] });
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] });
      toast({
        title: `+${amount} Coins! 🪙`,
        description,
      });
    },
    onError: () => {
      toast({ title: 'Error adding coins', variant: 'destructive' });
    },
  });

  // Spend coins (server-side via SECURITY DEFINER RPC)
  const spendCoins = useMutation({
    mutationFn: async ({
      amount,
      source,
      description,
    }: {
      amount: number;
      source: string;
      description: string;
    }) => {
      const { error } = await supabase.rpc('spend_coins', {
        p_amount: amount,
        p_source: source,
        p_description: description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coin-balance'] });
      queryClient.invalidateQueries({ queryKey: ['coin-transactions'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    balance: balance?.balance || 0,
    lifetimeEarned: balance?.lifetime_earned || 0,
    transactions,
    isLoading: balanceLoading || transactionsLoading,
    addCoins,
    spendCoins,
  };
}
