import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Users, Receipt, Share2, Copy, Check, 
  UserPlus, DollarSign, Percent, Equal, ArrowRightLeft, ChevronDown, ChevronUp, AlertCircle,
  Mail, Send, Trash2, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { AppLayout } from '@/components/AppLayout';
import { useExpenseGroup, ExpenseSplit, PayerEntry } from '@/hooks/useExpenseGroups';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    group, members, expenses, splits, payers, balances, settlementSuggestions,
    isLoading, isGroupAdmin, addMember, removeMember, addExpense, deleteExpense, settleUp, getExpensePayers 
  } = useExpenseGroup(groupId);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedExpenses, setExpandedExpenses] = useState<Set<string>>(new Set());

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    splitType: 'equal' as 'equal' | 'percentage' | 'custom',
  });
  const [payerEntries, setPayerEntries] = useState<PayerFormEntry[]>([]);
  const [customSplits, setCustomSplits] = useState<CustomSplitEntry[]>([]);
  const [settlement, setSettlement] = useState({
    fromMemberId: '',
    toMemberId: '',
    amount: '',
  });

  // Initialize payer entries when members change or dialog opens
  useEffect(() => {
    if (isAddExpenseOpen && members.length > 0) {
      setPayerEntries(members.map((m, i) => ({
        memberId: m.id,
        amount: '',
        selected: i === 0, // Default first member as payer
      })));
      setCustomSplits(members.map(m => ({
        memberId: m.id,
        amount: '',
        percentage: (100 / members.length).toFixed(2),
      })));
    }
  }, [isAddExpenseOpen, members]);

  const handleCopyInvite = () => {
    if (!group) return;
    const inviteUrl = `${window.location.origin}/split/join/${group.invite_code}`;
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
    
    // Build payers array
    let payersData: PayerEntry[] | undefined;
    if (selectedPayers.length === 1) {
      // Single payer - use full amount
      payersData = [{ memberId: selectedPayers[0].memberId, amount: expenseAmount }];
    } else {
      // Multi-payer
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
    });
    setIsAddExpenseOpen(false);
    setNewExpense({ description: '', amount: '', splitType: 'equal' });
  };

  const handleSettle = async () => {
    if (!settlement.fromMemberId || !settlement.toMemberId || !settlement.amount) return;
    await settleUp.mutateAsync({
      fromMemberId: settlement.fromMemberId,
      toMemberId: settlement.toMemberId,
      amount: parseFloat(settlement.amount),
    });
    setIsSettleOpen(false);
    setSettlement({ fromMemberId: '', toMemberId: '', amount: '' });
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

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/split')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground">{group.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyInvite}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyEmailInvite}>
              <Mail className="h-4 w-4" />
              Email
            </Button>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{group.currency} {totalExpenses.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-sm text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-sm text-muted-foreground">Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {group.currency} {members.length > 0 ? Math.round(totalExpenses / members.length).toLocaleString() : 0}
              </div>
              <p className="text-sm text-muted-foreground">Per Person</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
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
              <Button className="gap-2" disabled={hasNoMembers}>
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What was this for?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount ({group.currency})</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>

                {/* Multi-Payer Selection */}
                <div className="space-y-3 p-3 border rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Who paid?</span>
                    {getSelectedPayerCount() > 1 && (
                      <span className={cn(
                        "font-medium",
                        Math.abs(getTotalPayerAmount() - (parseFloat(newExpense.amount) || 0)) < 0.01 
                          ? "text-green-500" 
                          : "text-destructive"
                      )}>
                        Total: {group.currency} {getTotalPayerAmount().toFixed(2)} / {parseFloat(newExpense.amount || '0').toFixed(2)}
                      </span>
                    )}
                  </div>
                  {members.map((member) => {
                    const entry = payerEntries.find(p => p.memberId === member.id);
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <Checkbox
                          checked={entry?.selected || false}
                          onCheckedChange={(checked) => updatePayerEntry(member.id, 'selected', checked as boolean)}
                        />
                        <span className="flex-1 text-sm truncate">{member.name}</span>
                        {getSelectedPayerCount() > 1 && entry?.selected && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground text-xs">{group.currency}</span>
                            <Input
                              type="number"
                              className="w-24 h-8 text-right text-sm"
                              value={entry?.amount || ''}
                              onChange={(e) => updatePayerEntry(member.id, 'amount', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <Label>Split type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['equal', 'percentage', 'custom'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={newExpense.splitType === type ? 'default' : 'outline'}
                        className="gap-1"
                        onClick={() => setNewExpense({ ...newExpense, splitType: type })}
                      >
                        {type === 'equal' && <Equal className="h-4 w-4" />}
                        {type === 'percentage' && <Percent className="h-4 w-4" />}
                        {type === 'custom' && <DollarSign className="h-4 w-4" />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Percentage Split UI */}
                {newExpense.splitType === 'percentage' && (
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Split by Percentage</span>
                      <span className={cn(
                        "font-medium",
                        Math.abs(getTotalPercentage() - 100) < 0.01 ? "text-green-500" : "text-destructive"
                      )}>
                        Total: {getTotalPercentage().toFixed(1)}%
                      </span>
                    </div>
                    {members.map((member) => {
                      const split = customSplits.find(s => s.memberId === member.id);
                      return (
                        <div key={member.id} className="flex items-center gap-3">
                          <span className="flex-1 text-sm truncate">{member.name}</span>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              className="w-20 text-right"
                              value={split?.percentage || ''}
                              onChange={(e) => updateCustomSplit(member.id, 'percentage', e.target.value)}
                              placeholder="0"
                            />
                            <span className="text-muted-foreground">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Custom Amount Split UI */}
                {newExpense.splitType === 'custom' && (
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Split by Amount</span>
                      <span className={cn(
                        "font-medium",
                        Math.abs(getTotalCustomAmount() - (parseFloat(newExpense.amount) || 0)) < 0.01 ? "text-green-500" : "text-destructive"
                      )}>
                        Total: {group.currency} {getTotalCustomAmount().toFixed(2)} / {parseFloat(newExpense.amount || '0').toFixed(2)}
                      </span>
                    </div>
                    {members.map((member) => {
                      const split = customSplits.find(s => s.memberId === member.id);
                      return (
                        <div key={member.id} className="flex items-center gap-3">
                          <span className="flex-1 text-sm truncate">{member.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">{group.currency}</span>
                            <Input
                              type="number"
                              className="w-24 text-right"
                              value={split?.amount || ''}
                              onChange={(e) => updateCustomSplit(member.id, 'amount', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={handleAddExpense} 
                  disabled={addExpense.isPending || members.length === 0}
                >
                  {addExpense.isPending ? 'Adding...' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-2" disabled={hasNoMembers}>
                <ArrowRightLeft className="h-4 w-4" />
                Settle Up
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
                <Button className="w-full" onClick={handleSettle} disabled={settleUp.isPending}>
                  {settleUp.isPending ? 'Recording...' : 'Record Settlement'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balances">Balances</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-4">
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
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{balance.memberName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{balance.memberName}</p>
                          <p className="text-sm text-muted-foreground">
                            Paid: {group.currency} {balance.paid.toLocaleString()} · 
                            Share: {group.currency} {balance.owes.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-semibold",
                        balance.balance > 0 && "text-green-500",
                        balance.balance < 0 && "text-red-500"
                      )}>
                        {balance.balance > 0 ? '+' : ''}{group.currency} {balance.balance.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Smart Settlement Suggestions */}
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
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
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
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {expenses.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No expenses yet. Add one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const expensePayers = getExpensePayers(expense.id);
                  const expenseSplits = getExpenseSplits(expense.id);
                  const isExpanded = expandedExpenses.has(expense.id);

                  // Determine who paid
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

                    return (
                    <Collapsible key={expense.id} open={isExpanded} onOpenChange={() => toggleExpenseExpanded(expense.id)}>
                      <Card>
                        <CollapsibleTrigger className="w-full">
                          <CardContent className="py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Receipt className="h-5 w-5 text-primary" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium">{expense.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  Paid by {paidByText} · {format(new Date(expense.created_at), 'MMM d')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="font-semibold">{group.currency} {Number(expense.amount).toLocaleString()}</p>
                                <Badge variant="outline" className="text-xs">{expense.split_type}</Badge>
                              </div>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              {isGroupAdmin && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
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
                          </CardContent>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t pt-3 space-y-3">
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
                {members.map((member) => (
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
                        {!member.user_id && member.email && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            Invited
                          </Badge>
                        )}
                      </div>
                      {member.is_creator && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                      {member.user_id && !member.is_creator && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Joined
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
