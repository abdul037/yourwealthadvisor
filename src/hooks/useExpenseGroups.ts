import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ExpenseGroup {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  currency: string;
  invite_code: string;
  is_active: boolean;
  is_settled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseGroupMember {
  id: string;
  group_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  is_creator: boolean;
  joined_at: string;
}

export interface ExpenseGroupExpense {
  id: string;
  group_id: string;
  paid_by_member_id: string;
  description: string;
  amount: number;
  split_type: 'equal' | 'percentage' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface ExpensePayer {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  created_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  member_id: string;
  amount: number;
  percentage: number | null;
  is_paid: boolean;
  created_at: string;
}

export interface ExpenseSettlement {
  id: string;
  group_id: string;
  from_member_id: string;
  to_member_id: string;
  amount: number;
  transaction_id: string | null;
  settled_at: string;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  paid: number;
  owes: number;
  balance: number; // positive = gets money back, negative = owes money
}

export interface SettlementSuggestion {
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
}

export interface PayerEntry {
  memberId: string;
  amount: number;
}

export function useExpenseGroups() {
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['expense-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExpenseGroup[];
    },
  });

  const createGroup = useMutation({
    mutationFn: async (group: { name: string; description?: string; category?: string; currency?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      // Create the group
      const { data, error } = await supabase
        .from('expense_groups')
        .insert({ ...group, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;

      // Auto-add creator as first member
      const { error: memberError } = await supabase
        .from('expense_group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          name: profile?.full_name || user.email?.split('@')[0] || 'Me',
          is_creator: true,
        });
      
      if (memberError) {
        console.error('Failed to add creator as member:', memberError);
      }

      return data as ExpenseGroup;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
      toast({ title: 'Group created', description: `${data.name} has been created` });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('expense_groups')
        .delete()
        .eq('id', groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
      toast({ title: 'Group deleted' });
    },
  });

  return { groups, isLoading, createGroup, deleteGroup };
}

export function useExpenseGroup(groupId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['expense-group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      const { data, error } = await supabase
        .from('expense_groups')
        .select('*')
        .eq('id', groupId)
        .single();
      
      if (error) throw error;
      return data as ExpenseGroup;
    },
    enabled: !!groupId,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['expense-group-members', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from('expense_group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });
      
      if (error) throw error;
      return data as ExpenseGroupMember[];
    },
    enabled: !!groupId,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expense-group-expenses', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from('expense_group_expenses')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ExpenseGroupExpense[];
    },
    enabled: !!groupId,
  });

  const { data: splits = [] } = useQuery({
    queryKey: ['expense-splits', groupId],
    queryFn: async () => {
      if (!groupId || expenses.length === 0) return [];
      const expenseIds = expenses.map(e => e.id);
      const { data, error } = await supabase
        .from('expense_splits')
        .select('*')
        .in('expense_id', expenseIds);
      
      if (error) throw error;
      return data as ExpenseSplit[];
    },
    enabled: !!groupId && expenses.length > 0,
  });

  const { data: payers = [] } = useQuery({
    queryKey: ['expense-payers', groupId],
    queryFn: async () => {
      if (!groupId || expenses.length === 0) return [];
      const expenseIds = expenses.map(e => e.id);
      const { data, error } = await supabase
        .from('expense_payers')
        .select('*')
        .in('expense_id', expenseIds);
      
      if (error) throw error;
      return data as ExpensePayer[];
    },
    enabled: !!groupId && expenses.length > 0,
  });

  const { data: settlements = [] } = useQuery({
    queryKey: ['expense-settlements', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from('expense_settlements')
        .select('*')
        .eq('group_id', groupId)
        .order('settled_at', { ascending: false });
      
      if (error) throw error;
      return data as ExpenseSettlement[];
    },
    enabled: !!groupId,
  });

  // Calculate balances - now supporting multi-payer
  const balances: MemberBalance[] = members.map(member => {
    // Calculate what this member paid (sum from expense_payers, fallback to paid_by_member_id)
    let paid = 0;
    expenses.forEach(expense => {
      const expensePayers = payers.filter(p => p.expense_id === expense.id);
      if (expensePayers.length > 0) {
        // Multi-payer: sum what this member contributed
        const memberPayment = expensePayers.find(p => p.member_id === member.id);
        paid += memberPayment ? Number(memberPayment.amount) : 0;
      } else {
        // Single payer fallback
        if (expense.paid_by_member_id === member.id) {
          paid += Number(expense.amount);
        }
      }
    });
    
    const owes = splits
      .filter(s => s.member_id === member.id)
      .reduce((sum, s) => sum + Number(s.amount), 0);
    
    // Factor in settlements
    const settledPaid = settlements
      .filter(s => s.from_member_id === member.id)
      .reduce((sum, s) => sum + Number(s.amount), 0);
    
    const settledReceived = settlements
      .filter(s => s.to_member_id === member.id)
      .reduce((sum, s) => sum + Number(s.amount), 0);
    
    return {
      memberId: member.id,
      memberName: member.name,
      paid,
      owes,
      balance: paid - owes - settledPaid + settledReceived,
    };
  });

  // Calculate smart settlement suggestions (minimize number of transactions)
  const settlementSuggestions: SettlementSuggestion[] = (() => {
    const suggestions: SettlementSuggestion[] = [];
    
    // Create working copy of balances
    const workingBalances = balances.map(b => ({ ...b }));
    
    // Sort: debtors (negative balance) and creditors (positive balance)
    const debtors = workingBalances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = workingBalances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
    
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      if (amount > 0.01) {
        suggestions.push({
          fromMemberId: debtor.memberId,
          fromMemberName: debtor.memberName,
          toMemberId: creditor.memberId,
          toMemberName: creditor.memberName,
          amount: Math.round(amount * 100) / 100,
        });
        
        debtor.balance += amount;
        creditor.balance -= amount;
      }
      
      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }
    
    return suggestions;
  })();

  const addMember = useMutation({
    mutationFn: async ({ name, email, userId }: { name: string; email?: string; userId?: string }) => {
      if (!groupId) throw new Error('No group ID');
      const { data, error } = await supabase
        .from('expense_group_members')
        .insert({ group_id: groupId, name, email, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group-members', groupId] });
      toast({ title: 'Member added' });
    },
  });

  const addExpense = useMutation({
    mutationFn: async ({ 
      description, 
      amount, 
      paidByMemberId,
      payers: expensePayers,
      splitType,
      customSplits 
    }: { 
      description: string; 
      amount: number; 
      paidByMemberId?: string; // Single payer (legacy)
      payers?: PayerEntry[]; // Multi-payer support
      splitType: 'equal' | 'percentage' | 'custom';
      customSplits?: { memberId: string; amount?: number; percentage?: number }[];
    }) => {
      if (!groupId) throw new Error('No group ID');

      // Determine primary payer for the expense record
      const primaryPayerId = paidByMemberId || (expensePayers && expensePayers.length > 0 ? expensePayers[0].memberId : null);
      if (!primaryPayerId) throw new Error('At least one payer is required');

      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from('expense_group_expenses')
        .insert({ 
          group_id: groupId, 
          description, 
          amount, 
          paid_by_member_id: primaryPayerId,
          split_type: splitType 
        })
        .select()
        .single();
      
      if (expenseError) throw expenseError;

      // If multi-payer, insert into expense_payers table
      if (expensePayers && expensePayers.length > 0) {
        const payersToInsert = expensePayers.map(p => ({
          expense_id: expense.id,
          member_id: p.memberId,
          amount: p.amount,
        }));

        const { error: payerError } = await supabase
          .from('expense_payers')
          .insert(payersToInsert);
        
        if (payerError) {
          console.error('Failed to insert payers:', payerError);
        }
      }

      // Create splits
      let splitsToInsert: { expense_id: string; member_id: string; amount: number; percentage?: number }[] = [];
      
      if (splitType === 'equal') {
        const splitAmount = amount / members.length;
        splitsToInsert = members.map(m => ({
          expense_id: expense.id,
          member_id: m.id,
          amount: splitAmount,
        }));
      } else if (customSplits) {
        splitsToInsert = customSplits.map(s => ({
          expense_id: expense.id,
          member_id: s.memberId,
          amount: s.amount ?? (s.percentage ? (amount * s.percentage / 100) : 0),
          percentage: s.percentage,
        }));
      }

      if (splitsToInsert.length > 0) {
        const { error: splitError } = await supabase
          .from('expense_splits')
          .insert(splitsToInsert);
        
        if (splitError) throw splitError;
      }

      return expense;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group-expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-splits', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-payers', groupId] });
      toast({ title: 'Expense added' });
    },
  });

  const settleUp = useMutation({
    mutationFn: async ({ fromMemberId, toMemberId, amount }: { fromMemberId: string; toMemberId: string; amount: number }) => {
      if (!groupId || !group) throw new Error('No group ID');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get member names for transaction description
      const fromMember = members.find(m => m.id === fromMemberId);
      const toMember = members.find(m => m.id === toMemberId);

      // Create transaction record for the settlement
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'expense',
          category: 'Transfer',
          subcategory: 'Split Settlement',
          amount,
          currency: group.currency,
          description: `Settlement: ${fromMember?.name || 'Unknown'} → ${toMember?.name || 'Unknown'}`,
          notes: `Split group: ${group.name}`,
          transaction_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (txError) {
        console.error('Failed to create transaction:', txError);
      }

      // Create settlement record
      const { data, error } = await supabase
        .from('expense_settlements')
        .insert({ 
          group_id: groupId, 
          from_member_id: fromMemberId, 
          to_member_id: toMemberId, 
          amount,
          transaction_id: transaction?.id || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Settlement recorded' });
    },
  });

  // Get payers for a specific expense
  const getExpensePayers = (expenseId: string): ExpensePayer[] => {
    return payers.filter(p => p.expense_id === expenseId);
  };

  return {
    group,
    members,
    expenses,
    splits,
    payers,
    settlements,
    balances,
    settlementSuggestions,
    isLoading: groupLoading || membersLoading || expensesLoading,
    addMember,
    addExpense,
    settleUp,
    getExpensePayers,
  };
}
