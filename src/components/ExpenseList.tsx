import { useState } from 'react';
import { Plus, Trash2, Filter, CreditCard } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES, getCategoryColor } from '@/lib/expenseData';
import { formatCurrency, Currency } from '@/lib/portfolioData';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { EmptyState } from '@/components/EmptyState';
import { UtensilsCrossed, Car, Zap, Gamepad2, ShoppingBag, Heart, GraduationCap, MoreHorizontal } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  'Food & Dining': <UtensilsCrossed className="w-4 h-4" />,
  'Transport': <Car className="w-4 h-4" />,
  'Utilities': <Zap className="w-4 h-4" />,
  'Entertainment': <Gamepad2 className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Healthcare': <Heart className="w-4 h-4" />,
  'Education': <GraduationCap className="w-4 h-4" />,
  'Subscriptions': <CreditCard className="w-4 h-4" />,
  'Other': <MoreHorizontal className="w-4 h-4" />,
};

export function ExpenseList({ expenses, onAddExpense, onDeleteExpense }: ExpenseListProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { markExpenseAdded } = useOnboardingProgress();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;
    
    onAddExpense({
      category,
      description,
      amount: parseFloat(amount),
      currency: 'AED',
      date,
    });
    
    // Track onboarding progress
    markExpenseAdded();
    
    setCategory('');
    setDescription('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setOpen(false);
  };
  
  const filteredExpenses = filterCategory === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory);
  
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">All Expenses</h3>
        <div className="flex items-center gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (AED)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="What was this expense for?"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {sortedExpenses.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No expenses yet"
            description="Start tracking your spending by adding your first expense"
            actionLabel="Add Expense"
            onAction={() => setOpen(true)}
            variant="inline"
          />
        ) : (
          sortedExpenses.map(expense => {
            const color = getCategoryColor(expense.category);
            return (
              <div 
                key={expense.id}
                className="group flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {ICONS[expense.category]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{expense.description || expense.category}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{expense.category}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-medium text-destructive">
                    -{formatCurrency(expense.amount)}
                  </p>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
