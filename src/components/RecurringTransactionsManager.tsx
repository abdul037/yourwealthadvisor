import { useState } from 'react';
import { 
  Calendar, Plus, Repeat, Trash2, Edit2, 
  Play, Pause, DollarSign, TrendingUp, TrendingDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRecurringTransactions, RecurringTransactionInsert } from '@/hooks/useRecurringTransactions';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/lib/categoryData';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

function calculateNextDueDate(startDate: string, frequency: string): string {
  const start = new Date(startDate);
  const now = new Date();
  let nextDue = start;

  while (nextDue <= now) {
    switch (frequency) {
      case 'daily':
        nextDue = addDays(nextDue, 1);
        break;
      case 'weekly':
        nextDue = addWeeks(nextDue, 1);
        break;
      case 'bi-weekly':
        nextDue = addWeeks(nextDue, 2);
        break;
      case 'monthly':
        nextDue = addMonths(nextDue, 1);
        break;
      case 'quarterly':
        nextDue = addMonths(nextDue, 3);
        break;
      case 'annual':
        nextDue = addYears(nextDue, 1);
        break;
      default:
        nextDue = addMonths(nextDue, 1);
    }
  }

  return format(nextDue, 'yyyy-MM-dd');
}

export function RecurringTransactionsManager() {
  const { 
    recurringTransactions, 
    loading, 
    addRecurringTransaction, 
    deleteRecurringTransaction,
    toggleActive,
    getUpcomingBills 
  } = useRecurringTransactions();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    currency: 'AED',
    frequency: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    auto_generate: true,
    reminder_days_before: 3,
  });

  const upcomingBills = getUpcomingBills();
  const categories = formData.type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: RecurringTransactionInsert = {
      type: formData.type,
      category: formData.category,
      description: formData.description || undefined,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      frequency: formData.frequency as any,
      start_date: formData.start_date,
      next_due_date: calculateNextDueDate(formData.start_date, formData.frequency),
      is_active: true,
      auto_generate: formData.auto_generate,
      reminder_days_before: formData.reminder_days_before,
    };

    await addRecurringTransaction(transaction);
    setIsDialogOpen(false);
    setFormData({
      type: 'expense',
      category: '',
      description: '',
      amount: '',
      currency: 'AED',
      frequency: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      auto_generate: true,
      reminder_days_before: 3,
    });
  };

  const totalMonthlyIncome = recurringTransactions
    .filter(t => t.type === 'income' && t.is_active)
    .reduce((sum, t) => {
      const multiplier = t.frequency === 'annual' ? 1/12 : 
                        t.frequency === 'quarterly' ? 1/3 :
                        t.frequency === 'monthly' ? 1 :
                        t.frequency === 'bi-weekly' ? 2.17 :
                        t.frequency === 'weekly' ? 4.33 : 30;
      return sum + (t.amount * multiplier);
    }, 0);

  const totalMonthlyExpenses = recurringTransactions
    .filter(t => t.type === 'expense' && t.is_active)
    .reduce((sum, t) => {
      const multiplier = t.frequency === 'annual' ? 1/12 : 
                        t.frequency === 'quarterly' ? 1/3 :
                        t.frequency === 'monthly' ? 1 :
                        t.frequency === 'bi-weekly' ? 2.17 :
                        t.frequency === 'weekly' ? 4.33 : 30;
      return sum + (t.amount * multiplier);
    }, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wealth-positive/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-wealth-positive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Recurring Income</p>
                <p className="text-lg font-bold font-mono">AED {totalMonthlyIncome.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-wealth-negative/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-wealth-negative" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Monthly Recurring Expenses</p>
                <p className="text-lg font-bold font-mono">AED {totalMonthlyExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Upcoming Bills (7 days)</p>
                <p className="text-lg font-bold">{upcomingBills.length} bills</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-2 rounded-lg bg-background">
                  <div>
                    <p className="font-medium">{bill.description || bill.category}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(bill.next_due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="font-mono font-bold text-wealth-negative">
                    -{bill.currency} {bill.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Recurring Transactions
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Recurring
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, type: v as any, category: '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Netflix subscription"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frequency</Label>
                    <Select 
                      value={formData.frequency} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, frequency: v }))}
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
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Auto-generate transactions</Label>
                  <Switch
                    checked={formData.auto_generate}
                    onCheckedChange={(v) => setFormData(prev => ({ ...prev, auto_generate: v }))}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Recurring Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {recurringTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Repeat className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recurring transactions yet</p>
              <p className="text-sm">Add your regular bills and income sources</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringTransactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    transaction.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-wealth-positive/20 text-wealth-positive' 
                        : 'bg-wealth-negative/20 text-wealth-negative'
                    }`}>
                      {transaction.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || transaction.category}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {FREQUENCIES.find(f => f.value === transaction.frequency)?.label}
                        </Badge>
                        <span>Next: {format(new Date(transaction.next_due_date), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-mono font-bold ${
                      transaction.type === 'income' ? 'text-wealth-positive' : 'text-wealth-negative'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.currency} {transaction.amount.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(transaction.id, !transaction.is_active)}
                    >
                      {transaction.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecurringTransaction(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
