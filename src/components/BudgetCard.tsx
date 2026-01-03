import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Budget, Expense, EXPENSE_CATEGORIES, getCategoryColor } from '@/lib/expenseData';
import { formatCurrency } from '@/lib/portfolioData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface BudgetCardProps {
  budgets: Budget[];
  expenses: Expense[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetCard({ budgets, expenses, onAddBudget, onDeleteBudget }: BudgetCardProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Calculate spending for current month per category
  const monthlySpending = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;
    
    onAddBudget({
      category,
      limit: parseFloat(limit),
      currency: 'AED',
      period: 'monthly',
    });
    
    setCategory('');
    setLimit('');
    setOpen(false);
  };
  
  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !budgets.find(b => b.category === cat.name)
  );
  
  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Monthly Budgets</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle>Set Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Limit (AED)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button type="submit" className="w-full">Set Budget</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {budgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No budgets set</p>
          <p className="text-xs mt-1">Add a budget to track your spending</p>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map(budget => {
            const spent = monthlySpending[budget.category] || 0;
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            const isOverBudget = spent > budget.limit;
            const color = getCategoryColor(budget.category);
            
            return (
              <div key={budget.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium">{budget.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${isOverBudget ? 'text-destructive' : ''}`}>
                      {formatCurrency(spent)} / {formatCurrency(budget.limit)}
                    </span>
                    <button
                      onClick={() => onDeleteBudget(budget.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                    style={{ 
                      '--progress-color': isOverBudget ? 'hsl(var(--destructive))' : color 
                    } as React.CSSProperties}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isOverBudget 
                    ? `Over by ${formatCurrency(spent - budget.limit)}`
                    : `${formatCurrency(budget.limit - spent)} remaining`
                  }
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
