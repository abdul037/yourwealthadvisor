import { useState } from 'react';
import { Plus, Trash2, Briefcase, Gift, Laptop, TrendingUp, Home, MoreHorizontal, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IncomeSource, INCOME_TYPES } from '@/lib/incomeData';
import { Currency } from '@/lib/portfolioData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { EmptyState } from '@/components/EmptyState';

interface IncomeListProps {
  incomeSources: IncomeSource[];
  onAddIncome: (income: Omit<IncomeSource, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  salary: Briefcase,
  bonus: Gift,
  freelance: Laptop,
  investment: TrendingUp,
  rental: Home,
  other: MoreHorizontal,
};

export function IncomeList({ incomeSources, onAddIncome, onDeleteIncome }: IncomeListProps) {
  const [open, setOpen] = useState(false);
  const { markIncomeAdded } = useOnboardingProgress();
  const { formatAmount } = useFormattedCurrency();
  const [formData, setFormData] = useState({
    partner: 'Partner 1' as 'Partner 1' | 'Partner 2' | 'Joint',
    type: 'salary' as 'salary' | 'bonus' | 'freelance' | 'investment' | 'rental' | 'other',
    description: '',
    amount: '',
    currency: 'AED' as Currency,
    frequency: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'one-time',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddIncome({
      partner: formData.partner,
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      frequency: formData.frequency,
      date: new Date().toISOString().split('T')[0],
    });
    
    // Track onboarding progress
    markIncomeAdded();
    
    setFormData({
      partner: 'Partner 1',
      type: 'salary',
      description: '',
      amount: '',
      currency: 'AED',
      frequency: 'monthly',
    });
    setOpen(false);
  };

  // Sort by date, newest first
  const sortedIncome = [...incomeSources].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentIncome = sortedIncome.slice(0, 10);

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Income</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Partner</Label>
                  <Select 
                    value={formData.partner} 
                    onValueChange={(v) => setFormData({...formData, partner: v as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Partner 1">Partner 1</SelectItem>
                      <SelectItem value="Partner 2">Partner 2</SelectItem>
                      <SelectItem value="Joint">Joint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({...formData, type: v as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_TYPES.map(type => (
                        <SelectItem key={type.name} value={type.name}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g., Monthly Salary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(v) => setFormData({...formData, currency: v as Currency})}
                  >
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
                <Label>Frequency</Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(v) => setFormData({...formData, frequency: v as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Income</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {recentIncome.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No income sources yet"
            description="Add your salary, freelance income, or other earnings to start tracking"
            actionLabel="Add Income"
            onAction={() => setOpen(true)}
            variant="inline"
          />
        ) : (
          recentIncome.map(income => {
            const Icon = ICON_MAP[income.type] || MoreHorizontal;
            const typeInfo = INCOME_TYPES.find(t => t.name === income.type);
            
            return (
              <div 
                key={income.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${typeInfo?.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: typeInfo?.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{income.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`px-1.5 py-0.5 rounded ${
                        income.partner === 'Partner 1' ? 'bg-primary/20 text-primary' :
                        income.partner === 'Partner 2' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {income.partner}
                      </span>
                      <span>•</span>
                      <span>{new Date(income.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span className="capitalize">{income.frequency}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-wealth-positive">
                    +{formatAmount(income.amount, income.currency)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => onDeleteIncome(income.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
