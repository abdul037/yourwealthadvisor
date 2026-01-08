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

      // Try to get existing balance
      const { data, error } = await supabase
        .from('coin_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No balance exists, create one
        const { data: newBalance, error: insertError } = await supabase
          .from('coin_balances')
          .insert({ user_id: user.id, balance: 100, lifetime_earned: 100 })
          .select()
          .single();

        if (insertError) throw insertError;
        return newBalance as CoinBalance;
      }

      if (error) throw error;
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

  // Add coins (for earning)
  const addCoins = useMutation({
    mutationFn: async ({ 
      amount, 
      source, 
      description 
    }: { 
      amount: number; 
      source: string; 
      description: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update balance
      const { error: balanceError } = await supabase
        .from('coin_balances')
        .update({ 
          balance: (balance?.balance || 0) + amount,
          lifetime_earned: (balance?.lifetime_earned || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: 'earned',
          source,
          description,
        });

      if (transactionError) throw transactionError;
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

  // Spend coins
  const spendCoins = useMutation({
    mutationFn: async ({ 
      amount, 
      source, 
      description 
    }: { 
      amount: number; 
      source: string; 
      description: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if ((balance?.balance || 0) < amount) {
        throw new Error('Insufficient coins');
      }

      // Update balance
      const { error: balanceError } = await supabase
        .from('coin_balances')
        .update({ 
          balance: (balance?.balance || 0) - amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'spent',
          source,
          description,
        });

      if (transactionError) throw transactionError;
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
