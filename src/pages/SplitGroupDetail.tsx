import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Users, Receipt, Share2, Copy, Check, 
  UserPlus, DollarSign, Percent, Equal, ArrowRightLeft, ChevronDown, ChevronUp, AlertCircle,
  Mail, Send, Trash2, MoreVertical, Settings, Edit2, LogOut, Calendar as CalendarIcon, Clock,
  Search, X, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AppLayout } from '@/components/AppLayout';
import { useExpenseGroup, ExpenseSplit, PayerEntry, ExpenseGroupExpense, ExpenseSettlement } from '@/hooks/useExpenseGroups';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ExpenseFormContent } from '@/components/ExpenseFormContent';
import { QuickSplitExpenseInput } from '@/components/QuickSplitExpenseInput';
import { ParsedSplitExpense } from '@/hooks/useSplitExpenseParser';
import { useSwipeableTabs } from '@/hooks/useSwipeableTabs';

const TAB_VALUES = ['balances', 'expenses', 'settlements', 'members'] as const;
type TabValue = typeof TAB_VALUES[number];

interface CustomSplitEntry {
  memberId: string;
  amount: string;
  percentage: string;
}

interface PayerFormEntry {
  memberId: string;
  amount: string;
  selected: boolean;
}

export default function SplitGroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { 
    group, members, expenses, splits, payers, settlements, balances, settlementSuggestions,
    isLoading, isGroupAdmin, currentUserMember,
    addMember, removeMember, addExpense, updateExpense, deleteExpense, 
    settleUp, deleteSettlement, updateSettlement, updateGroup, markGroupSettled, leaveGroup, sendInviteEmail,
    getExpensePayers 
  } = useExpenseGroup(groupId);

  // Swipeable tabs for mobile
  const { activeTab, setActiveTab, emblaRef, isMobile } = useSwipeableTabs(TAB_VALUES, 'balances');

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isEditSettlementOpen, setIsEditSettlementOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());
  const [editingExpense, setEditingExpense] = useState<ExpenseGroupExpense | null>(null);
  const [editingSettlement, setEditingSettlement] = useState<ExpenseSettlement | null>(null);

  // Search and filter states
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseFilterPaidBy, setExpenseFilterPaidBy] = useState('all');
  const [expenseFilterSplitType, setExpenseFilterSplitType] = useState('all');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [settlementFilterMember, setSettlementFilterMember] = useState('all');

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    splitType: 'equal' as 'equal' | 'percentage' | 'custom',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [payerEntries, setPayerEntries] = useState<PayerFormEntry[]>([]);
  const [customSplits, setCustomSplits] = useState<CustomSplitEntry[]>([]);
  const [settlement, setSettlement] = useState({
    fromMemberId: '',
    toMemberId: '',
    amount: '',
    settlementDate: new Date().toISOString().split('T')[0],
  });
  const [groupSettings, setGroupSettings] = useState({
    name: '',
    description: '',
    category: '',
    currency: '',
  });

  // Initialize payer entries when members change or dialog opens
  useEffect(() => {
    if ((isAddExpenseOpen || isEditExpenseOpen) && members.length > 0) {
      if (editingExpense) {
        const expensePayers = getExpensePayers(editingExpense.id);
        setPayerEntries(members.map(m => {
          const payer = expensePayers.find(p => p.member_id === m.id);
          return {
            memberId: m.id,
            amount: payer ? payer.amount.toString() : '',
            selected: payer ? true : (expensePayers.length === 0 && m.id === editingExpense.paid_by_member_id),
          };
        }));
        
        const expenseSplits = splits.filter(s => s.expense_id === editingExpense.id);
        setCustomSplits(members.map(m => {
          const split = expenseSplits.find(s => s.member_id === m.id);
          return {
            memberId: m.id,
            amount: split ? split.amount.toString() : '',
            percentage: split?.percentage ? split.percentage.toString() : (100 / members.length).toFixed(2),
          };
        }));
      } else {
        // Smart default: select current user as payer
        setPayerEntries(members.map(m => ({
          memberId: m.id,
          amount: '',
          selected: currentUserMember ? m.id === currentUserMember.id : false,
        })));
        setCustomSplits(members.map(m => ({
          memberId: m.id,
          amount: '',
          percentage: (100 / members.length).toFixed(2),
        })));
      }
    }
  }, [isAddExpenseOpen, isEditExpenseOpen, members, editingExpense, currentUserMember]);

  // Initialize group settings when dialog opens
  useEffect(() => {
    if (isSettingsOpen && group) {
      setGroupSettings({
        name: group.name,
        description: group.description || '',
        category: group.category,
        currency: group.currency,
      });
    }
  }, [isSettingsOpen, group]);

  const handleCopyInvite = () => {
    if (!group) return;
    // Use short branded URL format: /s/{group-slug}-tharwanet-{code}
    const slug = group.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
    const inviteUrl = `${window.location.origin}/s/${slug}-tharwanet-${group.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({ title: 'Invite link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEmailInvite = () => {
    if (!group) return;
    const inviteUrl = `${window.location.origin}/split/join/${group.invite_code}`;
    const subject = encodeURIComponent(`Join "${group.name}" on Tharwa Net`);
    const body = encodeURIComponent(`You've been invited to join the expense group "${group.name}".\n\nClick here to join: ${inviteUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast({ title: 'Email compose opened' });
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return;
    await addMember.mutateAsync(newMember);
    setIsAddMemberOpen(false);
    setNewMember({ name: '', email: '' });
  };

  const validateSplits = (): boolean => {
    const expenseAmount = parseFloat(newExpense.amount) || 0;
    
    if (newExpense.splitType === 'percentage') {
      const totalPercentage = customSplits.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast({ title: 'Invalid split', description: `Percentages must total 100% (currently ${totalPercentage.toFixed(2)}%)`, variant: 'destructive' });
        return false;
      }
    } else if (newExpense.splitType === 'custom') {
      const totalAmount = customSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
      if (Math.abs(totalAmount - expenseAmount) > 0.01) {
        toast({ title: 'Invalid split', description: `Amounts must total ${group?.currency} ${expenseAmount.toFixed(2)} (currently ${totalAmount.toFixed(2)})`, variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const validatePayers = (): boolean => {
    const expenseAmount = parseFloat(newExpense.amount) || 0;
    const selectedPayers = payerEntries.filter(p => p.selected);
    
    if (selectedPayers.length === 0) {
      toast({ title: 'Invalid payers', description: 'Select at least one payer', variant: 'destructive' });
      return false;
    }
    
    if (selectedPayers.length > 1) {
      const totalPaid = selectedPayers.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      if (Math.abs(totalPaid - expenseAmount) > 0.01) {
        toast({ 
          title: 'Invalid payer amounts', 
          description: `Payer amounts must total ${group?.currency} ${expenseAmount.toFixed(2)} (currently ${totalPaid.toFixed(2)})`, 
          variant: 'destructive' 
        });
        return false;
      }
    }
    return true;
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount) return;
    
    if (!validatePayers()) return;
    if (newExpense.splitType !== 'equal' && !validateSplits()) return;

    const expenseAmount = parseFloat(newExpense.amount);
    const selectedPayers = payerEntries.filter(p => p.selected);
    
    let payersData: PayerEntry[] | undefined;
    if (selectedPayers.length === 1) {
      payersData = [{ memberId: selectedPayers[0].memberId, amount: expenseAmount }];
    } else {
      payersData = selectedPayers.map(p => ({
        memberId: p.memberId,
        amount: parseFloat(p.amount) || 0,
      }));
    }

    let splitData: { memberId: string; amount?: number; percentage?: number }[] | undefined;

    if (newExpense.splitType === 'percentage') {
      splitData = customSplits.map(s => ({
        memberId: s.memberId,
        percentage: parseFloat(s.percentage) || 0,
        amount: (expenseAmount * (parseFloat(s.percentage) || 0)) / 100,
      }));
    } else if (newExpense.splitType === 'custom') {
      splitData = customSplits.map(s => ({
        memberId: s.memberId,
        amount: parseFloat(s.amount) || 0,
      }));
    }

    await addExpense.mutateAsync({
      description: newExpense.description,
      amount: expenseAmount,
      payers: payersData,
      splitType: newExpense.splitType,
      customSplits: splitData,
      expenseDate: newExpense.expenseDate,
      notes: newExpense.notes || undefined,
    });
    setIsAddExpenseOpen(false);
    setNewExpense({ description: '', amount: '', splitType: 'equal', expenseDate: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleEditExpense = async () => {
    if (!editingExpense || !newExpense.description.trim() || !newExpense.amount) return;
    
    if (!validatePayers()) return;
    if (newExpense.splitType !== 'equal' && !validateSplits()) return;

    const expenseAmount = parseFloat(newExpense.amount);
    const selectedPayers = payerEntries.filter(p => p.selected);
    
    let payersData: PayerEntry[] | undefined;
    if (selectedPayers.length === 1) {
      payersData = [{ memberId: selectedPayers[0].memberId, amount: expenseAmount }];
    } else {
      payersData = selectedPayers.map(p => ({
        memberId: p.memberId,
        amount: parseFloat(p.amount) || 0,
      }));
    }

    let splitData: { memberId: string; amount?: number; percentage?: number }[] | undefined;

    if (newExpense.splitType === 'percentage') {
      splitData = customSplits.map(s => ({
        memberId: s.memberId,
        percentage: parseFloat(s.percentage) || 0,
        amount: (expenseAmount * (parseFloat(s.percentage) || 0)) / 100,
      }));
    } else if (newExpense.splitType === 'custom') {
      splitData = customSplits.map(s => ({
        memberId: s.memberId,
        amount: parseFloat(s.amount) || 0,
      }));
    }

    await updateExpense.mutateAsync({
      expenseId: editingExpense.id,
      description: newExpense.description,
      amount: expenseAmount,
      payers: payersData,
      splitType: newExpense.splitType,
      customSplits: splitData,
      expenseDate: newExpense.expenseDate,
      notes: newExpense.notes || undefined,
    });
    setIsEditExpenseOpen(false);
    setEditingExpense(null);
    setNewExpense({ description: '', amount: '', splitType: 'equal', expenseDate: new Date().toISOString().split('T')[0], notes: '' });
  };

  const openEditExpense = (expense: ExpenseGroupExpense) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      splitType: expense.split_type,
      expenseDate: expense.expense_date || expense.created_at.split('T')[0],
      notes: expense.notes || '',
    });
    setIsEditExpenseOpen(true);
  };

  const handleSettle = async () => {
    if (!settlement.fromMemberId || !settlement.toMemberId || !settlement.amount) return;
    await settleUp.mutateAsync({
      fromMemberId: settlement.fromMemberId,
      toMemberId: settlement.toMemberId,
      amount: parseFloat(settlement.amount),
      settlementDate: settlement.settlementDate,
    });
    setIsSettleOpen(false);
    setSettlement({ fromMemberId: '', toMemberId: '', amount: '', settlementDate: new Date().toISOString().split('T')[0] });
  };

  const handleUpdateSettings = async () => {
    await updateGroup.mutateAsync(groupSettings);
    setIsSettingsOpen(false);
  };

  const handleLeaveGroup = async () => {
    await leaveGroup.mutateAsync();
    navigate('/split');
  };

  const handleMarkSettled = async () => {
    await markGroupSettled.mutateAsync();
  };

  const toggleExpenseExpanded = (expenseId: string) => {
    setExpandedExpenses(prev => {
      const next = new Set(prev);
      if (next.has(expenseId)) {
        next.delete(expenseId);
      } else {
        next.add(expenseId);
      }
      return next;
    });
  };

  const getExpenseSplits = (expenseId: string): ExpenseSplit[] => {
    return splits.filter(s => s.expense_id === expenseId);
  };

  const updateCustomSplit = (memberId: string, field: 'amount' | 'percentage', value: string) => {
    setCustomSplits(prev => prev.map(s => 
      s.memberId === memberId ? { ...s, [field]: value } : s
    ));
  };

  const updatePayerEntry = (memberId: string, field: 'amount' | 'selected', value: string | boolean) => {
    setPayerEntries(prev => prev.map(p => 
      p.memberId === memberId ? { ...p, [field]: value } : p
    ));
  };

  const getTotalPercentage = () => customSplits.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
  const getTotalCustomAmount = () => customSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  const getTotalPayerAmount = () => payerEntries.filter(p => p.selected).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const getSelectedPayerCount = () => payerEntries.filter(p => p.selected).length;

  const allBalancesZero = balances.every(b => Math.abs(b.balance) < 0.01);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search filter
      const searchMatch = !expenseSearch || 
        expense.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(expenseSearch.toLowerCase());
      
      // Paid by filter
      const expensePayers = payers.filter(p => p.expense_id === expense.id);
      const payerIds = expensePayers.length > 0 
        ? expensePayers.map(p => p.member_id) 
        : [expense.paid_by_member_id];
      const paidByMatch = expenseFilterPaidBy === 'all' || payerIds.includes(expenseFilterPaidBy);
      
      // Split type filter
      const splitTypeMatch = expenseFilterSplitType === 'all' || expense.split_type === expenseFilterSplitType;
      
      return searchMatch && paidByMatch && splitTypeMatch;
    });
  }, [expenses, expenseSearch, expenseFilterPaidBy, expenseFilterSplitType, payers]);

  // Filtered settlements
  const filteredSettlements = useMemo(() => {
    return settlements.filter(settlement => {
      const fromMember = members.find(m => m.id === settlement.from_member_id);
      const toMember = members.find(m => m.id === settlement.to_member_id);
      
      // Search filter
      const searchMatch = !settlementSearch || 
        fromMember?.name.toLowerCase().includes(settlementSearch.toLowerCase()) ||
        toMember?.name.toLowerCase().includes(settlementSearch.toLowerCase());
      
      // Member filter
      const memberMatch = settlementFilterMember === 'all' || 
        settlement.from_member_id === settlementFilterMember ||
        settlement.to_member_id === settlementFilterMember;
      
      return searchMatch && memberMatch;
    });
  }, [settlements, settlementSearch, settlementFilterMember, members]);

  // Handle edit settlement
  const openEditSettlement = (settlement: ExpenseSettlement) => {
    setEditingSettlement(settlement);
    setSettlement({
      fromMemberId: settlement.from_member_id,
      toMemberId: settlement.to_member_id,
      amount: settlement.amount.toString(),
      settlementDate: settlement.settlement_date || settlement.settled_at.split('T')[0],
    });
    setIsEditSettlementOpen(true);
  };

  const handleEditSettlement = async () => {
    if (!editingSettlement || !settlement.fromMemberId || !settlement.toMemberId || !settlement.amount) return;
    await updateSettlement.mutateAsync({
      settlementId: editingSettlement.id,
      fromMemberId: settlement.fromMemberId,
      toMemberId: settlement.toMemberId,
      amount: parseFloat(settlement.amount),
      settlementDate: settlement.settlementDate,
    });
    setIsEditSettlementOpen(false);
    setEditingSettlement(null);
    setSettlement({ fromMemberId: '', toMemberId: '', amount: '', settlementDate: new Date().toISOString().split('T')[0] });
  };

  const clearExpenseFilters = () => {
    setExpenseSearch('');
    setExpenseFilterPaidBy('all');
    setExpenseFilterSplitType('all');
  };

  const clearSettlementFilters = () => {
    setSettlementSearch('');
    setSettlementFilterMember('all');
  };

  const hasExpenseFilters = expenseSearch || expenseFilterPaidBy !== 'all' || expenseFilterSplitType !== 'all';
  const hasSettlementFilters = settlementSearch || settlementFilterMember !== 'all';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-40 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="container py-6">
          <p>Group not found</p>
        </div>
      </AppLayout>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const hasNoMembers = members.length === 0;

  // Render expense form using the new component
  const renderExpenseFormContent = (isEdit: boolean = false) => (
    <ExpenseFormContent
      isEdit={isEdit}
      expense={newExpense}
      setExpense={setNewExpense}
      members={members}
      currentUserMember={currentUserMember}
      payerEntries={payerEntries}
      setPayerEntries={setPayerEntries}
      customSplits={customSplits}
      setCustomSplits={setCustomSplits}
      currency={group.currency}
      onSubmit={isEdit ? handleEditExpense : handleAddExpense}
      isPending={isEdit ? updateExpense.isPending : addExpense.isPending}
    />
  );

  return (
    <AppLayout>
      <div className="container py-4 sm:py-6 px-3 sm:px-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" onClick={() => navigate('/split')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-none">{group.name}</h1>
              {group.is_settled && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 shrink-0">
                  <Check className="h-3 w-3 mr-1" />
                  Settled
                </Badge>
              )}
            </div>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">{group.description}</p>
            )}
          </div>
          <div className="flex gap-1 sm:gap-2 shrink-0">
            {/* Mobile: Icon-only buttons */}
            <div className="flex gap-1 sm:hidden">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyInvite}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyEmailInvite}>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            {/* Desktop: Full buttons */}
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyInvite}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmailInvite}>
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Group Settings</DialogTitle>
                  <DialogDescription>Update group details or manage the group</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {isGroupAdmin ? (
                    <>
                      <div className="space-y-2">
                        <Label>Group Name</Label>
                        <Input
                          value={groupSettings.name}
                          onChange={(e) => setGroupSettings({ ...groupSettings, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={groupSettings.description}
                          onChange={(e) => setGroupSettings({ ...groupSettings, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select 
                            value={groupSettings.category} 
                            onValueChange={(v) => setGroupSettings({ ...groupSettings, category: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trip">Trip</SelectItem>
                              <SelectItem value="household">Household</SelectItem>
                              <SelectItem value="event">Event</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Currency</Label>
                          <Select 
                            value={groupSettings.currency} 
                            onValueChange={(v) => setGroupSettings({ ...groupSettings, currency: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AED">AED</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleUpdateSettings}
                        disabled={updateGroup.isPending}
                      >
                        {updateGroup.isPending ? 'Saving...' : 'Save Settings'}
                      </Button>
                      {allBalancesZero && !group.is_settled && (
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-50"
                          onClick={handleMarkSettled}
                          disabled={markGroupSettled.isPending}
                        >
                          <Check className="h-4 w-4" />
                          {markGroupSettled.isPending ? 'Marking...' : 'Mark Group as Settled'}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Only the group admin can edit settings</p>
                    </div>
                  )}
                  
                  {!isGroupAdmin && currentUserMember && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full gap-2">
                          <LogOut className="h-4 w-4" />
                          Leave Group
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Leave this group?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {balances.find(b => b.memberId === currentUserMember.id)?.balance !== 0
                              ? "You have an outstanding balance. Please settle up before leaving."
                              : "You will no longer have access to this group's expenses and settlements."
                            }
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleLeaveGroup}
                            disabled={Math.abs(balances.find(b => b.memberId === currentUserMember.id)?.balance || 0) > 0.01}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Leave Group
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* No members alert */}
        {hasNoMembers && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No members in this group yet. Add members to start tracking expenses.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
              <div className="text-base sm:text-2xl font-bold truncate">
                <span className="text-xs sm:text-base font-normal">{group.currency}</span> {totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
              <div className="text-base sm:text-2xl font-bold">{members.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
              <div className="text-base sm:text-2xl font-bold">{expenses.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
              <div className="text-base sm:text-2xl font-bold">{settlements.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Settlements</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4">
                <UserPlus className="h-4 w-4 shrink-0" />
                <span className="truncate">Member</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Member name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="For sending invite"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleAddMember} disabled={addMember.isPending}>
                  {addMember.isPending ? 'Adding...' : 'Add Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" disabled={hasNoMembers}>
                <Plus className="h-4 w-4 shrink-0" />
                <span className="truncate">Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              {renderExpenseFormContent(false)}
            </DialogContent>
          </Dialog>

          {/* Edit Expense Dialog */}
          <Dialog open={isEditExpenseOpen} onOpenChange={(open) => {
            setIsEditExpenseOpen(open);
            if (!open) {
              setEditingExpense(null);
              setNewExpense({ description: '', amount: '', splitType: 'equal', expenseDate: new Date().toISOString().split('T')[0], notes: '' });
            }
          }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
              </DialogHeader>
              {renderExpenseFormContent(true)}
            </DialogContent>
          </Dialog>

          <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-2 sm:px-4" disabled={hasNoMembers}>
                <ArrowRightLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">Settle</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Settlement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select 
                    value={settlement.fromMemberId} 
                    onValueChange={(v) => setSettlement({ ...settlement, fromMemberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who is paying?" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select 
                    value={settlement.toMemberId} 
                    onValueChange={(v) => setSettlement({ ...settlement, toMemberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who is receiving?" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.id !== settlement.fromMemberId).map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount ({group.currency})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={settlement.amount}
                    onChange={(e) => setSettlement({ ...settlement, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Settlement Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !settlement.settlementDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {settlement.settlementDate ? format(new Date(settlement.settlementDate), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={settlement.settlementDate ? new Date(settlement.settlementDate) : undefined}
                        onSelect={(date) => setSettlement({ ...settlement, settlementDate: date ? date.toISOString().split('T')[0] : '' })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button className="w-full" onClick={handleSettle} disabled={settleUp.isPending}>
                  {settleUp.isPending ? 'Recording...' : 'Record Settlement'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Settlement Dialog */}
          <Dialog open={isEditSettlementOpen} onOpenChange={(open) => {
            setIsEditSettlementOpen(open);
            if (!open) {
              setEditingSettlement(null);
              setSettlement({ fromMemberId: '', toMemberId: '', amount: '', settlementDate: new Date().toISOString().split('T')[0] });
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Settlement</DialogTitle>
                <DialogDescription>Correct any errors in this settlement record</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Select 
                    value={settlement.fromMemberId} 
                    onValueChange={(v) => setSettlement({ ...settlement, fromMemberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who paid?" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Select 
                    value={settlement.toMemberId} 
                    onValueChange={(v) => setSettlement({ ...settlement, toMemberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who received?" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.id !== settlement.fromMemberId).map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount ({group.currency})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={settlement.amount}
                    onChange={(e) => setSettlement({ ...settlement, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Settlement Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !settlement.settlementDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {settlement.settlementDate ? format(new Date(settlement.settlementDate), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={settlement.settlementDate ? new Date(settlement.settlementDate) : undefined}
                        onSelect={(date) => setSettlement({ ...settlement, settlementDate: date ? date.toISOString().split('T')[0] : '' })}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button className="w-full" onClick={handleEditSettlement} disabled={updateSettlement.isPending}>
                  {updateSettlement.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-4">
          <div className="overflow-x-auto w-full scrollbar-hide">
            <TabsList className="w-max min-w-full md:w-auto h-auto p-1">
              <TabsTrigger value="balances" className="text-xs sm:text-sm py-2 px-3">
                Balance
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs sm:text-sm py-2 px-3 gap-1">
                Expenses
                {expenses.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-1">
                    {expenses.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settlements" className="text-xs sm:text-sm py-2 px-3 gap-1">
                Settle
                {settlements.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-1">
                    {settlements.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm py-2 px-3 gap-1">
                Members
                {members.length > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-1">
                    {members.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Mobile swipe indicator dots */}
          {isMobile && (
            <div className="flex justify-center gap-1.5 -mt-2">
              {TAB_VALUES.map((tab) => (
                <div
                  key={tab}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    activeTab === tab ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}

          {/* Balances Tab */}
          <TabsContent value="balances" className="space-y-4">
                <div className="space-y-4">
                  {balances.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center">
                        <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">Add members and expenses to see balances</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-3">
                      {balances.map((balance) => (
                        <Card key={balance.memberId}>
                          <CardContent className="py-3 sm:py-4 space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                <AvatarFallback className="text-sm">{balance.memberName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <p className="font-medium text-sm sm:text-base">{balance.memberName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                              <div className="p-1.5 sm:p-2 rounded-md bg-muted/50">
                                <p className="text-muted-foreground text-[10px] sm:text-xs">Total Paid</p>
                                <p className="font-medium text-xs sm:text-sm">{group.currency} {balance.paid.toLocaleString()}</p>
                              </div>
                              <div className="p-1.5 sm:p-2 rounded-md bg-muted/50">
                                <p className="text-muted-foreground text-[10px] sm:text-xs">Your Share</p>
                                <p className="font-medium text-xs sm:text-sm">{group.currency} {balance.owes.toLocaleString()}</p>
                              </div>
                              <div className="p-1.5 sm:p-2 rounded-md bg-muted/50">
                                <p className="text-muted-foreground text-[10px] sm:text-xs">Settled (Paid)</p>
                                <p className="font-medium text-xs sm:text-sm">{group.currency} {balance.settledPaid.toLocaleString()}</p>
                              </div>
                              <div className="p-1.5 sm:p-2 rounded-md bg-muted/50">
                                <p className="text-muted-foreground text-[10px] sm:text-xs">Settled (Received)</p>
                                <p className="font-medium text-xs sm:text-sm">{group.currency} {balance.settledReceived.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className={cn(
                              "p-3 rounded-md text-center font-semibold",
                              balance.balance > 0.01 && "bg-green-500/10 text-green-600 dark:text-green-400",
                              balance.balance < -0.01 && "bg-red-500/10 text-red-600 dark:text-red-400",
                              Math.abs(balance.balance) <= 0.01 && "bg-muted text-muted-foreground"
                            )}>
                              {Math.abs(balance.balance) <= 0.01 ? (
                                <span>Settled Up ✓</span>
                              ) : balance.balance > 0 ? (
                                <span>To Receive: {group.currency} {balance.balance.toLocaleString()}</span>
                              ) : (
                                <span>To Pay: {group.currency} {Math.abs(balance.balance).toLocaleString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {settlementSuggestions.length > 0 && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ArrowRightLeft className="h-4 w-4" />
                          Suggested Settlements
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Minimum transactions to settle all balances
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {settlementSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{suggestion.fromMemberName}</span>
                              <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">{suggestion.toMemberName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">
                                {group.currency} {suggestion.amount.toLocaleString()}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSettlement({
                                    fromMemberId: suggestion.fromMemberId,
                                    toMemberId: suggestion.toMemberId,
                                    amount: suggestion.amount.toString(),
                                    settlementDate: new Date().toISOString().split('T')[0],
                                  });
                                  setIsSettleOpen(true);
                                }}
                              >
                                Settle
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                )}
                </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            {/* Quick AI Input */}
            <QuickSplitExpenseInput
              members={members}
              currency={group.currency}
              currentUserMemberId={currentUserMember?.id}
              onAddExpense={async (data) => {
                try {
                  // Prepare splits for equal distribution
                  const equalAmount = data.amount / members.length;
                  const customSplits = members.map(m => ({
                    memberId: m.id,
                    amount: equalAmount,
                    percentage: 100 / members.length
                  }));
                  
                  await addExpense.mutateAsync({
                    description: data.description,
                    amount: data.amount,
                    splitType: data.splitType,
                    notes: data.notes,
                    expenseDate: new Date().toISOString().split('T')[0],
                    customSplits,
                    payers: [{ memberId: data.paidByMemberId, amount: data.amount }]
                  });
                  toast({ title: 'Expense added!' });
                } catch (err) {
                  toast({ title: 'Failed to add expense', variant: 'destructive' });
                }
              }}
              onEditExpense={(parsed: ParsedSplitExpense, paidByMemberId: string | null) => {
                // Pre-fill and open the expense dialog
                setNewExpense({
                  description: parsed.description,
                  amount: parsed.amount.toString(),
                  splitType: parsed.split_type,
                  expenseDate: new Date().toISOString().split('T')[0],
                  notes: parsed.notes || '',
                });
                
                // Set up payers
                const newPayers = members.map(m => ({
                  memberId: m.id,
                  amount: m.id === paidByMemberId ? parsed.amount.toString() : '',
                  selected: m.id === paidByMemberId
                }));
                setPayerEntries(newPayers);
                
                setIsAddExpenseOpen(true);
              }}
            />

            {/* Search & Filter Bar - Mobile */}
            <div className="flex gap-2 sm:hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-9 w-9 shrink-0">
                    <Filter className="h-4 w-4" />
                    {hasExpenseFilters && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-xl">
                  <SheetHeader>
                    <SheetTitle>Filter Expenses</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Paid by</label>
                      <Select value={expenseFilterPaidBy} onValueChange={setExpenseFilterPaidBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="All payers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All payers</SelectItem>
                          {members.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Split type</label>
                      <Select value={expenseFilterSplitType} onValueChange={setExpenseFilterSplitType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All types</SelectItem>
                          <SelectItem value="equal">Equal</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {hasExpenseFilters && (
                      <Button variant="outline" onClick={clearExpenseFilters} className="w-full">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Search & Filter Bar - Desktop */}
            <div className="hidden sm:flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={expenseFilterPaidBy} onValueChange={setExpenseFilterPaidBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Paid by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payers</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={expenseFilterSplitType} onValueChange={setExpenseFilterSplitType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Split type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="equal">Equal</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {hasExpenseFilters && (
                <Button variant="ghost" size="icon" onClick={clearExpenseFilters} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {expenses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No expenses yet. Add one to get started!</p>
                </CardContent>
              </Card>
            ) : filteredExpenses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-2">No expenses match your filters</p>
                  <Button variant="outline" size="sm" onClick={clearExpenseFilters}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const expensePayers = getExpensePayers(expense.id);
                  const expenseSplits = getExpenseSplits(expense.id);
                  const isExpanded = expandedExpenses.has(expense.id);
                  const isEdited = expense.updated_at && new Date(expense.updated_at) > new Date(expense.created_at);

                  let paidByText = '';
                  if (expensePayers.length > 1) {
                    paidByText = `${expensePayers.length} people`;
                  } else if (expensePayers.length === 1) {
                    const payer = members.find(m => m.id === expensePayers[0].member_id);
                    paidByText = payer?.name || 'Unknown';
                  } else {
                    const paidBy = members.find(m => m.id === expense.paid_by_member_id);
                    paidByText = paidBy?.name || 'Unknown';
                  }

                  const displayDate = expense.expense_date || expense.created_at.split('T')[0];

                  return (
                    <Collapsible key={expense.id} open={isExpanded} onOpenChange={() => toggleExpenseExpanded(expense.id)}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardContent className="py-3 sm:py-4">
                            {/* Mobile-first layout */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                              <div className="flex items-start sm:items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                  <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-medium text-sm sm:text-base truncate">{expense.description}</p>
                                    {isEdited && (
                                      <Badge variant="outline" className="text-[10px] sm:text-xs">Edited</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground">
                                    {paidByText} · {format(new Date(displayDate), 'MMM d')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-2 pl-11 sm:pl-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm sm:text-base">{group.currency} {Number(expense.amount).toLocaleString()}</p>
                                  <Badge variant="outline" className="text-[10px] sm:text-xs">{expense.split_type}</Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  {isGroupAdmin && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditExpense(expense); }}>
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          Edit Expense
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete Expense
                                            </DropdownMenuItem>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This will permanently delete "{expense.description}" and all its splits. This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction 
                                                onClick={() => deleteExpense.mutate(expense.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t pt-3 space-y-3">
                            {/* Notes */}
                            {expense.notes && (
                              <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {expense.notes}
                              </div>
                            )}
                            {/* Show payers if multi-payer */}
                            {expensePayers.length > 1 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Paid by:</p>
                                <div className="space-y-1">
                                  {expensePayers.map((payer) => {
                                    const member = members.find(m => m.id === payer.member_id);
                                    return (
                                      <div key={payer.id} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{member?.name || 'Unknown'}</span>
                                        <span className="text-green-600">
                                          {group.currency} {Number(payer.amount).toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium mb-2">Split Details:</p>
                              <div className="space-y-1">
                                {expenseSplits.map((split) => {
                                  const member = members.find(m => m.id === split.member_id);
                                  return (
                                    <div key={split.id} className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">{member?.name || 'Unknown'}</span>
                                      <span>
                                        {group.currency} {Number(split.amount).toFixed(2)}
                                        {split.percentage && ` (${split.percentage}%)`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Settlements Tab */}
          <TabsContent value="settlements" className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member name..."
                  value={settlementSearch}
                  onChange={(e) => setSettlementSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={settlementFilterMember} onValueChange={setSettlementFilterMember}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Involving" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All members</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasSettlementFilters && (
                <Button variant="ghost" size="icon" onClick={clearSettlementFilters} className="shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {settlements.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <ArrowRightLeft className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No settlements recorded yet</p>
                  {settlementSuggestions.length > 0 && (
                    <Button onClick={() => setIsSettleOpen(true)} className="gap-2">
                      <ArrowRightLeft className="h-4 w-4" />
                      Record First Settlement
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : filteredSettlements.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Search className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-2">No settlements match your filters</p>
                  <Button variant="outline" size="sm" onClick={clearSettlementFilters}>
                    Clear filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredSettlements.map((s) => {
                    const fromMember = members.find(m => m.id === s.from_member_id);
                    const toMember = members.find(m => m.id === s.to_member_id);
                    const displayDate = s.settlement_date || s.settled_at.split('T')[0];
                    return (
                      <Card key={s.id}>
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <ArrowRightLeft className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{fromMember?.name || 'Unknown'}</span>
                                  <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{toMember?.name || 'Unknown'}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(displayDate), 'MMMM d, yyyy')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Recorded: {format(new Date(s.settled_at), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-green-600">
                                {group.currency} {Number(s.amount).toFixed(2)}
                              </span>
                              {isGroupAdmin && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => openEditSettlement(s)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete settlement?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will remove this settlement record. The associated transaction will also be deleted.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => deleteSettlement.mutate(s.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Total Settled Summary */}
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Total Settled</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                      {group.currency} {filteredSettlements.reduce((sum, s) => sum + Number(s.amount), 0).toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {members.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">No members yet. Add people to this group!</p>
                  <Button onClick={() => setIsAddMemberOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add First Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {members.map((member) => {
                  const memberBalance = balances.find(b => b.memberId === member.id);
                  return (
                    <Card key={member.id}>
                      <CardContent className="py-4 flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{member.name}</p>
                          {member.email && (
                            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                          </p>
                          {memberBalance && (
                            <p className={cn(
                              "text-xs font-medium",
                              memberBalance.balance > 0 && "text-green-600",
                              memberBalance.balance < 0 && "text-red-600"
                            )}>
                              Balance: {memberBalance.balance > 0 ? '+' : ''}{group.currency} {memberBalance.balance.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!member.user_id && member.email && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => sendInviteEmail.mutate({ memberId: member.id })}
                              disabled={sendInviteEmail.isPending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {member.is_creator && (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                          {member.user_id && !member.is_creator && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              Joined
                            </Badge>
                          )}
                          {!member.user_id && member.email && (
                            <Badge variant="outline" className="text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Invited
                            </Badge>
                          )}
                          {isGroupAdmin && !member.is_creator && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove member?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will remove {member.name} from the group. If they have paid for any expenses, you'll need to delete those expenses first.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => removeMember.mutate(member.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
