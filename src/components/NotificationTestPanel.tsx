import { useState } from 'react';
import { 
  Bell, Play, RefreshCw, CheckCircle, AlertCircle, 
  Calendar, TrendingUp, Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';

interface ProcessingResult {
  success: boolean;
  processed?: string;
  results?: {
    billReminders: number;
    budgetAlerts: number;
    goalMilestones: number;
    errors: string[];
  };
  error?: string;
}

export function NotificationTestPanel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();
  const { refetch: fetchNotifications, notifications, unreadCount } = useNotifications();

  const triggerReminderProcessing = async () => {
    setIsProcessing(true);
    setLastResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-reminders');
      
      if (error) {
        throw error;
      }
      
      setLastResult(data as ProcessingResult);
      
      if (data?.success) {
        toast({
          title: "Processing Complete",
          description: `Created ${data.results.billReminders} bill reminders, ${data.results.budgetAlerts} budget alerts, ${data.results.goalMilestones} goal milestones`,
        });
        
        // Refresh notifications
        await fetchNotifications();
      } else {
        toast({
          title: "Processing Failed",
          description: data?.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error triggering reminders:', error);
      toast({
        title: "Error",
        description: "Failed to trigger reminder processing",
        variant: "destructive",
      });
      setLastResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const createTestNotification = async (type: 'bill_reminder' | 'budget_alert' | 'goal_milestone') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to create test notifications",
          variant: "destructive",
        });
        return;
      }

      const notifications = {
        bill_reminder: {
          title: '📅 Test Bill Reminder',
          message: 'Your test utility bill (AED 500) is due in 3 days',
          priority: 'normal' as const,
        },
        budget_alert: {
          title: '⚠️ Test Budget Alert',
          message: 'Test category has reached 75% of budget. AED 250 remaining.',
          priority: 'high' as const,
        },
        goal_milestone: {
          title: '🎯 Test Goal Milestone',
          message: 'You\'ve reached 50% of your "Test Goal" goal!',
          priority: 'normal' as const,
        },
      };

      const notif = notifications[type];

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title: notif.title,
          message: notif.message,
          priority: notif.priority,
        });

      if (error) throw error;

      toast({
        title: "Test Notification Created",
        description: `Created a ${type.replace('_', ' ')} notification`,
      });

      await fetchNotifications();
    } catch (error) {
      console.error('Error creating test notification:', error);
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Test Panel
          </CardTitle>
          <CardDescription>
            Test and trigger the automated notification system. Use this to verify 
            bill reminders, budget alerts, and goal milestones are working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Notifications</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10">
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-bold text-primary">{unreadCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Last Processed</p>
              <p className="text-sm font-medium">
                {lastResult?.processed || 'Not yet'}
              </p>
            </div>
          </div>

          {/* Trigger Processing */}
          <div className="space-y-4">
            <h4 className="font-medium">Trigger Automated Processing</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={triggerReminderProcessing}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Process All Reminders
              </Button>
              <Button 
                variant="outline"
                onClick={fetchNotifications}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Notifications
              </Button>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className={`p-4 rounded-lg ${lastResult.success ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
              <div className="flex items-center gap-2 mb-2">
                {lastResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
                <span className="font-medium">
                  {lastResult.success ? 'Processing Successful' : 'Processing Failed'}
                </span>
              </div>
              {lastResult.results && (
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{lastResult.results.billReminders}</p>
                    <p className="text-xs text-muted-foreground">Bill Reminders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{lastResult.results.budgetAlerts}</p>
                    <p className="text-xs text-muted-foreground">Budget Alerts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{lastResult.results.goalMilestones}</p>
                    <p className="text-xs text-muted-foreground">Goal Milestones</p>
                  </div>
                </div>
              )}
              {lastResult.results?.errors && lastResult.results.errors.length > 0 && (
                <div className="mt-3 text-sm text-destructive">
                  {lastResult.results.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}
              {lastResult.error && (
                <p className="text-sm text-destructive mt-2">{lastResult.error}</p>
              )}
            </div>
          )}

          {/* Create Test Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Create Test Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Manually create test notifications to verify the notification center is working.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => createTestNotification('bill_reminder')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Bill Reminder
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => createTestNotification('budget_alert')}
                className="gap-2"
              >
                <Wallet className="w-4 h-4" />
                Budget Alert
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => createTestNotification('goal_milestone')}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Goal Milestone
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">How Automated Processing Works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Bill Reminders:</strong> Created for recurring transactions due within the reminder window</li>
              <li>• <strong>Budget Alerts:</strong> Triggered when spending reaches 50%, 75%, 90%, or 100% of budget</li>
              <li>• <strong>Goal Milestones:</strong> Sent when savings goals reach 25%, 50%, 75%, or 100%</li>
              <li>• Duplicate notifications are automatically prevented</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
