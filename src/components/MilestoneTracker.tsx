import { useState } from 'react';
import { Target, Check, Calendar, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Milestone } from '@/lib/categoryData';
import { formatCurrency, Currency } from '@/lib/portfolioData';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  currentNetWorth: number;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  onDeleteMilestone: (id: string) => void;
  onToggleAchieved: (id: string) => void;
}

export function MilestoneTracker({ 
  milestones, 
  currentNetWorth, 
  onAddMilestone, 
  onDeleteMilestone,
  onToggleAchieved 
}: MilestoneTrackerProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMilestone({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: formData.targetDate || undefined,
      achieved: false,
      currency: 'AED',
    });
    setFormData({ name: '', targetAmount: '', targetDate: '' });
    setOpen(false);
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    if (a.achieved && !b.achieved) return 1;
    if (!a.achieved && b.achieved) return -1;
    return a.targetAmount - b.targetAmount;
  });

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Financial Milestones</h3>
            <p className="text-sm text-muted-foreground">Track your goals</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Financial Milestone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Villa Down Payment"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Target Amount (AED)</Label>
                <Input 
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Input 
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                />
              </div>
              <Button type="submit" className="w-full">Add Milestone</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {sortedMilestones.map(milestone => {
          const progress = Math.min((currentNetWorth / milestone.targetAmount) * 100, 100);
          const isOnTrack = milestone.targetDate 
            ? new Date(milestone.targetDate) > new Date() 
            : true;
          
          return (
            <div 
              key={milestone.id}
              className={`p-4 rounded-lg border transition-colors group ${
                milestone.achieved 
                  ? 'bg-wealth-positive/10 border-wealth-positive/30' 
                  : 'bg-muted/50 border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {milestone.achieved ? (
                    <div className="w-6 h-6 rounded-full bg-wealth-positive/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-wealth-positive" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onToggleAchieved(milestone.id)}
                      className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 hover:border-wealth-positive transition-colors"
                    />
                  )}
                  <span className={`font-medium ${milestone.achieved ? 'line-through text-muted-foreground' : ''}`}>
                    {milestone.name}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => onDeleteMilestone(milestone.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="ml-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(currentNetWorth)} / {formatCurrency(milestone.targetAmount)}
                  </span>
                  <span className={`text-sm font-medium ${
                    milestone.achieved ? 'text-wealth-positive' : 
                    progress >= 75 ? 'text-wealth-positive' :
                    progress >= 50 ? 'text-yellow-500' : 'text-muted-foreground'
                  }`}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                
                <Progress 
                  value={progress} 
                  className="h-2"
                  indicatorColor={milestone.achieved ? 'bg-wealth-positive' : undefined}
                />
                
                {milestone.targetDate && !milestone.achieved && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Target: {new Date(milestone.targetDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                    {!isOnTrack && (
                      <span className="text-wealth-negative">• Overdue</span>
                    )}
                  </div>
                )}
                
                {milestone.achieved && milestone.achievedDate && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-wealth-positive">
                    <Check className="w-3 h-3" />
                    <span>Achieved {new Date(milestone.achievedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
