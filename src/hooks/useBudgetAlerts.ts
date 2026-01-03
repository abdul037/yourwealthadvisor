import { useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { Budget, Expense } from '@/lib/expenseData';
import { formatCurrency } from '@/lib/portfolioData';

export interface BudgetAlert {
  id: string;
  category: string;
  threshold: 50 | 75 | 90 | 100;
  spent: number;
  limit: number;
  percentage: number;
  triggered: boolean;
  triggeredAt?: string;
}

interface UseBudgetAlertsOptions {
  budgets: Budget[];
  expenses: Expense[];
  onAlertTriggered?: (alert: BudgetAlert) => void;
}

export function useBudgetAlerts({ budgets, expenses, onAlertTriggered }: UseBudgetAlertsOptions) {
  const triggeredAlertsRef = useRef<Set<string>>(new Set());
  
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

  const checkAlerts = useCallback(() => {
    const thresholds: (50 | 75 | 90 | 100)[] = [50, 75, 90, 100];
    const newAlerts: BudgetAlert[] = [];
    
    budgets.forEach(budget => {
      const spent = monthlySpending[budget.category] || 0;
      const percentage = (spent / budget.limit) * 100;
      
      thresholds.forEach(threshold => {
        const alertKey = `${budget.category}-${threshold}-${currentMonth}-${currentYear}`;
        
        if (percentage >= threshold && !triggeredAlertsRef.current.has(alertKey)) {
          triggeredAlertsRef.current.add(alertKey);
          
          const alert: BudgetAlert = {
            id: alertKey,
            category: budget.category,
            threshold,
            spent,
            limit: budget.limit,
            percentage,
            triggered: true,
            triggeredAt: new Date().toISOString(),
          };
          
          newAlerts.push(alert);
          
          // Show toast notification
          const getAlertStyle = () => {
            if (threshold === 100) {
              return { variant: 'destructive' as const, title: '🚨 Budget Exceeded!' };
            }
            if (threshold === 90) {
              return { variant: 'destructive' as const, title: '⚠️ Budget Critical!' };
            }
            if (threshold === 75) {
              return { variant: 'default' as const, title: '⚡ Budget Warning' };
            }
            return { variant: 'default' as const, title: '📊 Budget Update' };
          };
          
          const { variant, title } = getAlertStyle();
          
          toast({
            variant,
            title,
            description: threshold === 100
              ? `${budget.category} has exceeded the budget! Spent ${formatCurrency(spent)} of ${formatCurrency(budget.limit)}`
              : `${budget.category} has reached ${threshold}% of the budget. ${formatCurrency(budget.limit - spent)} remaining.`,
          });
          
          onAlertTriggered?.(alert);
        }
      });
    });
    
    return newAlerts;
  }, [budgets, monthlySpending, currentMonth, currentYear, onAlertTriggered]);

  // Check alerts when spending changes
  useEffect(() => {
    checkAlerts();
  }, [checkAlerts]);

  // Get all current budget statuses
  const getBudgetStatuses = useCallback(() => {
    return budgets.map(budget => {
      const spent = monthlySpending[budget.category] || 0;
      const percentage = (spent / budget.limit) * 100;
      
      let status: 'safe' | 'warning' | 'critical' | 'exceeded' = 'safe';
      if (percentage >= 100) status = 'exceeded';
      else if (percentage >= 90) status = 'critical';
      else if (percentage >= 75) status = 'warning';
      else if (percentage >= 50) status = 'safe';
      
      return {
        ...budget,
        spent,
        percentage,
        remaining: budget.limit - spent,
        status,
      };
    });
  }, [budgets, monthlySpending]);

  return {
    checkAlerts,
    getBudgetStatuses,
    monthlySpending,
  };
}
