import { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  ArrowUpCircle, ArrowDownCircle, AlertCircle, Clock
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRecurringTransactionsDB, RecurringTransaction } from '@/hooks/useRecurringTransactionsDB';

interface DayWithTransactions {
  date: Date;
  transactions: RecurringTransaction[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export function BillsCalendar() {
  const { transactions, loading, activeTransactions } = useRecurringTransactionsDB();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add padding days from previous month
    const startDay = monthStart.getDay();
    const paddingDays: DayWithTransactions[] = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (i + 1));
      paddingDays.push({
        date,
        transactions: [],
        isCurrentMonth: false,
        isToday: false,
        isPast: isBefore(date, startOfDay(new Date())),
      });
    }
    
    // Map days with their transactions
    const monthDays: DayWithTransactions[] = days.map(date => {
      const dayTransactions = activeTransactions.filter(t => {
        const dueDate = new Date(t.next_due_date);
        return isSameDay(dueDate, date);
      });
      
      return {
        date,
        transactions: dayTransactions,
        isCurrentMonth: true,
        isToday: isToday(date),
        isPast: isBefore(date, startOfDay(new Date())),
      };
    });
    
    // Add padding days for next month to complete the grid
    const totalDays = [...paddingDays, ...monthDays];
    const remainingDays = 42 - totalDays.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(monthEnd);
      date.setDate(date.getDate() + i);
      totalDays.push({
        date,
        transactions: [],
        isCurrentMonth: false,
        isToday: false,
        isPast: false,
      });
    }
    
    return totalDays;
  }, [currentMonth, activeTransactions]);

  // Get selected day's transactions
  const selectedDayTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return activeTransactions.filter(t => {
      const dueDate = new Date(t.next_due_date);
      return isSameDay(dueDate, selectedDate);
    });
  }, [selectedDate, activeTransactions]);

  // Get upcoming transactions for the sidebar
  const upcomingTransactions = useMemo(() => {
    const today = startOfDay(new Date());
    return activeTransactions
      .filter(t => {
        const dueDate = new Date(t.next_due_date);
        return dueDate >= today;
      })
      .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
      .slice(0, 5);
  }, [activeTransactions]);

  // Get overdue transactions
  const overdueTransactions = useMemo(() => {
    const today = startOfDay(new Date());
    return activeTransactions.filter(t => {
      const dueDate = new Date(t.next_due_date);
      return dueDate < today;
    });
  }, [activeTransactions]);

  const getDayIndicatorColor = (day: DayWithTransactions) => {
    if (day.transactions.length === 0) return null;
    
    const hasExpense = day.transactions.some(t => t.type === 'expense');
    const hasIncome = day.transactions.some(t => t.type === 'income');
    
    if (hasExpense && hasIncome) return 'bg-accent';
    if (hasExpense) return day.isPast ? 'bg-destructive' : 'bg-destructive/70';
    return 'bg-primary';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-muted rounded w-1/2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Bills Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-semibold min-w-[140px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const indicatorColor = getDayIndicatorColor(day);
                const isSelected = selectedDate && isSameDay(day.date, selectedDate);
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "relative h-14 sm:h-16 p-1 rounded-lg border transition-all",
                      "hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/50",
                      day.isCurrentMonth ? 'bg-background' : 'bg-muted/30',
                      day.isToday && 'ring-2 ring-primary',
                      isSelected && 'bg-primary/10 border-primary',
                      !day.isCurrentMonth && 'opacity-40'
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      day.isToday && 'text-primary font-bold',
                      !day.isCurrentMonth && 'text-muted-foreground'
                    )}>
                      {format(day.date, 'd')}
                    </span>
                    
                    {/* Transaction indicators */}
                    {day.transactions.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                        {day.transactions.length <= 3 ? (
                          day.transactions.map((t, i) => (
                            <span
                              key={i}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                t.type === 'expense' 
                                  ? day.isPast ? 'bg-destructive' : 'bg-destructive/70'
                                  : 'bg-primary'
                              )}
                            />
                          ))
                        ) : (
                          <>
                            <span className={cn("w-1.5 h-1.5 rounded-full", indicatorColor)} />
                            <span className="text-[10px] text-muted-foreground ml-0.5">
                              +{day.transactions.length}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-destructive/70" />
                <span className="text-muted-foreground">Expense</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected day details */}
        {selectedDate && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bills scheduled for this day</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayTransactions.map(transaction => (
                    <div 
                      key={transaction.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        transaction.type === 'expense' ? 'bg-destructive/10' : 'bg-primary/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {transaction.type === 'expense' ? (
                          <ArrowDownCircle className="w-5 h-5 text-destructive" />
                        ) : (
                          <ArrowUpCircle className="w-5 h-5 text-primary" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.description || transaction.category}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {transaction.frequency} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          transaction.type === 'expense' ? 'text-destructive' : 'text-primary'
                        )}>
                          {transaction.type === 'expense' ? '-' : '+'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Overdue Alert */}
        {overdueTransactions.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                Overdue ({overdueTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {overdueTransactions.map(transaction => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-2 rounded bg-destructive/10"
                    >
                      <div>
                        <p className="text-sm font-medium">{transaction.description || transaction.category}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(transaction.next_due_date), 'MMM d')}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Upcoming */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Upcoming Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bills</p>
            ) : (
              <div className="space-y-3">
                {upcomingTransactions.map(transaction => {
                  const dueDate = new Date(transaction.next_due_date);
                  const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div 
                      key={transaction.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        {transaction.type === 'expense' ? (
                          <ArrowDownCircle className="w-4 h-4 text-destructive mt-0.5" />
                        ) : (
                          <ArrowUpCircle className="w-4 h-4 text-primary mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{transaction.description || transaction.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(dueDate, 'EEE, MMM d')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-semibold",
                          transaction.type === 'expense' ? 'text-destructive' : 'text-primary'
                        )}>
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </p>
                        <Badge 
                          variant={daysUntil <= 3 ? 'destructive' : 'secondary'} 
                          className="text-xs mt-1"
                        >
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const monthStart = startOfMonth(currentMonth);
                const monthEnd = endOfMonth(currentMonth);
                const monthTransactions = activeTransactions.filter(t => {
                  const dueDate = new Date(t.next_due_date);
                  return dueDate >= monthStart && dueDate <= monthEnd;
                });
                const totalExpenses = monthTransactions
                  .filter(t => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const totalIncome = monthTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0);
                const billCount = monthTransactions.filter(t => t.type === 'expense').length;
                
                return (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bills Due</span>
                      <span className="font-semibold">{billCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Expenses</span>
                      <span className="font-semibold text-destructive">
                        AED {totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expected Income</span>
                      <span className="font-semibold text-primary">
                        AED {totalIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Net Flow</span>
                        <span className={cn(
                          "font-bold",
                          totalIncome - totalExpenses >= 0 ? 'text-primary' : 'text-destructive'
                        )}>
                          {totalIncome - totalExpenses >= 0 ? '+' : ''}
                          AED {(totalIncome - totalExpenses).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
