import { useState } from 'react';
import { Target, Calendar, TrendingUp, Plus, Trash2, Check, Pencil, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SavingsGoal } from '@/hooks/useSavingsGoals';
import { formatCurrency } from '@/lib/portfolioData';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
  onAddFunds: (id: string, amount: number) => void;
}

export function SavingsGoalCard({ goal, onUpdate, onDelete, onAddFunds }: SavingsGoalCardProps) {
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  
  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
  
  const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && !goal.is_achieved;
  const daysRemaining = goal.target_date 
    ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProgressColor = () => {
    if (goal.is_achieved) return 'hsl(var(--wealth-positive))';
    if (progress >= 75) return 'hsl(142, 76%, 36%)';
    if (progress >= 50) return 'hsl(45, 93%, 47%)';
    if (progress >= 25) return 'hsl(25, 95%, 53%)';
    return 'hsl(var(--primary))';
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (amount > 0) {
      onAddFunds(goal.id, amount);
      setFundAmount('');
      setAddFundsOpen(false);
    }
  };

  // Calculate monthly savings needed
  const monthlyNeeded = daysRemaining && daysRemaining > 0 
    ? remaining / (daysRemaining / 30)
    : 0;

  return (
    <div className={`p-5 rounded-xl border transition-all hover:shadow-md ${
      goal.is_achieved 
        ? 'bg-wealth-positive/5 border-wealth-positive/30' 
        : 'bg-card border-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            goal.is_achieved ? 'bg-wealth-positive/20' : 'bg-primary/10'
          }`}>
            {goal.is_achieved ? (
              <Check className="w-5 h-5 text-wealth-positive" />
            ) : (
              <Target className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${goal.is_achieved ? 'line-through text-muted-foreground' : ''}`}>
              {goal.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                {goal.priority}
              </Badge>
              {goal.category && (
                <Badge variant="secondary" className="text-xs">
                  {goal.category}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!goal.is_achieved && (
            <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Funds to "{goal.name}"</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFunds} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount (AED)</Label>
                    <Input 
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Current: {formatCurrency(goal.current_amount)} • Remaining: {formatCurrency(remaining)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setFundAmount(String(remaining))}>
                      Complete Goal
                    </Button>
                    <Button type="submit" className="flex-1">
                      <Coins className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-semibold">{progress.toFixed(0)}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-3"
          indicatorColor={getProgressColor()}
        />
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Saved</p>
          <p className="font-mono font-semibold text-wealth-positive">
            {formatCurrency(goal.current_amount)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Target</p>
          <p className="font-mono font-semibold">
            {formatCurrency(goal.target_amount)}
          </p>
        </div>
      </div>

      {/* Remaining & Timeline */}
      {!goal.is_achieved && (
        <div className="space-y-2 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-mono font-medium">{formatCurrency(remaining)}</span>
          </div>
          
          {goal.target_date && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Target Date
              </span>
              <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                {new Date(goal.target_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}

          {monthlyNeeded > 0 && daysRemaining && daysRemaining > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                Monthly Needed
              </span>
              <span className="font-mono font-medium text-primary">
                {formatCurrency(monthlyNeeded)}/mo
              </span>
            </div>
          )}
        </div>
      )}

      {/* Achieved Date */}
      {goal.is_achieved && goal.achieved_date && (
        <div className="pt-3 border-t border-wealth-positive/30">
          <div className="flex items-center gap-2 text-sm text-wealth-positive">
            <Check className="w-4 h-4" />
            <span>Achieved on {new Date(goal.achieved_date).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
