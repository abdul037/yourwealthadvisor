import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Budget, Expense, getCategoryColor } from '@/lib/expenseData';
import { formatCurrency } from '@/lib/portfolioData';
import { Progress } from '@/components/ui/progress';

interface BudgetStatus {
  id: string;
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  remaining: number;
  status: 'safe' | 'warning' | 'critical' | 'exceeded';
}

interface BudgetTrackerProps {
  budgets: Budget[];
  expenses: Expense[];
}

export function BudgetTracker({ budgets, expenses }: BudgetTrackerProps) {
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
  
  // Calculate budget statuses
  const budgetStatuses: BudgetStatus[] = budgets.map(budget => {
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
  }).sort((a, b) => b.percentage - a.percentage);
  
  const getStatusIcon = (status: BudgetStatus['status']) => {
    switch (status) {
      case 'exceeded':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-wealth-positive" />;
    }
  };
  
  const getStatusColor = (status: BudgetStatus['status']) => {
    switch (status) {
      case 'exceeded':
        return 'bg-destructive';
      case 'critical':
        return 'bg-destructive';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-wealth-positive';
    }
  };
  
  const getStatusBg = (status: BudgetStatus['status']) => {
    switch (status) {
      case 'exceeded':
        return 'bg-destructive/10 border-destructive/30';
      case 'critical':
        return 'bg-destructive/10 border-destructive/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-muted/50 border-border';
    }
  };
  
  // Summary stats
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = Object.values(monthlySpending).reduce((sum, val) => sum + val, 0);
  const overBudgetCount = budgetStatuses.filter(b => b.status === 'exceeded').length;
  const warningCount = budgetStatuses.filter(b => b.status === 'warning' || b.status === 'critical').length;

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Budget Tracking</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-wealth-positive" />
            <span className="text-muted-foreground">On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Exceeded</span>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          <p className="font-bold font-mono">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
          <p className={`font-bold font-mono ${totalSpent > totalBudget ? 'text-destructive' : ''}`}>
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Remaining</p>
          <p className={`font-bold font-mono ${totalBudget - totalSpent < 0 ? 'text-destructive' : 'text-wealth-positive'}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground mb-1">Alerts</p>
          <p className={`font-bold font-mono ${overBudgetCount > 0 ? 'text-destructive' : warningCount > 0 ? 'text-yellow-500' : 'text-wealth-positive'}`}>
            {overBudgetCount + warningCount}
          </p>
        </div>
      </div>
      
      {/* Budget Items */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {budgetStatuses.map(budget => {
          const color = getCategoryColor(budget.category);
          
          return (
            <div 
              key={budget.id}
              className={`p-4 rounded-lg border transition-colors ${getStatusBg(budget.status)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(budget.status)}
                  <div>
                    <p className="font-medium">{budget.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {budget.status === 'exceeded' 
                        ? `Over by ${formatCurrency(Math.abs(budget.remaining))}`
                        : budget.status === 'critical'
                        ? 'Critical - Review spending'
                        : budget.status === 'warning'
                        ? 'Approaching limit'
                        : `${formatCurrency(budget.remaining)} remaining`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-medium">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </p>
                  <p className={`text-sm font-mono ${
                    budget.percentage >= 100 ? 'text-destructive' :
                    budget.percentage >= 90 ? 'text-destructive' :
                    budget.percentage >= 75 ? 'text-yellow-500' : 'text-muted-foreground'
                  }`}>
                    {budget.percentage.toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <Progress 
                  value={Math.min(budget.percentage, 100)} 
                  className="h-2"
                  indicatorColor={getStatusColor(budget.status)}
                />
                {/* Threshold markers */}
                <div className="absolute top-0 left-1/2 w-px h-2 bg-muted-foreground/30" title="50%" />
                <div className="absolute top-0 left-3/4 w-px h-2 bg-yellow-500/50" title="75%" />
                <div className="absolute top-0 left-[90%] w-px h-2 bg-destructive/50" title="90%" />
              </div>
              
              {/* Threshold indicators */}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>0%</span>
                <span className={budget.percentage >= 50 ? 'text-primary' : ''}>50%</span>
                <span className={budget.percentage >= 75 ? 'text-yellow-500' : ''}>75%</span>
                <span className={budget.percentage >= 90 ? 'text-destructive' : ''}>90%</span>
                <span>100%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
