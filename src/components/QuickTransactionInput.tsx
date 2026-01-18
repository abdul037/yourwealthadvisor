import { useState, useEffect, useMemo } from 'react';
import { Send, Loader2, Check, X, Edit2, Mic, MicOff, Sparkles, HelpCircle, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTransactionParser, ParsedTransaction } from '@/hooks/useTransactionParser';
import { useTransactions } from '@/hooks/useTransactions';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const EXAMPLE_INPUTS = [
  "Spent 120 on groceries",
  "Careem ride 45",
  "Got salary 25000",
  "Netflix 55 AED",
  "Coffee 18",
];

const QUICK_TEMPLATES = [
  { label: 'Salary', value: 'Got salary 25000' },
  { label: 'Groceries', value: 'Spent 120 on groceries' },
  { label: 'Ride', value: 'Careem ride 45' },
  { label: 'Investment', value: 'Invested 5000 in ETF' },
];

const KEYWORD_HELP = {
  income: ["salary", "got paid", "received", "earned", "bonus", "dividend", "refund"],
  expense: ["spent", "paid", "bought", "purchased", "taxi", "uber", "food"],
  investment: ["invested in", "bought stocks", "ETF purchase", "mutual fund", "SIP", "crypto bought"],
};

const TRANSACTION_TYPE_STYLES = {
  income: {
    badge: 'bg-primary/10 text-primary border-primary/30',
    icon: '↑',
    label: 'Income',
  },
  expense: {
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    icon: '↓',
    label: 'Expense',
  },
  investment: {
    badge: 'bg-accent/10 text-accent border-accent/30',
    icon: '→',
    label: 'Investment',
  },
};

// Keywords that suggest the user is describing an asset holding, not a transaction
const ASSET_KEYWORDS = [
  'gold', 'stocks', 'stock', 'shares', 'share', 'crypto', 'bitcoin', 'btc', 'eth', 'ethereum',
  'etf', 'bond', 'bonds', 'property', 'real estate', 'land', 'car', 'portfolio', 
  'sarwa', 'stash', 'investment account', 'pf', 'provident fund', 'insurance policy',
  'digigold', 'mutual fund', 'nps', 'ppf', 'fd', 'fixed deposit'
];

interface QuickTransactionInputProps {
  onSwitchToAsset?: (inputText: string) => void;
}

export function QuickTransactionInput({ onSwitchToAsset }: QuickTransactionInputProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<ParsedTransaction | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mightBeAsset, setMightBeAsset] = useState(false);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  
  const { parse, isLoading, error } = useTransactionParser();
  const { addTransaction } = useTransactions();
  const { markIncomeAdded, markExpenseAdded } = useOnboardingProgress();
  const { 
    isListening, 
    isSupported: isVoiceSupported, 
    transcript, 
    interimTranscript, 
    error: voiceError,
    startListening, 
    stopListening 
  } = useVoiceInput();

  const placeholder = EXAMPLE_INPUTS[Math.floor(Math.random() * EXAMPLE_INPUTS.length)];

  // Update input when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Show voice errors as toasts
  useEffect(() => {
    if (voiceError) {
      toast({
        title: 'Voice Input',
        description: voiceError,
        variant: 'destructive',
      });
    }
  }, [voiceError]);

  // Get transaction type styles
  const typeStyles = useMemo(() => {
    if (!preview) return null;
    return TRANSACTION_TYPE_STYLES[preview.type as keyof typeof TRANSACTION_TYPE_STYLES] || TRANSACTION_TYPE_STYLES.expense;
  }, [preview]);

  const submitInput = async (rawInput: string) => {
    if (!rawInput.trim() || isLoading || isListening) return;

    const parsed = await parse(rawInput);
    if (parsed) {
      setPreview(parsed);
      // Check if input might be describing an asset instead of a transaction
      const lowerInput = rawInput.toLowerCase();
      const detectedAssetKeyword = ASSET_KEYWORDS.some(kw => lowerInput.includes(kw));
      // Only suggest asset tab for expenses that look like holdings (gold, stocks, etc.)
      setMightBeAsset(detectedAssetKeyword && parsed.type === 'expense');
      // Reset date to today for new preview
      setTransactionDate(new Date());
      setIsRecurring(false);
      setNotes('');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const rawInput = input.trim();
    if (!rawInput) return;
    await submitInput(rawInput);
  };

  const handleTemplateClick = async (value: string) => {
    setInput(value);
    await submitInput(value);
  };

  const handleSwitchToAssetTab = () => {
    if (onSwitchToAsset) {
      onSwitchToAsset(input);
      // Reset state
      setPreview(null);
      setInput('');
      setMightBeAsset(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    try {
      await addTransaction.mutateAsync({
        type: preview.type,
        amount: preview.amount,
        currency: preview.currency,
        category: preview.category,
        description: preview.description,
        transaction_date: format(transactionDate, 'yyyy-MM-dd'),
        is_recurring: isRecurring,
        notes: notes.trim() || null,
      });

      // Update onboarding progress
      if (preview.type === 'income') {
        markIncomeAdded();
      } else {
        markExpenseAdded();
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setPreview(null);
        setInput('');
        setNotes('');
        setIsRecurring(false);
      }, 1500);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save transaction',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setMightBeAsset(false);
  };

  const handleEdit = () => {
    setPreview(null);
    // Keep the input so user can modify it
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-medium text-foreground">Transaction Saved!</p>
        <p className="text-sm text-muted-foreground mt-1">
          {preview?.currency} {preview?.amount.toLocaleString()} - {preview?.category}
        </p>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="text-center mb-2">
          <p className="text-sm text-muted-foreground">Confirm transaction details</p>
        </div>

        {/* Transaction Preview Card */}
        <div className={cn(
          "p-4 rounded-xl border-2 space-y-3",
          typeStyles?.badge
        )}>
          {/* Type Badge */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              typeStyles?.badge
            )}>
              <span>{typeStyles?.icon}</span>
              {typeStyles?.label}
            </span>
            <Badge variant="outline">{preview.category}</Badge>
          </div>

          {/* Amount */}
          <div className="text-center py-2">
            <span className="text-3xl font-bold font-mono">
              {preview.currency} {preview.amount.toLocaleString()}
            </span>
          </div>

          {/* Description */}
          {preview.description && (
            <p className="text-sm text-center text-muted-foreground">
              {preview.description}
            </p>
          )}
        </div>

        {/* Asset Detection Prompt */}
        {mightBeAsset && onSwitchToAsset && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-2">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Did you mean to add this as an asset?
            </p>
            <p className="text-xs text-muted-foreground">
              It looks like you're describing a holding (like gold, stocks, or crypto) rather than a transaction.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSwitchToAssetTab}
              className="w-full border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Add as Asset Instead
            </Button>
          </div>
        )}

        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="text-xs">Transaction Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !transactionDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {transactionDate ? format(transactionDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={transactionDate}
                onSelect={(date) => date && setTransactionDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="recurring" className="text-sm font-medium">Recurring Transaction</Label>
            <p className="text-xs text-muted-foreground">Mark as a regular transaction</p>
          </div>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
          <Input
            id="notes"
            placeholder="Add a note..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit} className="flex-1">
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleCancel} size="icon">
            <X className="h-4 w-4" />
          </Button>
          <Button onClick={handleConfirm} className="flex-1" disabled={addTransaction.isPending}>
            {addTransaction.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Confirm
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const displayValue = isListening && interimTranscript ? interimTranscript : input;

  return (
    <div className="relative">
      {/* Highlighted header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI-Powered</span>
        </div>
        <span className="text-xs text-muted-foreground">Type or speak naturally</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 ml-auto"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium mb-2">Keyword Examples:</p>
            <p className="text-xs"><strong>Income:</strong> {KEYWORD_HELP.income.join(', ')}</p>
            <p className="text-xs"><strong>Expense:</strong> {KEYWORD_HELP.expense.join(', ')}</p>
            <p className="text-xs"><strong>Investment:</strong> {KEYWORD_HELP.investment.join(', ')}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Keyword help panel */}
      {showHelp && (
        <Card className="mb-3 border-primary/20 bg-primary/5">
          <CardContent className="p-3 space-y-2">
            <p className="text-xs font-medium text-primary">How to phrase your transactions:</p>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <div>
                <span className="font-medium text-primary">💰 Income:</span>
                <span className="text-muted-foreground ml-1">"Got salary 25000" • "Received bonus 5000"</span>
              </div>
              <div>
                <span className="font-medium text-destructive">💸 Expense:</span>
                <span className="text-muted-foreground ml-1">"Spent 120 on groceries" • "Uber 45"</span>
              </div>
              <div>
                <span className="font-medium text-accent">📈 Investment:</span>
                <span className="text-muted-foreground ml-1">"Invested 5000 in ETF" • "Bought stocks 10000"</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main input area with glow effect */}
        <div className={cn(
          "relative p-0.5 rounded-xl transition-all duration-300",
          "bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30",
          isListening && "from-primary/50 via-accent/50 to-primary/50 shadow-lg shadow-primary/20"
        )}>
          <div className="flex gap-2 bg-background rounded-[10px] p-2">
            {/* Voice button - prominent */}
            {isVoiceSupported && (
              <Button
                type="button"
                size="icon"
                variant={isListening ? "destructive" : "secondary"}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={cn(
                  "h-10 w-10 shrink-0 transition-all",
                  isListening && "animate-pulse shadow-lg shadow-destructive/30",
                  !isListening && "hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            
            {/* Input field */}
            <div className="relative flex-1">
              <Input
                value={displayValue}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : `e.g. "${placeholder}"`}
                disabled={isLoading || isListening}
                className={cn(
                  "h-10 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-muted-foreground/60",
                  error && "text-destructive"
                )}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Send button */}
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isLoading || isListening}
              className="h-10 w-10 shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Helper text */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {QUICK_TEMPLATES.map((template) => (
            <Button
              key={template.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleTemplateClick(template.value)}
              className="h-7 rounded-full px-3 text-xs"
              disabled={isLoading || isListening}
            >
              {template.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Mic className="h-3 w-3" />
            Tap mic to speak
          </span>
          <span className="text-border">•</span>
          <span>or type & send</span>
        </div>
        
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </form>
    </div>
  );
}
