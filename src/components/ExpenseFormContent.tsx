import { useState, useMemo, useEffect } from 'react';
import { CalendarIcon, Equal, Percent, DollarSign, ChevronDown, Users, Receipt, Wallet, MessageSquare, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ExpenseGroupMember } from '@/hooks/useExpenseGroups';

interface CustomSplitEntry {
  memberId: string;
  amount: string;
  percentage: string;
}

interface PayerFormEntry {
  memberId: string;
  amount: string;
  selected: boolean;
}

interface ExpenseFormData {
  description: string;
  amount: string;
  splitType: 'equal' | 'percentage' | 'custom';
  expenseDate: string;
  notes: string;
}

interface ExpenseFormContentProps {
  isEdit: boolean;
  expense: ExpenseFormData;
  setExpense: (expense: ExpenseFormData) => void;
  members: ExpenseGroupMember[];
  currentUserMember: ExpenseGroupMember | null;
  payerEntries: PayerFormEntry[];
  setPayerEntries: React.Dispatch<React.SetStateAction<PayerFormEntry[]>>;
  customSplits: CustomSplitEntry[];
  setCustomSplits: React.Dispatch<React.SetStateAction<CustomSplitEntry[]>>;
  currency: string;
  onSubmit: () => void;
  isPending: boolean;
}

export function ExpenseFormContent({
  isEdit,
  expense,
  setExpense,
  members,
  currentUserMember,
  payerEntries,
  setPayerEntries,
  customSplits,
  setCustomSplits,
  currency,
  onSubmit,
  isPending,
}: ExpenseFormContentProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Helper functions
  const getSelectedPayerCount = () => payerEntries.filter(p => p.selected).length;
  
  const getTotalPayerAmount = () => 
    payerEntries.filter(p => p.selected).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  
  const getTotalPercentage = () => 
    customSplits.reduce((sum, s) => sum + (parseFloat(s.percentage) || 0), 0);
  
  const getTotalCustomAmount = () => 
    customSplits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

  const updatePayerEntry = (memberId: string, field: 'amount' | 'selected', value: string | boolean) => {
    setPayerEntries(prev => prev.map(p => 
      p.memberId === memberId ? { ...p, [field]: value } : p
    ));
  };

  const updateCustomSplit = (memberId: string, field: 'amount' | 'percentage', value: string) => {
    setCustomSplits(prev => prev.map(s => 
      s.memberId === memberId ? { ...s, [field]: value } : s
    ));
  };

  // Get member initials
  const getMemberInitials = (name: string) => 
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Validation
  const validation = useMemo(() => {
    const expenseAmount = parseFloat(expense.amount) || 0;
    const hasDescription = expense.description.trim().length > 0;
    const hasValidAmount = expenseAmount > 0;
    const hasDate = expense.expenseDate.length > 0;
    const hasPayerSelected = payerEntries.some(p => p.selected);
    
    const payerAmountValid = getSelectedPayerCount() <= 1 || 
      Math.abs(getTotalPayerAmount() - expenseAmount) < 0.01;
    
    let splitValid = true;
    let splitError = '';
    if (expense.splitType === 'percentage') {
      const total = getTotalPercentage();
      splitValid = Math.abs(total - 100) < 0.01;
      if (!splitValid) splitError = `Percentages must total 100% (currently ${total.toFixed(1)}%)`;
    } else if (expense.splitType === 'custom') {
      const total = getTotalCustomAmount();
      splitValid = Math.abs(total - expenseAmount) < 0.01;
      if (!splitValid) splitError = `Amounts must equal ${currency} ${expenseAmount.toFixed(2)} (currently ${total.toFixed(2)})`;
    }

    return {
      hasDescription,
      hasValidAmount,
      hasDate,
      hasPayerSelected,
      payerAmountValid,
      splitValid,
      splitError,
      isValid: hasDescription && hasValidAmount && hasDate && hasPayerSelected && payerAmountValid && splitValid,
    };
  }, [expense, payerEntries, customSplits, currency]);

  // Quick actions
  const handleSplitEqually = () => {
    const expenseAmount = parseFloat(expense.amount) || 0;
    const perPerson = members.length > 0 ? expenseAmount / members.length : 0;
    
    // Set split type to equal
    setExpense({ ...expense, splitType: 'equal' });
    
    // Update custom splits to reflect equal distribution
    setCustomSplits(prev => prev.map(s => ({
      ...s,
      amount: perPerson.toFixed(2),
      percentage: (100 / members.length).toFixed(2),
    })));
  };

  const handleIPayFull = () => {
    if (currentUserMember) {
      const expenseAmount = expense.amount || '0';
      setPayerEntries(prev => prev.map(p => ({
        ...p,
        selected: p.memberId === currentUserMember.id,
        amount: p.memberId === currentUserMember.id ? expenseAmount : '',
      })));
    }
  };

  const handleSplitEveryoneElse = () => {
    if (currentUserMember && members.length > 1) {
      const othersCount = members.length - 1;
      const amountEach = (parseFloat(expense.amount) || 0) / othersCount;
      setCustomSplits(prev => prev.map(s => ({
        ...s,
        amount: s.memberId === currentUserMember.id ? '0' : amountEach.toFixed(2),
        percentage: s.memberId === currentUserMember.id ? '0' : (100 / othersCount).toFixed(2),
      })));
      setExpense({ ...expense, splitType: 'custom' });
    }
  };

  // Format amount on blur
  const handleAmountBlur = () => {
    const num = parseFloat(expense.amount);
    if (!isNaN(num) && num > 0) {
      setExpense({ ...expense, amount: num.toFixed(2) });
    }
    setTouched(prev => ({ ...prev, amount: true }));
  };

  // Get payer names for preview
  const getPayerNames = () => {
    const selectedPayers = payerEntries.filter(p => p.selected);
    if (selectedPayers.length === 0) return 'No one selected';
    if (selectedPayers.length === 1) {
      const member = members.find(m => m.id === selectedPayers[0].memberId);
      return member?.name || 'Unknown';
    }
    return `${selectedPayers.length} people`;
  };

  // Split type descriptions
  const splitTypeDescriptions = {
    equal: "Divide equally among all members",
    percentage: "Assign a percentage to each member (must total 100%)",
    custom: "Set exact amounts for each member",
  };

  return (
    <div className="space-y-5 pt-4">
      {/* Section 1: Expense Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Receipt className="h-4 w-4" />
          EXPENSE DETAILS
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What was this for?"
            value={expense.description}
            onChange={(e) => setExpense({ ...expense, description: e.target.value })}
            onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
            className={cn(
              !validation.hasDescription && touched.description && "border-destructive"
            )}
          />
          {!validation.hasDescription && touched.description && (
            <p className="text-xs text-destructive">Description is required</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {currency}
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                className={cn(
                  "pl-12 text-right",
                  !validation.hasValidAmount && touched.amount && "border-destructive"
                )}
                placeholder="0.00"
                value={expense.amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setExpense({ ...expense, amount: value });
                }}
                onBlur={handleAmountBlur}
              />
            </div>
            {!validation.hasValidAmount && touched.amount && (
              <p className="text-xs text-destructive">Enter a valid amount</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expense.expenseDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expense.expenseDate ? format(new Date(expense.expenseDate), 'MMM d, yyyy') : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expense.expenseDate ? new Date(expense.expenseDate) : undefined}
                  onSelect={(date) => setExpense({ 
                    ...expense, 
                    expenseDate: date ? format(date, 'yyyy-MM-dd') : '' 
                  })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Section 2: Who Paid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            WHO PAID?
          </div>
          {getSelectedPayerCount() > 1 && (
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              validation.payerAmountValid 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-destructive/10 text-destructive"
            )}>
              {currency} {getTotalPayerAmount().toFixed(2)} / {parseFloat(expense.amount || '0').toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
          {members.map((member) => {
            const entry = payerEntries.find(p => p.memberId === member.id);
            const isCurrentUser = member.id === currentUserMember?.id;
            
            return (
              <div key={member.id} className="flex items-center gap-3">
                <Checkbox
                  checked={entry?.selected || false}
                  onCheckedChange={(checked) => updatePayerEntry(member.id, 'selected', checked as boolean)}
                />
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getMemberInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm truncate">{member.name}</span>
                {isCurrentUser && (
                  <Badge variant="secondary" className="text-xs h-5">You</Badge>
                )}
                {getSelectedPayerCount() > 1 && entry?.selected && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs">{currency}</span>
                    <Input
                      type="number"
                      className="w-20 h-7 text-right text-sm"
                      value={entry?.amount || ''}
                      onChange={(e) => updatePayerEntry(member.id, 'amount', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            );
          })}
          {!validation.hasPayerSelected && (
            <p className="text-xs text-destructive mt-2">Select at least one payer</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
            💡 Select multiple payers if the bill was split at payment
          </p>
        </div>
      </div>

      {/* Section 3: Split Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="h-4 w-4" />
          HOW TO SPLIT?
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSplitEqually}
            className="text-xs h-7 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Split Equally
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleIPayFull}
            className="text-xs h-7"
            disabled={!currentUserMember}
          >
            I Paid Full
          </Button>
          {members.length > 1 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSplitEveryoneElse}
              className="text-xs h-7"
              disabled={!currentUserMember}
            >
              Everyone Else Pays
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <TooltipProvider>
            {(['equal', 'percentage', 'custom'] as const).map((type) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={expense.splitType === type ? 'default' : 'outline'}
                    className="gap-1.5"
                    onClick={() => setExpense({ ...expense, splitType: type })}
                  >
                    {type === 'equal' && <Equal className="h-4 w-4" />}
                    {type === 'percentage' && <Percent className="h-4 w-4" />}
                    {type === 'custom' && <DollarSign className="h-4 w-4" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{splitTypeDescriptions[type]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {splitTypeDescriptions[expense.splitType]}
        </p>

        {/* Percentage Split UI */}
        {expense.splitType === 'percentage' && (
          <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Split by Percentage</span>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                validation.splitValid 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {getTotalPercentage().toFixed(1)}% / 100%
              </span>
            </div>
            {members.map((member) => {
              const split = customSplits.find(s => s.memberId === member.id);
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getMemberInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate">{member.name}</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      className="w-16 h-7 text-right text-sm"
                      value={split?.percentage || ''}
                      onChange={(e) => updateCustomSplit(member.id, 'percentage', e.target.value)}
                      placeholder="0"
                    />
                    <span className="text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              );
            })}
            {!validation.splitValid && (
              <p className="text-xs text-destructive mt-2">{validation.splitError}</p>
            )}
          </div>
        )}

        {/* Custom Amount Split UI */}
        {expense.splitType === 'custom' && (
          <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Split by Amount</span>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                validation.splitValid 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-destructive/10 text-destructive"
              )}>
                {currency} {getTotalCustomAmount().toFixed(2)} / {parseFloat(expense.amount || '0').toFixed(2)}
              </span>
            </div>
            {members.map((member) => {
              const split = customSplits.find(s => s.memberId === member.id);
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getMemberInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-sm truncate">{member.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-sm">{currency}</span>
                    <Input
                      type="number"
                      className="w-20 h-7 text-right text-sm"
                      value={split?.amount || ''}
                      onChange={(e) => updateCustomSplit(member.id, 'amount', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              );
            })}
            {!validation.splitValid && (
              <p className="text-xs text-destructive mt-2">{validation.splitError}</p>
            )}
          </div>
        )}
      </div>

      {/* Section 4: Notes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          NOTES (OPTIONAL)
        </div>
        <Textarea
          placeholder="Add any additional details..."
          value={expense.notes}
          onChange={(e) => setExpense({ ...expense, notes: e.target.value })}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* Preview Section */}
      {validation.isValid && (
        <Collapsible open={showPreview} onOpenChange={setShowPreview}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showPreview && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm space-y-1.5 border">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{expense.description}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-semibold text-primary">{currency} {expense.amount}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>Paid by: {getPayerNames()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Split: {expense.splitType} among {members.length} {members.length === 1 ? 'member' : 'members'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Date: {expense.expenseDate ? format(new Date(expense.expenseDate), 'PPP') : 'Not set'}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Submit Button */}
      <Button 
        className="w-full" 
        onClick={onSubmit} 
        disabled={isPending || members.length === 0 || !validation.isValid}
      >
        {isPending 
          ? (isEdit ? 'Saving...' : 'Adding...') 
          : (isEdit ? 'Save Changes' : 'Add Expense')
        }
      </Button>
    </div>
  );
}
