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
  expense_date: string | null;
  notes: string | null;
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
  balance: number;
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { data, error } = await supabase
        .from('expense_groups')
        .insert({ ...group, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;

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
        .order('expense_date', { ascending: false, nullsFirst: false });
      
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

  // Calculate balances
  const balances: MemberBalance[] = members.map(member => {
    let paid = 0;
    expenses.forEach(expense => {
      const expensePayers = payers.filter(p => p.expense_id === expense.id);
      if (expensePayers.length > 0) {
        const memberPayment = expensePayers.find(p => p.member_id === member.id);
        paid += memberPayment ? Number(memberPayment.amount) : 0;
      } else {
        if (expense.paid_by_member_id === member.id) {
          paid += Number(expense.amount);
        }
      }
    });
    
    const owes = splits
      .filter(s => s.member_id === member.id)
      .reduce((sum, s) => sum + Number(s.amount), 0);
    
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

  // Calculate settlement suggestions
  const settlementSuggestions: SettlementSuggestion[] = (() => {
    const suggestions: SettlementSuggestion[] = [];
    const workingBalances = balances.map(b => ({ ...b }));
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

  // Check if current user is the group admin
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const isGroupAdmin = group?.user_id === currentUser?.id;

  // Get current user's member entry
  const currentUserMember = members.find(m => m.user_id === currentUser?.id);

  const addMember = useMutation({
    mutationFn: async ({ name, email, userId }: { name: string; email?: string; userId?: string }) => {
      if (!groupId) throw new Error('No group ID');
      
      const existingByName = members.find(m => m.name.toLowerCase() === name.toLowerCase());
      if (existingByName) {
        throw new Error(`A member named "${name}" already exists`);
      }
      
      if (email) {
        const existingByEmail = members.find(m => m.email?.toLowerCase() === email.toLowerCase());
        if (existingByEmail) {
          throw new Error(`A member with email "${email}" already exists`);
        }
      }
      
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
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      if (!groupId) throw new Error('No group ID');
      if (!isGroupAdmin) throw new Error('Only group admin can remove members');
      
      const member = members.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');
      if (member.is_creator) throw new Error('Cannot remove the group creator');
      
      const memberExpenses = expenses.filter(e => e.paid_by_member_id === memberId);
      const memberPayers = payers.filter(p => p.member_id === memberId);
      
      if (memberExpenses.length > 0 || memberPayers.length > 0) {
        throw new Error('Cannot remove member who has paid for expenses. Delete their expenses first.');
      }
      
      const { error } = await supabase
        .from('expense_group_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group-members', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-splits', groupId] });
      toast({ title: 'Member removed' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (expenseId: string) => {
      if (!groupId) throw new Error('No group ID');
      if (!isGroupAdmin) throw new Error('Only group admin can delete expenses');
      
      await supabase.from('expense_payers').delete().eq('expense_id', expenseId);
      await supabase.from('expense_splits').delete().eq('expense_id', expenseId);
      
      const { error } = await supabase
        .from('expense_group_expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group-expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-splits', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-payers', groupId] });
      toast({ title: 'Expense deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const addExpense = useMutation({
    mutationFn: async ({ 
      description, 
      amount, 
      paidByMemberId,
      payers: expensePayers,
      splitType,
      customSplits,
      expenseDate,
      notes
    }: { 
      description: string; 
      amount: number; 
      paidByMemberId?: string;
      payers?: PayerEntry[];
      splitType: 'equal' | 'percentage' | 'custom';
      customSplits?: { memberId: string; amount?: number; percentage?: number }[];
      expenseDate?: string;
      notes?: string;
    }) => {
      if (!groupId) throw new Error('No group ID');

      const primaryPayerId = paidByMemberId || (expensePayers && expensePayers.length > 0 ? expensePayers[0].memberId : null);
      if (!primaryPayerId) throw new Error('At least one payer is required');

      const { data: expense, error: expenseError } = await supabase
        .from('expense_group_expenses')
        .insert({ 
          group_id: groupId, 
          description, 
          amount, 
          paid_by_member_id: primaryPayerId,
          split_type: splitType,
          expense_date: expenseDate || new Date().toISOString().split('T')[0],
          notes: notes || null,
        })
        .select()
        .single();
      
      if (expenseError) throw expenseError;

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

  const updateExpense = useMutation({
    mutationFn: async ({
      expenseId,
      description,
      amount,
      expenseDate,
      notes,
      payers: expensePayers,
      splitType,
      customSplits
    }: {
      expenseId: string;
      description?: string;
      amount?: number;
      expenseDate?: string;
      notes?: string;
      payers?: PayerEntry[];
      splitType?: 'equal' | 'percentage' | 'custom';
      customSplits?: { memberId: string; amount?: number; percentage?: number }[];
    }) => {
      if (!groupId) throw new Error('No group ID');
      if (!isGroupAdmin) throw new Error('Only group admin can edit expenses');

      const expense = expenses.find(e => e.id === expenseId);
      if (!expense) throw new Error('Expense not found');

      const finalAmount = amount ?? expense.amount;
      const finalSplitType = splitType ?? expense.split_type;

      // Update expense record
      const updateData: Record<string, unknown> = {};
      if (description !== undefined) updateData.description = description;
      if (amount !== undefined) updateData.amount = amount;
      if (expenseDate !== undefined) updateData.expense_date = expenseDate;
      if (notes !== undefined) updateData.notes = notes;
      if (splitType !== undefined) updateData.split_type = splitType;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('expense_group_expenses')
          .update(updateData)
          .eq('id', expenseId);
        if (error) throw error;
      }

      // Update payers if provided
      if (expensePayers !== undefined) {
        await supabase.from('expense_payers').delete().eq('expense_id', expenseId);
        
        if (expensePayers.length > 0) {
          const primaryPayerId = expensePayers[0].memberId;
          await supabase
            .from('expense_group_expenses')
            .update({ paid_by_member_id: primaryPayerId })
            .eq('id', expenseId);

          const payersToInsert = expensePayers.map(p => ({
            expense_id: expenseId,
            member_id: p.memberId,
            amount: p.amount,
          }));
          await supabase.from('expense_payers').insert(payersToInsert);
        }
      }

      // Update splits if amount or split type changed
      if (amount !== undefined || splitType !== undefined || customSplits !== undefined) {
        await supabase.from('expense_splits').delete().eq('expense_id', expenseId);

        let splitsToInsert: { expense_id: string; member_id: string; amount: number; percentage?: number }[] = [];

        if (finalSplitType === 'equal') {
          const splitAmount = finalAmount / members.length;
          splitsToInsert = members.map(m => ({
            expense_id: expenseId,
            member_id: m.id,
            amount: splitAmount,
          }));
        } else if (customSplits) {
          splitsToInsert = customSplits.map(s => ({
            expense_id: expenseId,
            member_id: s.memberId,
            amount: s.amount ?? (s.percentage ? (finalAmount * s.percentage / 100) : 0),
            percentage: s.percentage,
          }));
        }

        if (splitsToInsert.length > 0) {
          await supabase.from('expense_splits').insert(splitsToInsert);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group-expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-splits', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-payers', groupId] });
      toast({ title: 'Expense updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const settleUp = useMutation({
    mutationFn: async ({ fromMemberId, toMemberId, amount, settlementDate }: { fromMemberId: string; toMemberId: string; amount: number; settlementDate?: string }) => {
      if (!groupId || !group) throw new Error('No group ID');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fromMember = members.find(m => m.id === fromMemberId);
      const toMember = members.find(m => m.id === toMemberId);
      const dateToUse = settlementDate || new Date().toISOString().split('T')[0];

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
          transaction_date: dateToUse,
        })
        .select()
        .single();

      if (txError) {
        console.error('Failed to create transaction:', txError);
      }

      const { data, error } = await supabase
        .from('expense_settlements')
        .insert({ 
          group_id: groupId, 
          from_member_id: fromMemberId, 
          to_member_id: toMemberId, 
          amount,
          transaction_id: transaction?.id || null,
          settlement_date: dateToUse,
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

  const deleteSettlement = useMutation({
    mutationFn: async (settlementId: string) => {
      if (!groupId) throw new Error('No group ID');
      if (!isGroupAdmin) throw new Error('Only group admin can delete settlements');

      const settlement = settlements.find(s => s.id === settlementId);
      if (!settlement) throw new Error('Settlement not found');

      // Delete the linked transaction if exists
      if (settlement.transaction_id) {
        await supabase
          .from('transactions')
          .delete()
          .eq('id', settlement.transaction_id);
      }

      const { error } = await supabase
        .from('expense_settlements')
        .delete()
        .eq('id', settlementId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-settlements', groupId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Settlement deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateGroup = useMutation({
    mutationFn: async (data: { name?: string; description?: string; category?: string; currency?: string }) => {
      if (!groupId) throw new Error('No group ID');
      if (!isGroupAdmin) throw new Error('Only group admin can update group settings');

      const { error } = await supabase
        .from('expense_groups')
        .update(data)
        .eq('id', groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
      toast({ title: 'Group updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const markGroupSettled = useMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error('No group ID');
      if (!isGroupAdmin) throw new Error('Only group admin can mark group as settled');

      const hasOutstandingBalances = balances.some(b => Math.abs(b.balance) > 0.01);
      if (hasOutstandingBalances) {
        throw new Error('Cannot mark as settled while there are outstanding balances');
      }

      const { error } = await supabase
        .from('expense_groups')
        .update({ is_settled: true })
        .eq('id', groupId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
      toast({ title: 'Group marked as settled' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error('No group ID');
      if (!currentUserMember) throw new Error('You are not a member of this group');
      if (currentUserMember.is_creator) throw new Error('Group admin cannot leave. Delete the group instead.');

      const userBalance = balances.find(b => b.memberId === currentUserMember.id);
      if (userBalance && Math.abs(userBalance.balance) > 0.01) {
        throw new Error('Cannot leave group with outstanding balance. Settle up first.');
      }

      const { error } = await supabase
        .from('expense_group_members')
        .delete()
        .eq('id', currentUserMember.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-groups'] });
      toast({ title: 'Left group successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const sendInviteEmail = useMutation({
    mutationFn: async ({ memberId }: { memberId: string }) => {
      if (!groupId) throw new Error('No group ID');
      
      const member = members.find(m => m.id === memberId);
      if (!member?.email) throw new Error('Member has no email');

      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          groupId,
          recipientEmail: member.email,
          recipientName: member.name,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Invite email sent' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

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
    isGroupAdmin,
    currentUserMember,
    addMember,
    removeMember,
    addExpense,
    updateExpense,
    deleteExpense,
    settleUp,
    deleteSettlement,
    updateGroup,
    markGroupSettled,
    leaveGroup,
    sendInviteEmail,
    getExpensePayers,
  };
}
