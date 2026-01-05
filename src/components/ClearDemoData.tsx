import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClearProgress {
  step: string;
  progress: number;
  completed: boolean;
}

export function ClearDemoData() {
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState<ClearProgress[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const updateProgress = (step: string, progress: number, completed: boolean = false) => {
    setClearProgress(prev => {
      const existing = prev.find(p => p.step === step);
      if (existing) {
        return prev.map(p => p.step === step ? { step, progress, completed } : p);
      }
      return [...prev, { step, progress, completed }];
    });
  };

  const clearAllData = async () => {
    setIsClearing(true);
    setClearProgress([]);
    setIsComplete(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Clear transactions
      updateProgress('Clearing transactions', 20);
      await supabase.from('transactions').delete().eq('user_id', user.id);
      updateProgress('Clearing transactions', 100, true);

      // 2. Clear income sources
      updateProgress('Clearing income sources', 20);
      await supabase.from('income_sources').delete().eq('user_id', user.id);
      updateProgress('Clearing income sources', 100, true);

      // 3. Clear budgets
      updateProgress('Clearing budgets', 20);
      await supabase.from('budgets').delete().eq('user_id', user.id);
      updateProgress('Clearing budgets', 100, true);

      // 4. Clear assets
      updateProgress('Clearing assets', 20);
      await supabase.from('assets').delete().eq('user_id', user.id);
      updateProgress('Clearing assets', 100, true);

      // 5. Clear debts
      updateProgress('Clearing debts', 20);
      await supabase.from('debts').delete().eq('user_id', user.id);
      updateProgress('Clearing debts', 100, true);

      // 6. Clear milestones (savings goals)
      updateProgress('Clearing savings goals', 20);
      await supabase.from('milestones').delete().eq('user_id', user.id);
      updateProgress('Clearing savings goals', 100, true);

      // 7. Clear recurring transactions
      updateProgress('Clearing recurring transactions', 20);
      await supabase.from('recurring_transactions').delete().eq('user_id', user.id);
      updateProgress('Clearing recurring transactions', 100, true);

      // 8. Clear notifications
      updateProgress('Clearing notifications', 20);
      await supabase.from('notifications').delete().eq('user_id', user.id);
      updateProgress('Clearing notifications', 100, true);

      // 9. Clear partners
      updateProgress('Clearing partners', 20);
      await supabase.from('partners').delete().eq('user_id', user.id);
      updateProgress('Clearing partners', 100, true);

      // 10. Reset onboarding progress
      updateProgress('Resetting progress', 50);
      await supabase
        .from('profiles')
        .update({
          onboarding_progress: {
            income_added: false,
            expense_added: false,
            budget_created: false,
            goal_created: false,
            bank_connected: false,
          },
          onboarding_completed: false,
        })
        .eq('id', user.id);
      updateProgress('Resetting progress', 100, true);

      // Clear localStorage vacation data
      localStorage.removeItem('tharwa-vacation-plans');
      localStorage.removeItem('tharwa-checklist-dismissed');

      setIsComplete(true);
      toast({
        title: 'All data cleared!',
        description: 'Your account has been reset. Refresh to see the changes.',
      });

    } catch (error: any) {
      console.error('Error clearing data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear data',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleComplete = () => {
    setOpen(false);
    window.location.reload();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
          <Trash2 className="w-4 h-4" />
          Clear All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Clear All Financial Data?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all your financial data including:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isClearing && !isComplete && (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All income sources</li>
                <li>• All expense transactions</li>
                <li>• All budgets</li>
                <li>• All assets</li>
                <li>• All debts</li>
                <li>• All savings goals</li>
                <li>• All notifications</li>
                <li>• Onboarding progress</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Make sure you want to start fresh before proceeding.
            </p>
          </div>
        )}

        {isClearing && (
          <div className="space-y-3 py-4">
            {clearProgress.map((item) => (
              <div key={item.step} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {item.completed ? (
                      <Check className="w-4 h-4 text-wealth-positive" />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                    )}
                    {item.step}
                  </span>
                  <span className="text-muted-foreground">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-1" />
              </div>
            ))}
          </div>
        )}

        {isComplete && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-wealth-positive/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-wealth-positive" />
            </div>
            <h3 className="font-semibold text-lg mb-2">All Data Cleared!</h3>
            <p className="text-sm text-muted-foreground">
              Your account has been reset. Click below to refresh and start fresh.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          {!isClearing && !isComplete && (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button 
                variant="destructive" 
                onClick={clearAllData}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </Button>
            </>
          )}
          {isComplete && (
            <Button onClick={handleComplete} className="w-full gap-2">
              <Check className="w-4 h-4" />
              Refresh & Start Fresh
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}