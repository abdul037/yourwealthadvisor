import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  subcategory: string | null;
  amount: number;
  currency: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  next_due_date: string;
  end_date: string | null;
  auto_generate: boolean;
  reminder_days_before: number;
  last_generated_date: string | null;
  partner_id: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateRecurringTransaction {
  type: 'income' | 'expense';
  category: string;
  subcategory?: string;
  amount: number;
  currency?: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date?: string;
  next_due_date: string;
  end_date?: string;
  auto_generate?: boolean;
  reminder_days_before?: number;
  partner_id?: string;
  notes?: string;
}

export function useRecurringTransactionsDB() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true });

      if (error) throw error;

      setTransactions((data || []) as RecurringTransaction[]);
    } catch (error) {
      console.error('Error fetching recurring transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load recurring transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: CreateRecurringTransaction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to add recurring transactions",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          category: transaction.category,
          subcategory: transaction.subcategory || null,
          amount: transaction.amount,
          currency: transaction.currency || 'AED',
          description: transaction.description || null,
          frequency: transaction.frequency,
          start_date: transaction.start_date || new Date().toISOString().split('T')[0],
          next_due_date: transaction.next_due_date,
          end_date: transaction.end_date || null,
          auto_generate: transaction.auto_generate ?? true,
          reminder_days_before: transaction.reminder_days_before ?? 3,
          partner_id: transaction.partner_id || null,
          notes: transaction.notes || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recurring transaction created!",
      });

      await fetchTransactions();
      return data;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create recurring transaction",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<CreateRecurringTransaction & { is_active?: boolean }>) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction updated!",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction deleted",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const generateTransaction = async (recurringId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const recurring = transactions.find(t => t.id === recurringId);
      if (!recurring) return;

      // Create the actual transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: recurring.type,
          category: recurring.category,
          subcategory: recurring.subcategory,
          amount: recurring.amount,
          currency: recurring.currency,
          description: recurring.description,
          transaction_date: recurring.next_due_date,
          is_recurring: true,
          recurring_frequency: recurring.frequency,
          partner_id: recurring.partner_id,
          notes: `Auto-generated from recurring: ${recurring.description || recurring.category}`,
        });

      if (txError) throw txError;

      // Calculate next due date
      const nextDate = calculateNextDueDate(recurring.next_due_date, recurring.frequency);
      
      // Update recurring transaction
      await supabase
        .from('recurring_transactions')
        .update({
          next_due_date: nextDate,
          last_generated_date: recurring.next_due_date,
        })
        .eq('id', recurringId);

      toast({
        title: "Success",
        description: "Transaction generated and scheduled next occurrence",
      });

      await fetchTransactions();
    } catch (error) {
      console.error('Error generating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to generate transaction",
        variant: "destructive",
      });
    }
  };

  // Stats
  const activeTransactions = transactions.filter(t => t.is_active);
  const upcomingExpenses = activeTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const upcomingIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const dueThisWeek = activeTransactions.filter(t => {
    const dueDate = new Date(t.next_due_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= weekFromNow;
  });

  const overdueTransactions = activeTransactions.filter(t => {
    const dueDate = new Date(t.next_due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    generateTransaction,
    refetch: fetchTransactions,
    activeTransactions,
    upcomingExpenses,
    upcomingIncome,
    dueThisWeek,
    overdueTransactions,
  };
}

function calculateNextDueDate(currentDate: string, frequency: string): string {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}
