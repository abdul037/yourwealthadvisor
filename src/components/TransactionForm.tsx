import { useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Transaction, Currency } from '@/lib/portfolioData';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'expense' | 'investment' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('AED');
  
  const expenseCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Other'];
  const investmentCategories = ['Stocks', 'Crypto', 'Gold', 'Real Estate', 'Bonds', 'Mutual Funds', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Dividends', 'Interest', 'Other'];
  
  const categories = type === 'expense' ? expenseCategories : type === 'investment' ? investmentCategories : incomeCategories;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;
    
    onAddTransaction({
      type,
      category,
      description,
      amount: parseFloat(amount),
      currency,
      date: new Date().toISOString(),
    });
    
    setAmount('');
    setCategory('');
    setDescription('');
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {[
              { value: 'expense', label: 'Expense', icon: ArrowDownLeft, color: 'destructive' },
              { value: 'investment', label: 'Investment', icon: TrendingUp, color: 'primary' },
              { value: 'income', label: 'Income', icon: ArrowUpRight, color: 'wealth-positive' },
            ].map(item => (
              <button
                key={item.value}
                type="button"
                onClick={() => setType(item.value as any)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                  type === item.value 
                    ? item.value === 'expense' 
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : item.value === 'income'
                        ? 'border-wealth-positive bg-wealth-positive/10 text-wealth-positive'
                        : 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v: Currency) => setCurrency(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Add a note..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full">
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
