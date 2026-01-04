import { useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { formatCurrency } from '@/lib/portfolioData';

export interface BudgetStatus {
  id: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
}

interface UseBudgetNotificationsOptions {
  budgets: Array<{ id: string; category: string; limit: number }>;
  expenses: Array<{ date: string; category: string; amount: number }>;
  enabled?: boolean;
}

const THRESHOLDS = [50, 75, 90, 100] as const;

export function useBudgetNotifications({ 
  budgets, 
  expenses, 
  enabled = true 
}: UseBudgetNotificationsOptions) {
  const triggeredAlertsRef = useRef<Set<string>>(new Set());
  const { createNotification } = useNotifications();
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Calculate spending for current month per category
  const monthlySpending = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const checkAndCreateAlerts = useCallback(async () => {
    if (!enabled) return;
    
    for (const budget of budgets) {
      const spent = monthlySpending[budget.category] || 0;
      const percentage = (spent / budget.limit) * 100;
      
      for (const threshold of THRESHOLDS) {
        const alertKey = `${budget.category}-${threshold}-${currentMonth}-${currentYear}`;
        
        if (percentage >= threshold && !triggeredAlertsRef.current.has(alertKey)) {
          triggeredAlertsRef.current.add(alertKey);
          
          // Determine alert details
          let title: string;
          let priority: 'low' | 'normal' | 'high' | 'urgent';
          let message: string;
          let toastVariant: 'default' | 'destructive' = 'default';
          
          if (threshold === 100) {
            title = '🚨 Budget Exceeded!';
            priority = 'urgent';
            message = `${budget.category} has exceeded the budget! Spent ${formatCurrency(spent)} of ${formatCurrency(budget.limit)}`;
            toastVariant = 'destructive';
          } else if (threshold === 90) {
            title = '⚠️ Budget Critical!';
            priority = 'high';
            message = `${budget.category} has reached 90% of budget. ${formatCurrency(budget.limit - spent)} remaining.`;
            toastVariant = 'destructive';
          } else if (threshold === 75) {
            title = '⚡ Budget Warning';
            priority = 'normal';
            message = `${budget.category} has reached 75% of budget. ${formatCurrency(budget.limit - spent)} remaining.`;
          } else {
            title = '📊 Budget Update';
            priority = 'low';
            message = `${budget.category} has reached 50% of budget. ${formatCurrency(budget.limit - spent)} remaining.`;
          }
          
          // Show toast notification
          toast({
            variant: toastVariant,
            title,
            description: message,
          });
          
          // Persist to database
          await createNotification({
            type: 'budget_alert',
            title,
            message,
            priority,
            related_id: budget.id,
            related_type: `budget_${threshold}`,
            action_url: '/budget',
            is_read: false,
          });
        }
      }
    }
  }, [budgets, monthlySpending, currentMonth, currentYear, enabled, createNotification]);

  // Check alerts when spending changes
  useEffect(() => {
    checkAndCreateAlerts();
  }, [checkAndCreateAlerts]);

  // Get all current budget statuses
  const getBudgetStatuses = useCallback((): BudgetStatus[] => {
    return budgets.map(budget => {
      const spent = monthlySpending[budget.category] || 0;
      const percentage = (spent / budget.limit) * 100;
      
      let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 90) status = 'critical';
      else if (percentage >= 75) status = 'warning';
      
      return {
        id: budget.id,
        category: budget.category,
        limit: budget.limit,
        spent,
        percentage,
        remaining: budget.limit - spent,
        status,
      };
    });
  }, [budgets, monthlySpending]);

  return {
    checkAndCreateAlerts,
    getBudgetStatuses,
    monthlySpending,
  };
}
