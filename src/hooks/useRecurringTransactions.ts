import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual';
  start_date: string;
  end_date?: string;
  next_due_date: string;
  last_generated_date?: string;
  partner_id?: string;
  is_active: boolean;
  auto_generate: boolean;
  reminder_days_before: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type RecurringTransactionInsert = Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useRecurringTransactions() {
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecurringTransactions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRecurringTransactions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      setRecurringTransactions((data || []) as RecurringTransaction[]);
    } catch (error: any) {
      console.error('Error fetching recurring transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recurring transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addRecurringTransaction = async (transaction: RecurringTransactionInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          ...transaction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setRecurringTransactions(prev => [...prev, data as RecurringTransaction]);
      toast({
        title: 'Success',
        description: 'Recurring transaction added',
      });
      return data;
    } catch (error: any) {
      console.error('Error adding recurring transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add recurring transaction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRecurringTransaction = async (id: string, updates: Partial<RecurringTransactionInsert>) => {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRecurringTransactions(prev => 
        prev.map(t => t.id === id ? (data as RecurringTransaction) : t)
      );
      toast({
        title: 'Success',
        description: 'Recurring transaction updated',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating recurring transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update recurring transaction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Recurring transaction deleted',
      });
    } catch (error: any) {
      console.error('Error deleting recurring transaction:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete recurring transaction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateRecurringTransaction(id, { is_active: isActive });
  };

  // Get upcoming bills (due within next 7 days)
  const getUpcomingBills = useCallback(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return recurringTransactions.filter(t => {
      const dueDate = new Date(t.next_due_date);
      return t.is_active && t.type === 'expense' && dueDate >= now && dueDate <= weekFromNow;
    });
  }, [recurringTransactions]);

  useEffect(() => {
    fetchRecurringTransactions();
  }, [fetchRecurringTransactions]);

  return {
    recurringTransactions,
    loading,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    toggleActive,
    getUpcomingBills,
    refetch: fetchRecurringTransactions,
  };
}
