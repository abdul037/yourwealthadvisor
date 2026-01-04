import { useState } from 'react';
import { RefreshCw, Plus, Calendar, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecurringTransactionsDB, CreateRecurringTransaction } from '@/hooks/useRecurringTransactionsDB';
import { RecurringTransactionCard } from '@/components/RecurringTransactionCard';
import { formatCurrency } from '@/lib/portfolioData';

const EXPENSE_CATEGORIES = [
  'Housing', 'Utilities', 'Transportation', 'Insurance', 'Healthcare',
  'Groceries', 'Entertainment', 'Subscriptions', 'Education', 'Other',
];

const INCOME_CATEGORIES = [
  'Salary', 'Rental Income', 'Dividends', 'Freelance', 'Business', 'Other',
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export function RecurringTransactionsDashboard() {
  const {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    generateTransaction,
    activeTransactions,
    upcomingExpenses,
    upcomingIncome,
    dueThisWeek,
    overdueTransactions,
  } = useRecurringTransactionsDB();

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRecurringTransaction>({
    type: 'expense',
    category: '',
    amount: 0,
    frequency: 'monthly',
    next_due_date: new Date().toISOString().split('T')[0],
    auto_generate: true,
    reminder_days_before: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category && formData.amount > 0) {
      await addTransaction(formData);
      setFormData({
        type: 'expense',
        category: '',
        amount: 0,
        frequency: 'monthly',
        next_due_date: new Date().toISOString().split('T')[0],
        auto_generate: true,
        reminder_days_before: 3,
      });
      setCreateOpen(false);
    }
  };

  const incomeTransactions = activeTransactions.filter(t => t.type === 'income');
  const expenseTransactions = activeTransactions.filter(t => t.type === 'expense');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <p className="text-2xl font-bold">{activeTransactions.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-wealth-positive/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-wealth-positive" />
            </div>
            <span className="text-sm text-muted-foreground">Monthly Income</span>
          </div>
          <p className="text-2xl font-bold font-mono text-wealth-positive">
            {formatCurrency(upcomingIncome)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-wealth-negative/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-wealth-negative" />
            </div>
            <span className="text-sm text-muted-foreground">Monthly Expenses</span>
          </div>
          <p className="text-2xl font-bold font-mono text-wealth-negative">
            {formatCurrency(upcomingExpenses)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              overdueTransactions.length > 0 ? 'bg-destructive/10' : 'bg-yellow-500/10'
            }`}>
              {overdueTransactions.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {overdueTransactions.length > 0 ? 'Overdue' : 'Due This Week'}
            </span>
          </div>
          <p className={`text-2xl font-bold ${overdueTransactions.length > 0 ? 'text-destructive' : ''}`}>
            {overdueTransactions.length > 0 ? overdueTransactions.length : dueThisWeek.length}
          </p>
        </div>
      </div>

      {/* Due This Week Alert */}
      {(dueThisWeek.length > 0 || overdueTransactions.length > 0) && (
        <div className={`p-4 rounded-xl border ${
          overdueTransactions.length > 0 
            ? 'bg-destructive/5 border-destructive/30' 
            : 'bg-yellow-500/5 border-yellow-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            {overdueTransactions.length > 0 ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Calendar className="w-5 h-5 text-yellow-500" />
            )}
            <h3 className="font-semibold">
              {overdueTransactions.length > 0 
                ? `${overdueTransactions.length} Overdue Transaction${overdueTransactions.length > 1 ? 's' : ''}`
                : `${dueThisWeek.length} Due This Week`
              }
            </h3>
          </div>
          <div className="space-y-2">
            {[...overdueTransactions, ...dueThisWeek.filter(t => !overdueTransactions.includes(t))].slice(0, 3).map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                <span className="text-sm">{t.description || t.category}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-medium ${
                    t.type === 'income' ? 'text-wealth-positive' : 'text-wealth-negative'
                  }`}>
                    {formatCurrency(t.amount)}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => generateTransaction(t.id)}>
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All ({activeTransactions.length})</TabsTrigger>
            <TabsTrigger value="expenses">Expenses ({expenseTransactions.length})</TabsTrigger>
            <TabsTrigger value="income">Income ({incomeTransactions.length})</TabsTrigger>
          </TabsList>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Recurring Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value, category: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g., Netflix, Rent, Salary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (AED) *</Label>
                    <Input 
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency *</Label>
                    <Select 
                      value={formData.frequency} 
                      onValueChange={(value: any) => setFormData({...formData, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Next Due Date *</Label>
                  <Input 
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({...formData, next_due_date: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input 
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Auto-generate</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically create transactions when due
                    </p>
                  </div>
                  <Switch 
                    checked={formData.auto_generate}
                    onCheckedChange={(checked) => setFormData({...formData, auto_generate: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reminder Days Before</Label>
                  <Input 
                    type="number"
                    value={formData.reminder_days_before || 3}
                    onChange={(e) => setFormData({...formData, reminder_days_before: parseInt(e.target.value) || 3})}
                    min="0"
                    max="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Create Recurring Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="all">
          {activeTransactions.length === 0 ? (
            <EmptyState onAdd={() => setCreateOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTransactions.map(t => (
                <RecurringTransactionCard 
                  key={t.id}
                  transaction={t}
                  onUpdate={updateTransaction}
                  onDelete={deleteTransaction}
                  onGenerate={generateTransaction}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expenses">
          {expenseTransactions.length === 0 ? (
            <EmptyState type="expense" onAdd={() => {
              setFormData({...formData, type: 'expense'});
              setCreateOpen(true);
            }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseTransactions.map(t => (
                <RecurringTransactionCard 
                  key={t.id}
                  transaction={t}
                  onUpdate={updateTransaction}
                  onDelete={deleteTransaction}
                  onGenerate={generateTransaction}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="income">
          {incomeTransactions.length === 0 ? (
            <EmptyState type="income" onAdd={() => {
              setFormData({...formData, type: 'income'});
              setCreateOpen(true);
            }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomeTransactions.map(t => (
                <RecurringTransactionCard 
                  key={t.id}
                  transaction={t}
                  onUpdate={updateTransaction}
                  onDelete={deleteTransaction}
                  onGenerate={generateTransaction}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ type, onAdd }: { type?: 'income' | 'expense'; onAdd: () => void }) {
  return (
    <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
      <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">
        No {type ? `Recurring ${type === 'income' ? 'Income' : 'Expenses'}` : 'Recurring Transactions'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add recurring transactions to track your scheduled bills and income.
      </p>
      <Button onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Add {type ? (type === 'income' ? 'Income' : 'Expense') : 'Transaction'}
      </Button>
    </div>
  );
}
