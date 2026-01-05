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

      const { data, error } = await supabase
        .from('expense_groups')
        .insert({ ...group, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
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

  // Calculate balances
  const balances: MemberBalance[] = members.map(member => {
    const paid = expenses
      .filter(e => e.paid_by_member_id === member.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
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
      splitType,
      customSplits 
    }: { 
      description: string; 
      amount: number; 
      paidByMemberId: string;
      splitType: 'equal' | 'percentage' | 'custom';
      customSplits?: { memberId: string; amount?: number; percentage?: number }[];
    }) => {
      if (!groupId) throw new Error('No group ID');

      // Create expense
      const { data: expense, error: expenseError } = await supabase
        .from('expense_group_expenses')
        .insert({ 
          group_id: groupId, 
          description, 
          amount, 
          paid_by_member_id: paidByMemberId,
          split_type: splitType 
        })
        .select()
        .single();
      
      if (expenseError) throw expenseError;

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
      toast({ title: 'Expense added' });
    },
  });

  const settleUp = useMutation({
    mutationFn: async ({ fromMemberId, toMemberId, amount }: { fromMemberId: string; toMemberId: string; amount: number }) => {
      if (!groupId) throw new Error('No group ID');
      
      const { data, error } = await supabase
        .from('expense_settlements')
        .insert({ 
          group_id: groupId, 
          from_member_id: fromMemberId, 
          to_member_id: toMemberId, 
          amount 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-settlements', groupId] });
      toast({ title: 'Settlement recorded' });
    },
  });

  return {
    group,
    members,
    expenses,
    splits,
    settlements,
    balances,
    isLoading: groupLoading || membersLoading || expensesLoading,
    addMember,
    addExpense,
    settleUp,
  };
}
