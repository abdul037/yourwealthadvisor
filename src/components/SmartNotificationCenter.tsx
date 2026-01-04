import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, 
  AlertTriangle, Info, Calendar, TrendingUp, X,
  ExternalLink, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  bill_reminder: <Calendar className="w-4 h-4" />,
  budget_alert: <AlertTriangle className="w-4 h-4" />,
  goal_milestone: <TrendingUp className="w-4 h-4" />,
  goal_achieved: <Target className="w-4 h-4" />,
  system: <Info className="w-4 h-4" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-primary/20 text-primary',
  high: 'bg-accent/20 text-accent',
  urgent: 'bg-destructive/20 text-destructive',
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: (url: string) => void;
}

function NotificationItem({ notification, onMarkRead, onDelete, onNavigate }: NotificationItemProps) {
  const handleAction = () => {
    if (notification.action_url && onNavigate) {
      onMarkRead(notification.id);
      onNavigate(notification.action_url);
    }
  };

  const getActionLabel = () => {
    switch (notification.type) {
      case 'bill_reminder': return 'View Bills';
      case 'budget_alert': return 'View Budget';
      case 'goal_milestone': return 'View Goals';
      default: return 'View';
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border transition-colors ${
        notification.is_read ? 'bg-background' : 'bg-primary/5 border-primary/20'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${PRIORITY_COLORS[notification.priority]}`}>
          {NOTIFICATION_ICONS[notification.type] || <Bell className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{notification.title}</p>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
              <div className="flex items-center gap-1">
                {notification.action_url && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs gap-1 px-2"
                    onClick={handleAction}
                  >
                    {getActionLabel()}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}
                {!notification.is_read && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => onDelete(notification.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export function SmartNotificationCenter() {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleNavigate = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">You'll see alerts for bills, budgets, and goals here</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Widget version for dashboard
export function NotificationWidget() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const recentUnread = notifications.filter(n => !n.is_read).slice(0, 3);

  if (recentUnread.length === 0) return null;

  return (
    <Card className="border-accent/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </span>
          <Badge variant="secondary">{unreadCount} new</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentUnread.map(notification => (
          <div 
            key={notification.id}
            className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => markAsRead(notification.id)}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${PRIORITY_COLORS[notification.priority]}`}>
              {NOTIFICATION_ICONS[notification.type] || <Bell className="w-3 h-3" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{notification.title}</p>
              <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
