import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Users, Receipt, Share2, Copy, Check, 
  UserPlus, DollarSign, Percent, Equal, ArrowRightLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AppLayout } from '@/components/AppLayout';
import { useExpenseGroup } from '@/hooks/useExpenseGroups';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function SplitGroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { 
    group, members, expenses, balances, 
    isLoading, addMember, addExpense, settleUp 
  } = useExpenseGroup(groupId);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidByMemberId: '',
    splitType: 'equal' as 'equal' | 'percentage' | 'custom',
  });
  const [settlement, setSettlement] = useState({
    fromMemberId: '',
    toMemberId: '',
    amount: '',
  });

  const handleCopyInvite = () => {
    if (!group) return;
    const inviteUrl = `${window.location.origin}/split/join/${group.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({ title: 'Invite link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim()) return;
    await addMember.mutateAsync(newMember);
    setIsAddMemberOpen(false);
    setNewMember({ name: '', email: '' });
  };

  const handleAddExpense = async () => {
    if (!newExpense.description.trim() || !newExpense.amount || !newExpense.paidByMemberId) return;
    await addExpense.mutateAsync({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidByMemberId: newExpense.paidByMemberId,
      splitType: newExpense.splitType,
    });
    setIsAddExpenseOpen(false);
    setNewExpense({ description: '', amount: '', paidByMemberId: '', splitType: 'equal' });
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
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyInvite}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Invite'}
          </Button>
        </div>

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
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                <div className="space-y-2">
                  <Label>Paid by</Label>
                  <Select 
                    value={newExpense.paidByMemberId} 
                    onValueChange={(v) => setNewExpense({ ...newExpense, paidByMemberId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Who paid?" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button variant="secondary" className="gap-2">
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
                  const paidBy = members.find(m => m.id === expense.paid_by_member_id);
                  return (
                    <Card key={expense.id}>
                      <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Receipt className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Paid by {paidBy?.name || 'Unknown'} · {format(new Date(expense.created_at), 'MMM d')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{group.currency} {Number(expense.amount).toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">{expense.split_type}</Badge>
                        </div>
                      </CardContent>
                    </Card>
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
                  <p className="text-muted-foreground">No members yet. Add people to this group!</p>
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
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.email && (
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        )}
                      </div>
                      {member.is_creator && (
                        <Badge variant="secondary" className="ml-auto">Creator</Badge>
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
