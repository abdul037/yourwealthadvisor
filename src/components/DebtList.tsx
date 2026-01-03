import { useState } from 'react';
import { Plus, Trash2, CreditCard, Car, Home, Wallet, GraduationCap, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Debt, DEBT_TYPES, getDebtTypeInfo, calculatePayoffProjection, getMonthsToPayoff } from '@/lib/debtData';
import { formatCurrency, Currency } from '@/lib/portfolioData';

interface DebtListProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id'>) => void;
  onDeleteDebt: (id: string) => void;
  onSelectDebt: (debt: Debt) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  credit_card: CreditCard,
  car_loan: Car,
  mortgage: Home,
  personal_loan: Wallet,
  student_loan: GraduationCap,
  other: MoreHorizontal,
};

export function DebtList({ debts, onAddDebt, onDeleteDebt, onSelectDebt }: DebtListProps) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card' as Debt['type'],
    principal: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    monthlyPayment: '',
    lender: '',
    currency: 'AED' as Currency,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDebt({
      name: formData.name,
      type: formData.type,
      principal: parseFloat(formData.principal),
      currentBalance: parseFloat(formData.currentBalance),
      interestRate: parseFloat(formData.interestRate),
      minimumPayment: parseFloat(formData.minimumPayment),
      monthlyPayment: parseFloat(formData.monthlyPayment),
      startDate: new Date().toISOString().split('T')[0],
      currency: formData.currency,
      lender: formData.lender,
    });
    setFormData({
      name: '',
      type: 'credit_card',
      principal: '',
      currentBalance: '',
      interestRate: '',
      minimumPayment: '',
      monthlyPayment: '',
      lender: '',
      currency: 'AED',
    });
    setOpen(false);
  };

  // Sort by interest rate (highest first)
  const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Debt Accounts</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Debt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Debt Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Car Loan"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({...formData, type: v as Debt['type']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEBT_TYPES.map(type => (
                        <SelectItem key={type.name} value={type.name}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Amount</Label>
                  <Input 
                    type="number"
                    value={formData.principal}
                    onChange={(e) => setFormData({...formData, principal: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Balance</Label>
                  <Input 
                    type="number"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({...formData, currentBalance: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Interest Rate (%)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lender</Label>
                  <Input 
                    value={formData.lender}
                    onChange={(e) => setFormData({...formData, lender: e.target.value})}
                    placeholder="e.g., Emirates NBD"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Payment</Label>
                  <Input 
                    type="number"
                    value={formData.minimumPayment}
                    onChange={(e) => setFormData({...formData, minimumPayment: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monthly Payment</Label>
                  <Input 
                    type="number"
                    value={formData.monthlyPayment}
                    onChange={(e) => setFormData({...formData, monthlyPayment: e.target.value})}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full">Add Debt</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {sortedDebts.map(debt => {
          const typeInfo = getDebtTypeInfo(debt.type);
          const Icon = ICON_MAP[debt.type] || MoreHorizontal;
          const paidPercent = ((debt.principal - debt.currentBalance) / debt.principal) * 100;
          const projection = calculatePayoffProjection(debt);
          const monthsLeft = getMonthsToPayoff(projection);
          const isExpanded = expandedId === debt.id;
          
          return (
            <div 
              key={debt.id}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mt-1"
                    style={{ backgroundColor: `${typeInfo.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: typeInfo.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{debt.name}</p>
                      {debt.interestRate > 20 && (
                        <span className="px-1.5 py-0.5 text-xs rounded bg-destructive/20 text-destructive">
                          High APR
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{debt.lender}</p>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Paid off</span>
                        <span className="font-mono">{paidPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={paidPercent} className="h-2" indicatorColor="bg-wealth-positive" />
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-mono font-bold text-destructive">
                    {formatCurrency(debt.currentBalance, debt.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {debt.interestRate}% APR
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthsLeft} months left
                  </p>
                </div>
              </div>
              
              {/* Expandable details */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : debt.id)}
                className="w-full mt-3 pt-3 border-t border-border flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isExpanded ? 'Hide Details' : 'Show Details'}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Original</p>
                      <p className="font-mono">{formatCurrency(debt.principal, debt.currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monthly</p>
                      <p className="font-mono">{formatCurrency(debt.monthlyPayment, debt.currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Minimum</p>
                      <p className="font-mono">{formatCurrency(debt.minimumPayment, debt.currency)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onSelectDebt(debt)}
                    >
                      View Payoff Plan
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteDebt(debt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
