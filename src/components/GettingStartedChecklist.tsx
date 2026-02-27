import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Circle, X, ChevronRight,
  Wallet, PiggyBank, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { DemoDataSeeder } from '@/components/DemoDataSeeder';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'transaction',
    label: 'Add your first transaction',
    description: 'Log an income or expense to get started',
    icon: Wallet,
    path: '/income',
  },
  {
    id: 'budget',
    label: 'Create a budget',
    description: 'Allocate spending limits by category',
    icon: BarChart3,
    path: '/budget',
  },
  {
    id: 'goal',
    label: 'Set a savings goal',
    description: 'Define a target to work towards',
    icon: PiggyBank,
    path: '/savings',
  },
];

const STORAGE_KEY = 'tharwa-checklist-dismissed';

export function GettingStartedChecklist() {
  const { isAuthenticated } = useUserProfile();
  const { progress: onboardingProgress } = useOnboardingProgress();
  const [dismissed, setDismissed] = useState(true); // Default true to prevent flash

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setDismissed(isDismissed);
  }, []);

  if (!isAuthenticated || dismissed) {
    return null;
  }
  
  // Calculate completed items using the reactive onboardingProgress hook
  const getItemCompleted = (item: ChecklistItem): boolean => {
    if (item.id === 'transaction') {
      return onboardingProgress.income_added || onboardingProgress.expense_added;
    }
    if (item.id === 'budget') return onboardingProgress.budget_created;
    if (item.id === 'goal') return onboardingProgress.goal_created;
    return false;
  };

  const completedCount = CHECKLIST_ITEMS.filter(getItemCompleted).length;
  const progress = (completedCount / CHECKLIST_ITEMS.length) * 100;

  // Hide if all items are complete
  if (completedCount === CHECKLIST_ITEMS.length) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Getting Started
            <span className="text-sm font-normal text-muted-foreground">
              ({completedCount}/{CHECKLIST_ITEMS.length})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <DemoDataSeeder />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Progress value={progress} className="h-1.5" />
      </CardHeader>
      <CardContent className="pt-2">
        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const isCompleted = getItemCompleted(item);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isCompleted 
                      ? "opacity-60" 
                      : "hover:bg-muted/50"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  {!isCompleted && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
