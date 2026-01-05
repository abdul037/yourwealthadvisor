import { useState } from 'react';
import { Target, Plus, TrendingUp, Trophy, Wallet, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSavingsGoals, CreateSavingsGoal } from '@/hooks/useSavingsGoals';
import { SavingsGoalCard } from '@/components/SavingsGoalCard';
import { SavingsGoalChart } from '@/components/SavingsGoalChart';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Skeleton } from '@/components/ui/skeleton';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Vacation',
  'Home',
  'Car',
  'Education',
  'Retirement',
  'Wedding',
  'Investment',
  'Other',
];

export function SavingsGoalsDashboard() {
  const { formatAmount } = useFormattedCurrency();
  const {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    totalTargetAmount,
    totalSavedAmount,
    activeGoals,
    achievedGoals,
    overallProgress,
  } = useSavingsGoals();

  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateSavingsGoal>({
    name: '',
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    category: '',
    priority: 'medium',
    notes: '',
  });

  const { markGoalCreated } = useOnboardingProgress();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.target_amount > 0) {
      await addGoal(formData);
      
      // Track onboarding progress
      markGoalCreated();
      
      setFormData({
        name: '',
        target_amount: 0,
        current_amount: 0,
        target_date: '',
        category: '',
        priority: 'medium',
        notes: '',
      });
      setCreateOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
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
              <Target className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Goals</span>
          </div>
          <p className="text-2xl font-bold">{goals.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-wealth-positive/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-wealth-positive" />
            </div>
            <span className="text-sm text-muted-foreground">Total Saved</span>
          </div>
          <p className="text-2xl font-bold font-mono text-wealth-positive">
            {formatAmount(totalSavedAmount)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Target Total</span>
          </div>
          <p className="text-2xl font-bold font-mono">{formatAmount(totalTargetAmount)}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm text-muted-foreground">Achieved</span>
          </div>
          <p className="text-2xl font-bold">{achievedGoals.length}</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Overall Progress</h3>
            <p className="text-sm text-muted-foreground">
              {formatAmount(totalSavedAmount)} of {formatAmount(totalTargetAmount)} saved
            </p>
          </div>
          <span className="text-2xl font-bold">{overallProgress.toFixed(0)}%</span>
        </div>
        <Progress 
          value={overallProgress} 
          className="h-4"
          indicatorColor={
            overallProgress >= 75 ? 'hsl(142, 76%, 36%)' :
            overallProgress >= 50 ? 'hsl(45, 93%, 47%)' :
            'hsl(var(--primary))'
          }
        />
      </div>

      {/* Chart */}
      {goals.length > 0 && (
        <SavingsGoalChart goals={goals} />
      )}

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="achieved">Achieved ({achievedGoals.length})</TabsTrigger>
            <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
          </TabsList>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Savings Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Emergency Fund, Vacation"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount (AED) *</Label>
                    <Input 
                      type="number"
                      value={formData.target_amount || ''}
                      onChange={(e) => setFormData({...formData, target_amount: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Starting Amount (AED)</Label>
                    <Input 
                      type="number"
                      value={formData.current_amount || ''}
                      onChange={(e) => setFormData({...formData, current_amount: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData({...formData, priority: value as 'low' | 'medium' | 'high'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input 
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="active">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Active Goals</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first savings goal to start tracking!
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map(goal => (
                <SavingsGoalCard 
                  key={goal.id}
                  goal={goal}
                  onUpdate={updateGoal}
                  onDelete={deleteGoal}
                  onAddFunds={addToGoal}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achieved">
          {achievedGoals.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Achieved Goals Yet</h3>
              <p className="text-sm text-muted-foreground">
                Keep saving! Your achievements will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievedGoals.map(goal => (
                <SavingsGoalCard 
                  key={goal.id}
                  goal={goal}
                  onUpdate={updateGoal}
                  onDelete={deleteGoal}
                  onAddFunds={addToGoal}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {goals.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Goals Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating your first savings goal!
              </p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(goal => (
                <SavingsGoalCard 
                  key={goal.id}
                  goal={goal}
                  onUpdate={updateGoal}
                  onDelete={deleteGoal}
                  onAddFunds={addToGoal}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
