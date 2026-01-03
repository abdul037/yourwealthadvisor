import { Bell, AlertTriangle, AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetAlert } from '@/hooks/useBudgetAlerts';
import { formatCurrency } from '@/lib/portfolioData';

interface NotificationCenterProps {
  alerts: BudgetAlert[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export function NotificationCenter({ alerts, onDismiss, onDismissAll }: NotificationCenterProps) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by threshold descending (most severe first)
    if (b.threshold !== a.threshold) return b.threshold - a.threshold;
    // Then by time
    return new Date(b.triggeredAt || 0).getTime() - new Date(a.triggeredAt || 0).getTime();
  });
  
  const getAlertIcon = (threshold: number) => {
    if (threshold >= 100) return <XCircle className="w-5 h-5 text-destructive" />;
    if (threshold >= 90) return <AlertCircle className="w-5 h-5 text-destructive" />;
    if (threshold >= 75) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-primary" />;
  };
  
  const getAlertBg = (threshold: number) => {
    if (threshold >= 100) return 'bg-destructive/10 border-destructive/30';
    if (threshold >= 90) return 'bg-destructive/10 border-destructive/30';
    if (threshold >= 75) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-primary/10 border-primary/30';
  };
  
  const getAlertTitle = (threshold: number) => {
    if (threshold >= 100) return 'Budget Exceeded';
    if (threshold >= 90) return 'Budget Critical (90%)';
    if (threshold >= 75) return 'Budget Warning (75%)';
    return 'Budget Milestone (50%)';
  };

  if (alerts.length === 0) {
    return (
      <div className="wealth-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Budget Notifications</h3>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-wealth-positive" />
          <p className="text-sm">No budget alerts this month</p>
          <p className="text-xs mt-1">Keep up the good spending habits!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-destructive" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-white font-bold">
              {alerts.length}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">Budget Notifications</h3>
            <p className="text-sm text-muted-foreground">{alerts.length} alert{alerts.length !== 1 ? 's' : ''} this month</p>
          </div>
        </div>
        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onDismissAll}>
            Clear All
          </Button>
        )}
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {sortedAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`p-3 rounded-lg border ${getAlertBg(alert.threshold)} group`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.threshold)}
                <div>
                  <p className="font-medium text-sm">{getAlertTitle(alert.threshold)}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{alert.category}</span>: {formatCurrency(alert.spent)} of {formatCurrency(alert.limit)}
                  </p>
                  {alert.triggeredAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.triggeredAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
