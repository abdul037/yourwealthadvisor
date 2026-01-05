import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Wallet, Save, RotateCcw, Plus } from 'lucide-react';
import { Budget, EXPENSE_CATEGORIES, getCategoryColor } from '@/lib/expenseData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

interface BudgetAllocationProps {
  monthlyIncome: number;
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
}

export function BudgetAllocation({ monthlyIncome, budgets, onUpdateBudgets, onAddBudget }: BudgetAllocationProps) {
  const { formatAmount } = useFormattedCurrency();
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    budgets.forEach(b => {
      initial[b.category] = b.limit;
    });
    return initial;
  });
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const { markBudgetCreated } = useOnboardingProgress();
  
  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
  const unallocated = monthlyIncome - totalAllocated;
  const allocationPercentage = (totalAllocated / monthlyIncome) * 100;
  
  const handleSliderChange = (category: string, value: number[]) => {
    setAllocations(prev => ({
      ...prev,
      [category]: value[0],
    }));
  };
  
  const handleSaveAllocations = () => {
    const updatedBudgets = budgets.map(budget => ({
      ...budget,
      limit: allocations[budget.category] || budget.limit,
    }));
    onUpdateBudgets(updatedBudgets);
  };
  
  const handleResetAllocations = () => {
    const initial: Record<string, number> = {};
    budgets.forEach(b => {
      initial[b.category] = b.limit;
    });
    setAllocations(initial);
  };
  
  const handleAddCategory = () => {
    if (!newCategory || !newLimit) return;
    
    onAddBudget({
      category: newCategory,
      limit: parseFloat(newLimit),
      currency: 'AED',
      period: 'monthly',
    });
    
    // Track onboarding progress
    markBudgetCreated();
    
    setAllocations(prev => ({
      ...prev,
      [newCategory]: parseFloat(newLimit),
    }));
    
    setNewCategory('');
    setNewLimit('');
    setAddDialogOpen(false);
  };
  
  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !budgets.find(b => b.category === cat.name)
  );

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Budget Allocation</h3>
            <p className="text-sm text-muted-foreground">Allocate your monthly income</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleResetAllocations}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSaveAllocations}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      {/* Income Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Income</p>
          <p className="text-lg font-bold font-mono">{formatAmount(monthlyIncome)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Allocated</p>
          <p className="text-lg font-bold font-mono text-primary">{formatAmount(totalAllocated)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Unallocated</p>
          <p className={`text-lg font-bold font-mono ${unallocated < 0 ? 'text-destructive' : 'text-wealth-positive'}`}>
            {formatAmount(unallocated)}
          </p>
        </div>
      </div>
      
      {/* Allocation Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Budget Allocation</span>
          <span className={`font-mono ${allocationPercentage > 100 ? 'text-destructive' : ''}`}>
            {allocationPercentage.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          {budgets.map((budget, index) => {
            const width = (allocations[budget.category] || 0) / monthlyIncome * 100;
            return (
              <div
                key={budget.category}
                className="h-full transition-all duration-300"
                style={{
                  width: `${width}%`,
                  backgroundColor: getCategoryColor(budget.category),
                }}
              />
            );
          })}
        </div>
      </div>
      
      {/* Category Sliders */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
        {budgets.map(budget => {
          const allocation = allocations[budget.category] || 0;
          const percentage = (allocation / monthlyIncome) * 100;
          const color = getCategoryColor(budget.category);
          
          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-sm">{budget.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{formatAmount(allocation)}</span>
                  <span className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
              <Slider
                value={[allocation]}
                min={0}
                max={monthlyIncome * 0.5}
                step={100}
                onValueChange={(value) => handleSliderChange(budget.category, value)}
                className="cursor-pointer"
              />
            </div>
          );
        })}
      </div>
      
      {/* Add New Category */}
      {availableCategories.length > 0 && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add Budget Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Budget Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <select 
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {availableCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Limit (AED)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                Add to Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
