import { useState } from 'react';
import { Calendar, RefreshCw, Trash2, Play, Pause, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RecurringTransaction } from '@/hooks/useRecurringTransactionsDB';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
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

interface RecurringTransactionCardProps {
  transaction: RecurringTransaction;
  onUpdate: (id: string, updates: Partial<RecurringTransaction>) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export function RecurringTransactionCard({ 
  transaction, 
  onUpdate, 
  onDelete, 
  onGenerate 
}: RecurringTransactionCardProps) {
  const { formatAmount } = useFormattedCurrency();
  const isOverdue = new Date(transaction.next_due_date) < new Date(new Date().toDateString());
  const isDueToday = transaction.next_due_date === new Date().toISOString().split('T')[0];
  
  const daysUntilDue = Math.ceil(
    (new Date(transaction.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    if (!transaction.is_active) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (isDueToday) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Due Today</Badge>;
    }
    if (daysUntilDue <= 3) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Due Soon</Badge>;
    }
    return <Badge variant="outline">Scheduled</Badge>;
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      !transaction.is_active 
        ? 'bg-muted/30 border-border opacity-60' 
        : isOverdue 
          ? 'bg-destructive/5 border-destructive/30' 
          : 'bg-card border-border hover:shadow-md'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            transaction.type === 'income' 
              ? 'bg-wealth-positive/10' 
              : 'bg-wealth-negative/10'
          }`}>
            <RefreshCw className={`w-5 h-5 ${
              transaction.type === 'income' 
                ? 'text-wealth-positive' 
                : 'text-wealth-negative'
            }`} />
          </div>
          <div>
            <h4 className="font-semibold">
              {transaction.description || transaction.category}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge()}
              <Badge variant="outline" className="text-xs">
                {FREQUENCY_LABELS[transaction.frequency]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-lg font-bold font-mono ${
            transaction.type === 'income' 
              ? 'text-wealth-positive' 
              : 'text-wealth-negative'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
          </p>
        </div>
      </div>

      {/* Category & Subcategory */}
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        <span>{transaction.category}</span>
        {transaction.subcategory && (
          <>
            <span>•</span>
            <span>{transaction.subcategory}</span>
          </>
        )}
      </div>

      {/* Due Date Info */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <span className="text-sm">Next due: </span>
          <span className={`text-sm font-medium ${isOverdue ? 'text-destructive' : ''}`}>
            {new Date(transaction.next_due_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        {isOverdue && (
          <AlertCircle className="w-4 h-4 text-destructive" />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Switch 
            checked={transaction.is_active}
            onCheckedChange={(checked) => onUpdate(transaction.id, { is_active: checked })}
          />
          <span className="text-xs text-muted-foreground">
            {transaction.is_active ? 'Active' : 'Paused'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {transaction.is_active && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onGenerate(transaction.id)}
              className="gap-1"
            >
              <Play className="w-3 h-3" />
              Generate
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Recurring Transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this recurring transaction. 
                  Past generated transactions will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(transaction.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <p className="mt-3 text-xs text-muted-foreground italic border-t border-border pt-3">
          {transaction.notes}
        </p>
      )}
    </div>
  );
}
